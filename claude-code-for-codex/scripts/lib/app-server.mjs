/**
 * Transport layer for driving the `claude` CLI the way upstream's app-server.mjs drove
 * `codex app-server`.
 *
 * UPSTREAM SHAPE (unchanged here): a generic JSON-RPC-ish surface —
 * `request(method, params)` (id-correlated, returns a Promise), `notify(method, params)`
 * (fire-and-forget), `setNotificationHandler(handler)` (receives `{method, params}` messages
 * with no id), newline-delimited JSON over a pipe or a broker socket, busy-rejection, shutdown.
 *
 * WHAT ACTUALLY CHANGED (forced by the transport substitution):
 * `codex app-server` speaks that JSON-RPC shape NATIVELY on the wire. `claude -p
 * --input-format stream-json --output-format stream-json` does not — it speaks its own
 * `{"type": "..."}` protocol (`system`/`assistant`/`user`/`stream_event`/`result`/
 * `rate_limit_event` for turn content, `control_request`/`control_response` for a small,
 * separately-verified control channel). There is no client-initiated "start a turn on thread
 * X" RPC either: a claude turn is just "write a user message on stdin, read the stream until a
 * `result` message arrives" — there is no in-band addressing of *which* turn a message belongs
 * to, because one `claude` process only ever runs one turn at a time.
 *
 * So the two transports in this file are asymmetric on purpose:
 *   - BrokerClaudeStreamClient talks to `../app-server-broker.mjs` (already written, not part
 *     of this port) over a Unix socket / named pipe. The broker ALREADY re-encodes everything
 *     as the upstream JSON-RPC shape before relaying it (see its own `send(socket, {id,
 *     method, params})` / notification relay) — so this class is close to a straight rename of
 *     upstream's BrokerCodexAppServerClient. No translation needed here; the broker did it.
 *   - SpawnedClaudeStreamClient talks DIRECTLY to a spawned `claude` child over stdio, which
 *     speaks claude's native stream-json wire, not JSON-RPC. It overrides `request()` to
 *     translate a small, closed set of virtual RPC methods ("turn/start", "review/start",
 *     "turn/interrupt" — the methods `app-server-broker.mjs` already knows how to relay) into
 *     real claude-native operations, and synthesizes `{method, params}` notifications on the
 *     way out so progress still flows through `notificationHandler` exactly like upstream's
 *     `item/started` stream did — including onward through the broker to a remote caller.
 *
 * Verified live against claude 2.1.226 (see the port report for the exact commands/output):
 *   - `-p` + `--output-format stream-json` requires `--verbose`, or the CLI refuses to start.
 *     This is NOT documented in `claude --help`; it is a runtime error message.
 *   - Writing `{"type":"control_request","request_id":<uuid>,"request":{"subtype":"interrupt"}}`
 *     on stdin produces `{"type":"control_response","response":{"subtype":"success",
 *     "request_id":<uuid>,"response":{"still_queued":[]}}}` on stdout — a REAL, working
 *     interrupt control message, not an invented one.
 *   - `--json-schema <schema>` works identically in one-shot (`--output-format json`) and
 *     streaming (`--output-format stream-json`) modes: the final `result` stream message
 *     carries the schema-conformant answer in both `.result` (JSON string) and
 *     `.structured_output` (already parsed).
 *   - `--name <value>` at spawn time is durably recorded as the FIRST lines of the session's
 *     own transcript (`~/.claude/projects/<slug>/<sessionId>.jsonl`):
 *     `{"type":"custom-title","customTitle":"<value>",...}` then
 *     `{"type":"agent-name","agentName":"<value>",...}`. `lib/claude.mjs`'s
 *     `findLatestTaskThread` reads this back directly (see its own comments) instead of
 *     asking `claude` for a thread list, because no such listing command exists.
 */
import crypto from "node:crypto";
import net from "node:net";
import process from "node:process";
import { spawn } from "node:child_process";
import readline from "node:readline";
import { parseBrokerEndpoint } from "./broker-endpoint.mjs";
import { ensureBrokerSession, loadBrokerSession } from "./broker-lifecycle.mjs";
import { terminateProcessTree } from "./process.mjs";

export const BROKER_ENDPOINT_ENV = "CLAUDE_COMPANION_APP_SERVER_ENDPOINT";

