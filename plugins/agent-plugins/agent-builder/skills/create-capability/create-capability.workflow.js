export const meta = {
  // Claude execution adapter; SKILL.md owns the shared procedure.
  name: 'create-capability',
  description: 'Fan-outs for the three phases of a build where one item at a time beats one model doing all of them',
  whenToUse: 'Called by create-capability/SKILL.md at Phase 1, after Phase 2, and at Phase 6. Pass args.stage.',
  // DECLARED CEILING, per stage — a stage is one invocation, so this is the whole run. Added
  // 2026-07-28 after an earlier workflow shipped with an undeclared per-item fan-out and a high
  // document-processing cost. A fan-out whose size nobody stated is a fan-out nobody bounded.
  maxAgents: 14,
  phases: [
    { title: 'Architecture', detail: 'one agent per block option, then one composition pass that separates job modules, optional agent shell, and packaging. Fixed at 6 agents. sonnet, effort high' },
    { title: 'Audit', detail: 'one agent per required spec section, graded against rubric.md — sonnet, low' },
    { title: 'Done-checks', detail: 'the checks in control-plane/DEFINITION-OF-DONE.md partitioned across at most 13 workers, one reader agent first — sonnet, low. Sized by the ceiling, never by how many checks exist, so nothing is dropped at any count' },
  ],
}

// Per-item fan-out is correct for the AUDIT stage and was wrong in the retired verifier, for one reason:
// spec sections do not share an expensive read — each is its own small artifact. The done-checks
// stage is different again and is batched (see stage 3): its items are few and cheap, but there
// are more of them than the ceiling allows agents, so the fan-out is sized by the ceiling and the
// items are partitioned across it. Before adding a stage, ask what the items share — if they all
// open the same file, batch by that file; if there can be more of them than the ceiling, partition.
// The retired verifier's measured failure and the replacement rule are preserved in control-plane/DECISION-LOG.md.

// `meta` is parsed separately and STRIPPED from this body before it runs, so `meta.maxAgents` is
// not in scope here — an earlier workflow failed on that exact reference. Restate it.
// If you change one, change both.
const MAX_AGENTS = 14

// Derived, never a second literal. Every fan-out stage runs one reader agent first, so the cap is
// the ceiling minus that reader. It was a hardcoded 12 until 2026-07-28, while `control-plane/DEFINITION-OF-DONE.md`
// carried 13 checks — so check 13, the one that measures what a run COSTS, was the single check
// this workflow silently declined to assess. A cap that is not derived from the ceiling drifts the
// moment the thing it counts grows by one.
const FANOUT_CAP = MAX_AGENTS - 1

// Split `items` into at most `cap` NON-EMPTY batches, sizes differing by at most one. Batches are
// contiguous so a worker's batch reads as a range. This replaced `.slice(0, cap)` on 2026-07-28:
// truncation makes the agent count a function of how many items exist, which means the ceiling is
// enforced by throwing work away. Partitioning makes it a function of the ceiling instead.
function partition(items, cap) {
  const workers = Math.min(cap, items.length)
  const base = Math.floor(items.length / workers)
  const rem = items.length % workers
  const out = []
  for (let b = 0, i = 0; b < workers; b++) {
    const size = base + (b < rem ? 1 : 0)
    out.push(items.slice(i, i + size))
    i += size
  }
  return out
}