// Upstream's codex app-server is real JSON-RPC and returns this exact code when a broker
// connection is mid-request and can't accept another one; callers retry direct. `claude` has
// no JSON-RPC and no such wire-level code to discover. The VALUE is kept identical to upstream
// (and to what `scripts/app-server-broker.mjs` already emits — see its own
// `buildJsonRpcError(BROKER_BUSY_RPC_CODE, "Shared Claude broker is busy.")`) purely so that
// `lib/claude.mjs`'s retry logic can check `error.rpcCode === BROKER_BUSY_RPC_CODE` the same
// way upstream's `withAppServer` did, regardless of which transport produced the rejection.
export const BROKER_BUSY_RPC_CODE = -32001;

// `-p`/`--output-format stream-json`/`--input-format stream-json`/`--include-partial-messages`
// require `--verbose` or the CLI exits immediately with:
//   "Error: When using --print, --output-format=stream-json requires --verbose"
// Confirmed live; not documented in `claude --help`.
const REQUIRED_STREAM_ARGS = [
  "-p",
  "--input-format",
  "stream-json",
  "--output-format",
  "stream-json",
  "--include-partial-messages",
  "--verbose"
];

const READY_TIMEOUT_MS = 15000;

function createProtocolError(message, data) {
  const error = new Error(message);
  error.data = data;
  if (data?.code !== undefined) {
    error.rpcCode = data.code;
  }
  return error;
}

function toArgList(value) {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Builds the argv for a spawned `claude` child. Unlike codex app-server (where thread config —
 * model, sandbox, cwd — is sent as JSON-RPC params AFTER connecting), the `claude` CLI bakes
 * all of this into process startup flags. There is no post-connect "configure this thread"
 * call to make, so `ClaudeStreamClient.connect(cwd, options)` must receive session/model/tool
 * configuration up front and this function turns it into argv before the child ever spawns.
 */
function buildClaudeArgs(options = {}) {
  const args = [...REQUIRED_STREAM_ARGS];

  if (options.resumeSessionId) {
    args.push("--resume", options.resumeSessionId);
    if (options.forkSession) {
      args.push("--fork-session");
    }
  } else if (options.sessionId) {
    args.push("--session-id", options.sessionId);
  }

  if (options.model) {
    args.push("--model", options.model);
  }
  if (options.effort) {
    args.push("--effort", options.effort);
  }
  if (options.permissionMode) {
    args.push("--permission-mode", options.permissionMode);
  }
  if (options.threadName) {
    args.push("--name", options.threadName);
  }

  const allowedTools = toArgList(options.allowedTools);
  if (allowedTools.length > 0) {
    args.push("--allowedTools", ...allowedTools);
  }

  const disallowedTools = toArgList(options.disallowedTools);
  if (disallowedTools.length > 0) {
    args.push("--disallowedTools", ...disallowedTools);
  }

  if (options.appendSystemPrompt) {
    args.push("--append-system-prompt", options.appendSystemPrompt);
  }

  const addDir = toArgList(options.addDir);
  if (addDir.length > 0) {
    args.push("--add-dir", ...addDir);
  }

  if (options.forwardSubagentText) {
    args.push("--forward-subagent-text");
  }

  // `--json-schema` is per-session (baked into argv), unlike upstream's per-turn
  // `outputSchema` RPC param — there is no way to change it mid-session. `lib/claude.mjs`
  // threads `options.outputSchema` through `connect()`'s options for exactly this reason.
  if (options.outputSchema) {
    args.push("--json-schema", JSON.stringify(options.outputSchema));
  }

  return args;
}

/**
 * Extracts a single prompt string out of the upstream-shaped `UserInput[]` (see upstream's
 * `buildTurnInput`: `[{ type: "text", text, text_elements: [] }]`). `lib/claude.mjs` keeps
 * building `input` in that shape for call-site familiarity; this is the one place it gets
 * unpacked back into plain text for claude's `{"type":"user","message":{...}}` line.
 */
function extractPromptText(input) {
  if (typeof input === "string") {
    return input;
  }
  if (!Array.isArray(input)) {
    return "";
  }
  return input
    .map((item) => (typeof item === "string" ? item : item?.text ?? ""))
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Upstream's generic JSON-RPC surface: id-correlated `request()`, fire-and-forget `notify()`,
 * a single `notificationHandler` for incoming `{method, params}` messages, and the same
 * buffering/exit-handling shape. UNCHANGED from upstream except for renamed error text.
 * `BrokerClaudeStreamClient` uses this as-is, because the broker's own wire is real JSON-RPC.
 * `SpawnedClaudeStreamClient` overrides `request()`/`sendMessage()` (see below) because a
 * direct `claude` child does not speak this wire at all.
 */
class StreamClientBase {
  constructor(cwd, options = {}) {
    this.cwd = cwd;
    this.options = options;
    this.pending = new Map();
    this.nextId = 1;
    this.stderr = "";
    this.closed = false;
    this.exitError = null;
    this.exitResolved = false;
    this.notificationHandler = null;
    this.lineBuffer = "";
    this.transport = "unknown";

    this.exitPromise = new Promise((resolve) => {
      this.resolveExit = resolve;
    });
  }

  setNotificationHandler(handler) {
    this.notificationHandler = handler;
  }

  request(method, params) {
    if (this.closed) {
      throw new Error("claude stream client is closed.");
    }

    const id = this.nextId;
    this.nextId += 1;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.sendMessage({ id, method, params });
    });
  }

  notify(method, params = {}) {
    if (this.closed) {
      return;
    }
    this.sendMessage({ method, params });
  }

  handleChunk(chunk) {
    this.lineBuffer += chunk;
    let newlineIndex = this.lineBuffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = this.lineBuffer.slice(0, newlineIndex);
      this.lineBuffer = this.lineBuffer.slice(newlineIndex + 1);
      this.handleLine(line);
      newlineIndex = this.lineBuffer.indexOf("\n");
    }
  }

  handleLine(line) {
    if (!line.trim()) {
      return;
    }

    let message;
    try {
      message = JSON.parse(line);
    } catch (error) {
      this.handleExit(createProtocolError(`Failed to parse claude broker JSONL: ${error.message}`, { line }));
      return;
    }

    if (message.id !== undefined && message.method) {
      this.handleServerRequest(message);
      return;
    }

    if (message.id !== undefined) {
      const pending = this.pending.get(message.id);
      if (!pending) {
        return;
      }
      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(createProtocolError(message.error.message ?? `claude broker ${pending.method} failed.`, message.error));
      } else {
        pending.resolve(message.result ?? {});
      }
      return;
    }

    if (message.method && this.notificationHandler) {
      this.notificationHandler(message);
    }
  }

  handleServerRequest(message) {
    this.sendMessage({
      id: message.id,
      error: { code: -32601, message: `Unsupported server request: ${message.method}` }
    });
  }

  handleExit(error) {
    if (this.exitResolved) {
      return;
    }

    this.exitResolved = true;
    this.exitError = error ?? null;

    for (const pending of this.pending.values()) {
      pending.reject(this.exitError ?? new Error("claude stream connection closed."));
    }
    this.pending.clear();
    this.resolveExit(undefined);
  }

  sendMessage(_message) {
    throw new Error("sendMessage must be implemented by subclasses.");
  }
}

class BrokerClaudeStreamClient extends StreamClientBase {
  constructor(cwd, options = {}) {
    super(cwd, options);
    this.transport = "broker";
    this.endpoint = options.brokerEndpoint;
  }

  async initialize() {
    await new Promise((resolve, reject) => {
      const target = parseBrokerEndpoint(this.endpoint);
      this.socket = net.createConnection({ path: target.path });
      this.socket.setEncoding("utf8");
      this.socket.on("connect", resolve);
      this.socket.on("data", (chunk) => {
        this.handleChunk(chunk);
      });
      this.socket.on("error", (error) => {
        if (!this.exitResolved) {
          reject(error);
        }
        this.handleExit(error);
      });
      this.socket.on("close", () => {
        this.handleExit(this.exitError);
      });
    });
    // No initialize handshake: `app-server-broker.mjs` already has a live `claude` child
    // (`appClient`) running underneath it before it ever accepts a socket connection, so a
    // freshly connected client can start sending `request()` calls immediately.
  }

  async close() {
    if (this.closed) {
      await this.exitPromise;
      return;
    }

    this.closed = true;
    if (this.socket) {
      this.socket.end();
    }
    await this.exitPromise;
  }

  sendMessage(message) {
    const line = `${JSON.stringify(message)}\n`;
    const socket = this.socket;
    if (!socket) {
      throw new Error("claude broker connection is not connected.");
    }
    socket.write(line);
  }
}

/**
 * Talks directly to a spawned `claude` child over stdio. This is where the transport
 * substitution actually lives: it exposes the SAME `request(method, params)` /
 * `notificationHandler` surface as the base class, but underneath it translates a small,
 * closed set of virtual methods into claude's native stream-json wire instead of writing
 * JSON-RPC to the child (which would not understand it).
 */
class SpawnedClaudeStreamClient extends StreamClientBase {
  constructor(cwd, options = {}) {
    super(cwd, options);
    this.transport = "direct";
    this.pendingControlRequests = new Map();
    this.turnInFlight = false;
    this.activeTurn = null;
  }