// Did every assigned item come back exactly once? Settled by ARITHMETIC ON IDS, never by reading a
// worker's prose. A model asked whether it finished its batch says yes: a verifier run on
// 2026-07-28 reported `ungraded: 0` on a run that graded nothing, because the check read the
// agents' own notes. Malformed rows are counted rather than skipped — a row this cannot parse is a
// row nobody graded, and silently dropping it would restore the exact bug.
function coverage(assignedIds, results, idKey, validVerdicts, verdictKey) {
  const assigned = new Set(assignedIds)
  const counts = new Map()
  const rows = []
  const invented = []
  let malformed = 0
  for (const res of results) {
    if (!res) continue                      // a dead worker leaves its whole batch missing, below
    for (const row of (res.results || [])) {
      if (!row || !Number.isInteger(row[idKey]) || !validVerdicts.includes(row[verdictKey])) { malformed++; continue }
      if (!assigned.has(row[idKey])) { invented.push(row[idKey]); continue }
      counts.set(row[idKey], (counts.get(row[idKey]) || 0) + 1)
      if (counts.get(row[idKey]) === 1) rows.push(row)   // first wins; the repeat is named below
    }
  }
  rows.sort((a, b) => a[idKey] - b[idKey])
  const missing = [...assigned].filter(n => !counts.has(n)).sort((a, b) => a - b)
  const duplicated = [...counts].filter(([, c]) => c > 1).map(([k]) => k).sort((a, b) => a - b)
  const problems = []
  if (missing.length) problems.push(`${missing.length} never came back (${missing.join(', ')})`)
  if (duplicated.length) problems.push(`${duplicated.length} returned more than once (${duplicated.join(', ')})`)
  if (invented.length) problems.push(`${invented.length} returned that were never assigned (${invented.join(', ')})`)
  if (malformed) problems.push(`${malformed} row(s) malformed`)
  return { rows, missing, duplicated, invented, malformed, problems,
           complete: !missing.length && !duplicated.length && !invented.length && !malformed }
}

// ── inputs ───────────────────────────────────────────────────────────────────
// { stage: 'architecture', request: "<what Tiên asked for>" }
// { stage: 'audit',        spec: "<abs path>", template: "<abs path>" }
// { stage: 'done-checks',  artifact: "<what was built>", checks: "<abs path to control-plane/DEFINITION-OF-DONE.md>" }

const input = args || {}
const STAGE = input.stage
// RELATIVE, on purpose. An absolute path here made the skill read its grading standard from the
// original repo when run in a git worktree or from a copied package — Tiên, 2026-07-28:
// *"hiện tại working wrong workspace"*. Every path in this file resolves against the working
// directory of the session that invoked it.
const RUBRIC = input.rubric || 'plugins/agent-plugins/agent-builder/skills/evaluate-capability/rubric.md'

if (!STAGE) {
  return { error: "No stage given. Pass { stage: 'architecture' | 'audit' | 'done-checks' } — see meta.phases." }
}

// ── stage 1 · architecture ───────────────────────────────────────────────────
// Five mechanisms, one agent each, and each agent sees ONLY its own option. That is
// the point: an agent holding all five ranks them and the ranking drifts toward
// the most capable one. An agent holding one answers a narrower question it can
// actually be wrong about.
//
// A sixth pass does a different job: it decides whether the request contains
// several reusable jobs, whether those skills need an agent shell, and whether
// they need plugin packaging. It receives the mechanism verdicts as evidence but
// may not merge the resulting skills into the agent body. Agent and skill are
// composable; they are not mutually exclusive rungs.
//
// Tier, and why it is stated through `effort` rather than `model`. This is reasoning
// over control-plane/GUARDRAILS.md and the evidence explainer, and a misread rule here mis-shapes
// everything downstream — so it wants the most care of any stage in this file.
//
// It cannot get that from `model`. `~/.claude/settings.json` sets
// `env.CLAUDE_CODE_SUBAGENT_MODEL=sonnet`, which beats both agent frontmatter and the
// `model:` passed here, in both directions — measured 2026-07-27. Until 2026-07-28
// these five calls named no model at all and the comment here claimed they ran at the
// session tier; they never did, and no reader could have known. `effort` is not pinned,
// so it is the lever that still works. `model: 'sonnet'` is written to match what
// actually runs, not to request it.

const OPTIONS = [
  { key: 'permission-rule', holds: 'the program',
    when: 'a tool must be blocked or surfaced every time, in every session' },
  { key: 'hook', holds: 'the program — but it needs a script, which is a recorded exception in CLAUDE.md and control-plane/DECISION-LOG.md in the same change',
    when: 'something must happen every time and no permission rule can express it' },
  { key: 'locked-skill', holds: '`disable-model-invocation: true`',
    when: 'a procedure only Tiên may start' },
  { key: 'skill', holds: 'nothing — convention only',
    when: 'knowledge or a procedure Claude loads when the work matches' },
  { key: 'agent', holds: '`tools:` bounds the whole session',
    when: 'open-ended judgment needing its own context window and session-wide tool bounds' },
]