  async initialize() {
    const args = buildClaudeArgs(this.options);
    this.proc = spawn(this.options.claudeBinary ?? "claude", args, {
      cwd: this.cwd,
      env: this.options.env ?? process.env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });

    this.proc.stdout.setEncoding("utf8");
    this.proc.stderr.setEncoding("utf8");

    this.proc.stderr.on("data", (chunk) => {
      this.stderr += chunk;
    });

    this.proc.on("error", (error) => {
      this.handleExit(error);
    });

    this.proc.on("exit", (code, signal) => {
      const stderr = this.stderr.trim();
      const detail =
        code === 0
          ? null
          : createProtocolError(
              `claude exited unexpectedly (${signal ? `signal ${signal}` : `exit ${code}`}).${stderr ? `\n${stderr}` : ""}`
            );
      this.handleExit(detail);
    });

    this.readline = readline.createInterface({ input: this.proc.stdout });
    this.readline.on("line", (line) => {
      this.handleRawLine(line);
    });

    // Claude has no client-initiated "initialize" handshake the way codex app-server does
    // (there is no request to send and await here). The child announces its own readiness
    // asynchronously via a `system` stream message once it starts, but stdin writes made
    // before that line arrives are still honored (confirmed live: sending the first user
    // message immediately after spawn, before any `system` line was read, still worked).
    // So `initialize()` only waits for the OS-level process spawn (or an immediate spawn
    // error) rather than blocking on any protocol message.
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`claude did not start within ${READY_TIMEOUT_MS}ms.`));
      }, READY_TIMEOUT_MS);
      const onSpawn = () => {
        cleanup();
        resolve();
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      const cleanup = () => {
        clearTimeout(timer);
        this.proc.off("spawn", onSpawn);
        this.proc.off("error", onError);
      };
      this.proc.once("spawn", onSpawn);
      this.proc.once("error", onError);
    });
  }

  async close() {
    if (this.closed) {
      await this.exitPromise;
      return;
    }

    this.closed = true;

    if (this.readline) {
      this.readline.close();
    }

    if (this.proc && !this.proc.killed) {
      this.proc.stdin.end();
      setTimeout(() => {
        if (this.proc && !this.proc.killed && this.proc.exitCode === null) {
          // On Windows the direct child is cmd.exe; use terminateProcessTree to kill the
          // entire tree including the grandchild node process. Mirrors upstream exactly.
          if (process.platform === "win32") {
            try {
              terminateProcessTree(this.proc.pid);
            } catch {
              // Best-effort cleanup inside an unref'd timer — swallow errors to avoid
              // crashing the host process during shutdown.
            }
          } else {
            this.proc.kill("SIGTERM");
          }
        }
      }, 50).unref?.();
    }

    await this.exitPromise;
  }

  sendMessage(message) {
    // Only reachable if something calls the inherited request()/notify() directly against a
    // direct client instead of going through the request() override below. Kept as a safe,
    // explicit failure rather than silently writing a JSON-RPC line `claude` can't parse.
    throw new Error(
      `SpawnedClaudeStreamClient cannot send a raw JSON-RPC message (attempted method: ${message?.method ?? "unknown"}). ` +
        "Use request('turn/start' | 'review/start' | 'turn/interrupt', params) instead."
    );
  }

  sendRaw(message) {
    const line = `${JSON.stringify(message)}\n`;
    const stdin = this.proc?.stdin;
    if (!stdin) {
      throw new Error("claude stdin is not available.");
    }
    stdin.write(line);
  }

  /**
   * Sends a real stream-json control_request and awaits its control_response. Verified live
   * (see file header / port report) for `subtype: "interrupt"`; other subtypes are untested.
   */
  sendControlRequest(subtype, params = {}) {
    if (this.closed) {
      throw new Error("claude stream client is closed.");
    }
    const requestId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pendingControlRequests.set(requestId, { resolve, reject });
      this.sendRaw({ type: "control_request", request_id: requestId, request: { subtype, ...params } });
    });
  }

  /**
   * Overrides the base class's generic JSON-RPC `request()`. `method` is one of the virtual
   * RPC names `scripts/app-server-broker.mjs` already knows how to relay opaquely
   * ("turn/start", "review/start", "turn/interrupt" — see that file's `STREAMING_METHODS` and
   * `isInterruptRequest`). Both "turn/start" and "review/start" run an identical native turn;
   * `lib/claude.mjs` is the layer that decides which name to use and what the prompt/result
   * means semantically — this class stays domain-agnostic on purpose.
   */
  async request(method, params = {}) {
    if (this.closed) {
      throw new Error("claude stream client is closed.");
    }

    if (method === "turn/start" || method === "review/start") {
      return this.runNativeTurn(params);
    }

    if (method === "turn/interrupt") {
      const response = await this.sendControlRequest("interrupt");
      return { interrupted: response?.subtype !== "error", response };
    }

    throw new Error(`Unsupported request method for a direct claude session: ${method}`);
  }

  runNativeTurn(params) {
    if (this.turnInFlight) {
      // Mirrors the shape upstream's broker used for a busy JSON-RPC connection so
      // `lib/claude.mjs`'s retry logic (`error.rpcCode === BROKER_BUSY_RPC_CODE`) works the
      // same way for a same-instance double-call as it does for a broker-reported busy state.
      return Promise.reject(
        createProtocolError("claude stream client is already running a turn.", { code: BROKER_BUSY_RPC_CODE })
      );
    }

    const promptText = extractPromptText(params.input);
    if (!promptText) {
      return Promise.reject(new Error("runNativeTurn requires non-empty params.input."));
    }

    this.turnInFlight = true;

    return new Promise((resolve, reject) => {
      this.activeTurn = {
        onRawMessage: (message) => {
          // Relay every raw claude event as a JSON-RPC-shaped notification, exactly the role
          // upstream's `item/started`/`item/completed` notifications played, so a caller
          // (direct, or remote through the broker's relay) can observe live progress the same
          // way regardless of transport.
          this.notificationHandler?.({ method: "claude/streamEvent", params: { message } });

          if (message.type === "result") {
            this.turnInFlight = false;
            this.activeTurn = null;
            resolve({
              turn: {
                id: message.uuid ?? null,
                sessionId: message.session_id ?? null,
                status: message.is_error ? "failed" : "completed"
              },
              result: message
            });
          }
        },
        onExit: (error) => {
          this.turnInFlight = false;
          this.activeTurn = null;
          reject(error ?? new Error("claude exited before completing the turn."));
        }
      };

      try {
        this.sendRaw({ type: "user", message: { role: "user", content: promptText } });
      } catch (error) {
        this.turnInFlight = false;
        this.activeTurn = null;
        reject(error);
      }
    });
  }

  handleRawLine(line) {
    if (!line.trim()) {
      return;
    }

    let message;
    try {
      message = JSON.parse(line);
    } catch (error) {
      this.handleExit(createProtocolError(`Failed to parse claude stream-json line: ${error.message}`, { line }));
      return;
    }

    if (message.type === "control_response") {
      const requestId = message.response?.request_id;
      const pending = requestId ? this.pendingControlRequests.get(requestId) : null;
      if (!pending) {
        return;
      }
      this.pendingControlRequests.delete(requestId);
      if (message.response?.subtype === "error") {
        pending.reject(createProtocolError(message.response.error?.message ?? "claude control request failed.", message.response.error));
      } else {
        pending.resolve(message.response ?? {});
      }
      return;
    }

    if (message.type === "control_request") {
      // The child asked US something over the control channel (e.g. a permission callback).
      // We always drive `claude` with an explicit --permission-mode, so this path was not
      // observed in testing (NOT VERIFIED). Mirror the base class's default: decline rather
      // than hang, instead of silently dropping it.
      this.sendRaw({
        type: "control_response",
        response: {
          subtype: "error",
          request_id: message.request_id,
          error: { message: `Unsupported control request: ${message.request?.subtype ?? "unknown"}` }
        }
      });
      return;
    }

    if (this.activeTurn) {
      this.activeTurn.onRawMessage(message);
      return;
    }

    // A stream message arrived with no turn in flight (e.g. session-start `system` chatter
    // before the first `request()` call). Forward it as a notification so a caller watching
    // `setNotificationHandler` still sees it, matching upstream's behavior of delivering
    // notifications outside of a captured turn to the previous handler.
    this.notificationHandler?.({ method: "claude/streamEvent", params: { message } });
  }
}

export class ClaudeStreamClient {
  static async connect(cwd, options = {}) {
    let brokerEndpoint = null;
    if (!options.disableBroker) {
      brokerEndpoint = options.brokerEndpoint ?? options.env?.[BROKER_ENDPOINT_ENV] ?? process.env[BROKER_ENDPOINT_ENV] ?? null;
      if (!brokerEndpoint && options.reuseExistingBroker) {
        brokerEndpoint = loadBrokerSession(cwd)?.endpoint ?? null;
      }
      if (!brokerEndpoint && !options.reuseExistingBroker) {
        const brokerSession = await ensureBrokerSession(cwd, { env: options.env });
        brokerEndpoint = brokerSession?.endpoint ?? null;
      }
    }
    const client = brokerEndpoint
      ? new BrokerClaudeStreamClient(cwd, { ...options, brokerEndpoint })
      : new SpawnedClaudeStreamClient(cwd, options);
    await client.initialize();
    return client;
  }
}