if (STAGE === 'architecture') {
  if (!input.request) return { error: 'stage architecture needs { request: "<what Tiên asked for>" }' }
  phase('Architecture')

  const verdicts = await parallel(OPTIONS.map(o => () =>
    agent(
      `Read the grading standard first, the section "Grading an architecture option":\n${RUBRIC}\n\n` +
      `You are assessing ONE block option against ONE request. You do not know what the other ` +
      `options were judged to be, and you must not speculate about them.\n\n` +
      `THE REQUEST: ${input.request}\n\n` +
      `YOUR OPTION: ${o.key}\n` +
      `Reach for it when: ${o.when}\n` +
      `What actually holds it: ${o.holds}\n\n` +
      `One question: can THIS option do this job? Return INADEQUATE only if you can name the ` +
      `specific thing it cannot do. Uncertainty returns ADEQUATE — the measured failure rate of ` +
      `multi-agent frameworks is 41-86.7% and the recorded bias in this system is reaching for an ` +
      `agent when a skill would do. "Tiên asked for an agent" is not a reason.`,
      { label: `arch:${o.key}`, phase: 'Architecture', model: 'sonnet', effort: 'high', schema: {
          type: 'object',
          properties: {
            option: { type: 'string' },
            verdict: { enum: ['ADEQUATE', 'INADEQUATE'] },
            heldBy: { enum: ['the program', 'a frontmatter field', 'nothing — convention only'] },
            cannotDo: { type: 'string', description: 'INADEQUATE only: the specific thing. Empty otherwise.' },
            note: { type: 'string' },
          },
          required: ['option', 'verdict', 'heldBy', 'cannotDo', 'note'],
          additionalProperties: false,
        } }
    )
  ))

  const rows = verdicts.filter(Boolean)
  // The list is ordered simplest-first and the rule is STOP AT THE FIRST THAT FITS.
  const order = OPTIONS.map(o => o.key)
  const simplest = order.find(k => rows.some(r => r.option === k && r.verdict === 'ADEQUATE'))

  log(simplest ? `simplest adequate option: ${simplest}` : 'no option returned ADEQUATE — that is a finding, not a licence to pick the biggest')

  const composition = await agent(
    `Read the grading standard first, the section "Grading architecture composition":\n${RUBRIC}\n\n` +
    `THE REQUEST: ${input.request}\n\n` +
    `MECHANISM VERDICTS: ${JSON.stringify(rows)}\n\n` +
    `Separate three decisions. First, identify the independently reusable recurring jobs; each ` +
    `job may become one skill. Second, decide whether those jobs need one agent shell for its own ` +
    `context, session-wide tool bounds, or orchestration. Third, decide whether the blocks need ` +
    `to ship together as a plugin now. One agent may use multiple skills. The agent owns ` +
    `orchestration and handoffs; each skill owns one reusable job. Do not collapse the jobs into ` +
    `the agent body, and do not add a workflow script or rubric without a requirement-specific reason.`,
    { label: 'arch:composition', phase: 'Architecture', model: 'sonnet', effort: 'high', schema: {
        type: 'object',
        properties: {
          jobs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                responsibility: { type: 'string' },
                mechanism: { enum: ['permission-rule', 'hook', 'locked-skill', 'skill'] },
              },
              required: ['name', 'responsibility', 'mechanism'],
              additionalProperties: false,
            },
          },
          agentShell: { enum: ['required', 'not-required'] },
          agentReason: { type: 'string' },
          packageNow: { enum: ['required', 'not-required'] },
          packageReason: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['jobs', 'agentShell', 'agentReason', 'packageNow', 'packageReason', 'note'],
        additionalProperties: false,
      } }
  )

  return {
    stage: 'architecture',
    request: input.request,
    recommend: simplest || null,
    rows,
    composition,
    rule: 'Choose the least complex adequate mechanism per recurring job. Decide the optional agent shell and plugin packaging separately; one agent may compose multiple skills.',
  }
}

// ── stage 2 · audit the spec ─────────────────────────────────────────────────
// One agent per required section. The builder wrote the spec; a builder grading
// its own spec is the doer grading itself, which control-plane/GUARDRAILS.md §6 and the mental model
// both forbid by name.
//
// sonnet/low: the standard lives in rubric.md and the template owns the field
// list, so this is "open two files and compare", not judgment.

if (STAGE === 'audit') {
  if (!input.spec || !input.template) {
    return { error: 'stage audit needs { spec: "<abs path>", template: "<abs path>" }' }
  }
  phase('Audit')

  // The template owns the field list — read it rather than hardcoding one here.
  // A list hardcoded in this script drifted from the templates within a day the
  // last time one was written down twice.
  const sections = await agent(
    `Read this template and list every REQUIRED section a filled-in spec must carry:\n${input.template}\n\n` +
    `Return the section headings exactly as the template words them. Do not invent, merge, or ` +
    `skip any. If the template marks a section conditional, include it and say what the condition is.`,
    { label: 'read-template', phase: 'Audit', model: 'sonnet', effort: 'low', schema: {
        type: 'object',
        properties: {
          sections: { type: 'array', items: { type: 'object', properties: {
            heading: { type: 'string' },
            conditional: { type: 'string', description: 'the condition, or empty string if always required' },
          }, required: ['heading', 'conditional'], additionalProperties: false } },
        },
        required: ['sections'],
        additionalProperties: false,
      } }
  )

  // Index every section BEFORE batching. Coverage is then arithmetic on integers, never on
  // heading strings — a model asked to echo a heading rewords it, and a string comparison would
  // read that as a missing section. The index is the identity; the heading is only for reading.
  const allSections = ((sections && sections.sections) || [])
    .filter(s => s && typeof s.heading === 'string' && s.heading.trim())
    .map((s, i) => ({ ...s, index: i + 1 }))
  if (!allSections.length) {
    return { stage: 'audit', complete: false, passes: false,
             error: 'the template yielded no sections — read it by hand before trusting this' }
  }

  // Partitioned, not truncated — same reason as stage 3. `project-repo-standard.md` carries 16
  // sections against a cap of 13, so the old slice dropped three of them on a template that is
  // in this repo today.
  const secBatches = partition(allSections, FANOUT_CAP)
  const droppedSections = []
  log(`${allSections.length} required sections across ${secBatches.length} worker(s) (cap ${FANOUT_CAP}, ceiling ${MAX_AGENTS} incl. the reader) — max ${Math.max(...secBatches.map(b => b.length))} per worker, nothing dropped`)

  const graded = await parallel(secBatches.map(batch => () =>
    agent(
      `Read the grading standard in full first:\n${RUBRIC}\n\n` +
      `Grade EVERY section in your batch, against ONE spec. Open both files before deciding ` +
      `anything.\n\n` +
      `SPEC UNDER GRADING: ${input.spec}\n` +
      `TEMPLATE IT MUST SATISFY: ${input.template}\n\n` +
      `SECTIONS TO GRADE: ${batch.map(s => s.index).join(', ')}\n` +
      `Return exactly one row per index above — no more, no fewer, and no index that is not ` +
      `listed. Saying in a note that you covered them all is not coverage; the rows are.\n\n` +
      batch.map(s => `--- SECTION ${s.index} · ${s.heading}` +
        (s.conditional ? `\n    This section is conditional: ${s.conditional}. If the condition does not apply, return FILLED and say so in the note.` : '')
      ).join('\n') +
      `\n\nApply the rubric, including its hard-failure list — a HAZARD fails the whole proposal, ` +
      `not just its own section, so do not soften one to keep the average up.`,
      { label: `audit:${batch.map(s => s.index).join(',').slice(0, 24)}`, phase: 'Audit',
        model: 'sonnet', effort: 'low', schema: {
          type: 'object',
          properties: {
            results: { type: 'array', items: { type: 'object', properties: {
              index: { type: 'integer' },
              item: { type: 'string' },
              verdict: { enum: ['FILLED', 'EMPTY', 'NA-UNJUSTIFIED', 'PLACEHOLDER', 'HAZARD'] },
              quote: { type: 'string' },
              rule: { type: 'string', description: 'HAZARD only: the rule and its section number. Empty otherwise.' },
              note: { type: 'string' },
            }, required: ['index', 'item', 'verdict', 'quote', 'rule', 'note'], additionalProperties: false } },
          },
          required: ['results'],
          additionalProperties: false,
        } }
    )
  ))

  const VERDICTS = ['FILLED', 'EMPTY', 'NA-UNJUSTIFIED', 'PLACEHOLDER', 'HAZARD']
  const cov = coverage(allSections.map(s => s.index), graded, 'index', VERDICTS, 'verdict')
  const rows = cov.rows.map(r => ({ ...r, heading: (allSections.find(s => s.index === r.index) || {}).heading || '' }))
  const hazards = rows.filter(r => r.verdict === 'HAZARD')
  const tally = {}
  for (const r of rows) tally[r.verdict] = (tally[r.verdict] || 0) + 1

  // `passes` may never be computed over a partial list. Until 2026-07-28 it was, and
  // `droppedSections` never left this function — so a spec whose unaudited sections were the
  // empty ones came back `passes: true` and looked identical to one that had been read in full.
  // A result that omits what it skipped is not a smaller result, it is a wrong one.
  const complete = cov.complete && droppedSections.length === 0
  const missingHeadings = cov.missing.map(i => (allSections.find(s => s.index === i) || {}).heading || `#${i}`)
  log(complete
    ? `COVERAGE: ${rows.length}/${allSections.length} sections graded exactly once across ${secBatches.length} worker(s).`
    : `COVERAGE INCOMPLETE — ${cov.problems.join('; ')}. Reported, never counted as graded.`)

  return {
    stage: 'audit',
    spec: input.spec,
    sections: rows.length,
    sectionsFound: allSections.length,
    workers: secBatches.length,
    agentsUsed: secBatches.length + 1,
    agentCeiling: MAX_AGENTS,
    droppedSections,
    missingSections: missingHeadings,
    duplicatedSections: cov.duplicated,
    inventedSections: cov.invented,
    malformedRows: cov.malformed,
    complete,
    tally,
    passes: complete && hazards.length === 0 && rows.every(r => r.verdict === 'FILLED'),
    hazards,
    rows,
    note: hazards.length
      ? 'HAZARD present — the proposal fails regardless of the other sections.'
      : (complete ? '' : `INCOMPLETE — ${cov.problems.join('; ')}. passes is false for that reason alone; settle coverage before reading this as a result.`),
  }
}

// ── stage 3 · done-checks ────────────────────────────────────────────────────
// BALANCED BATCHING, not one agent per check. `control-plane/DEFINITION-OF-DONE.md` grows; the ceiling
// does not. One agent per check meant the agent count was set by however many
// checks happened to exist, so the stage truncated at the cap — and on 2026-07-28
// the cap was 12 against 13 checks, which made the check that measures run cost
// the single one it declined to assess. Adding check 14 the same day would have
// repeated it exactly.
//
// So the fan-out is now sized by the CEILING and the checks are partitioned across
// it: at most FANOUT_CAP non-empty worker batches, one worker assessing several
// checks when there are more checks than workers. Nothing is ever dropped for any
// number of checks, and no check is special-cased.
//
// Mechanical work, and the honest answer for most checks is NOT-RUN — they are
// shell one-liners, and an agent asked to assess one it cannot run must say so
// rather than reporting a result.

if (STAGE === 'done-checks') {
  if (!input.artifact || !input.checks) {
    return { error: 'stage done-checks needs { artifact: "<what was built>", checks: "<abs path to control-plane/DEFINITION-OF-DONE.md>" }' }
  }
  phase('Done-checks')

  const found = await agent(
    `Read ${input.checks} and list every numbered check, with the exact shell command each one ` +
    `carries. Do not summarise the commands — copy them.`,
    { label: 'read-checks', phase: 'Done-checks', model: 'sonnet', effort: 'low', schema: {
        type: 'object',
        properties: {
          checks: { type: 'array', items: { type: 'object', properties: {
            number: { type: 'integer' }, title: { type: 'string' }, command: { type: 'string' },
          }, required: ['number', 'title', 'command'], additionalProperties: false } },
        },
        required: ['checks'],
        additionalProperties: false,
      } }
  )

  // Validate what the reader returned BEFORE building coverage from it. A duplicate or a
  // non-integer number here would corrupt every count downstream, and the reader is a model.
  const discovered = (found && found.checks) || []
  const byNumber = new Map()
  const malformedDiscovered = []
  for (const c of discovered) {
    if (!c || !Number.isInteger(c.number)) { malformedDiscovered.push(c); continue }
    if (!byNumber.has(c.number)) byNumber.set(c.number, c)
  }
  const allChecks = [...byNumber.values()].sort((a, b) => a.number - b.number)
  if (!allChecks.length) {
    return { stage: 'done-checks', complete: false, passes: false,
             error: 'no checks parsed — read control-plane/DEFINITION-OF-DONE.md by hand' }
  }

  const batches = partition(allChecks, FANOUT_CAP)
  // Batching covers every discovered check, so nothing is ever truncated. The field stays in the
  // result because callers read it, and it must be empty for valid input at any number of checks.
  const droppedChecks = []
  log(`${allChecks.length} checks across ${batches.length} worker(s) (cap ${FANOUT_CAP}, ceiling ${MAX_AGENTS} incl. the reader) — max ${Math.max(...batches.map(b => b.length))} per worker, nothing dropped`)

  const assessed = await parallel(batches.map((batch, bi) => () =>
    agent(
      `Assess EVERY check in your batch against ONE artifact. Read each check's own wording at ` +
      `${input.checks} first.\n\n` +
      `ARTIFACT: ${input.artifact}\n\n` +
      `CHECKS TO ASSESS: ${batch.map(c => c.number).join(', ')}\n` +
      `Return exactly one row per number above — no more, no fewer, and no number that is not ` +
      `listed. Saying in a note that you covered them all is not coverage; the rows are.\n\n` +
      batch.map(c => `--- CHECK ${c.number} · ${c.title}\nITS COMMAND: ${c.command}`).join('\n') +
      `\n\nReproduce each check ONLY where your own tools honestly can — a file exists, a line is ` +
      `present. **If you cannot run it, return NOT-RUN and quote the command for Tiên.** Never ` +
      `report a result for a command you did not run: a verification that has not been run is a ` +
      `claim, not a check. An empty command result proves the command ran, not that the thing is absent.`,
      { label: `checks:${batch.map(c => c.number).join(',').slice(0, 24)}`, phase: 'Done-checks',
        model: 'sonnet', effort: 'low', schema: {
          type: 'object',
          properties: {
            results: { type: 'array', items: { type: 'object', properties: {
              number: { type: 'integer' },
              result: { enum: ['PASS', 'FAIL', 'PARTIAL', 'NOT-RUN'] },
              evidence: { type: 'string', description: 'what was actually opened or run. For NOT-RUN, the command to hand Tiên.' },
              note: { type: 'string' },
            }, required: ['number', 'result', 'evidence', 'note'], additionalProperties: false } },
          },
          required: ['results'],
          additionalProperties: false,
        } }
    )
  ))

  const RESULTS = ['PASS', 'FAIL', 'PARTIAL', 'NOT-RUN']
  const cov = coverage(allChecks.map(c => c.number), assessed, 'number', RESULTS, 'result')
  const { rows, missing, duplicated, invented, malformed } = cov

  const tally = {}
  for (const r of rows) tally[r.result] = (tally[r.result] || 0) + 1
  const failed = rows.filter(r => r.result === 'FAIL').map(r => r.number)

  // `complete` is about COVERAGE — was every discovered check assessed exactly once. `passes`
  // needs that AND no check to have failed. Either one false makes the other unusable, so both
  // are stated rather than left for the caller to derive.
  const problems = cov.problems.slice()
  if (malformedDiscovered.length) problems.push(`${malformedDiscovered.length} check(s) unreadable from ${input.checks}`)
  const complete = cov.complete && malformedDiscovered.length === 0 && droppedChecks.length === 0
  const passes = complete && failed.length === 0

  log(complete
    ? `COVERAGE: ${rows.length}/${allChecks.length} checks assessed exactly once across ${batches.length} worker(s).`
    : `COVERAGE INCOMPLETE — ${problems.join('; ')}. Reported, never counted as assessed.`)

  return {
    stage: 'done-checks',
    artifact: input.artifact,
    checks: rows.length,
    checksFound: allChecks.length,
    workers: batches.length,
    agentsUsed: batches.length + 1,     // the reader is an agent too
    agentCeiling: MAX_AGENTS,
    droppedChecks,
    missingChecks: missing,
    duplicatedChecks: duplicated,
    inventedChecks: invented,
    malformedRows: malformed,
    complete,
    passes,
    failedChecks: failed,
    tally,
    rows,
    note: complete
      ? (failed.length ? `${failed.length} check(s) FAILED: ${failed.join(', ')}.` : '')
      : `INCOMPLETE — ${problems.join('; ')}. Do not read this tally as coverage.`,
  }
}

return { error: `Unknown stage "${STAGE}". Expected architecture, audit, or done-checks.` }
