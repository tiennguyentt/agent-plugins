#!/usr/bin/env swift
//
// ax-dump.swift — walks a running app's Accessibility tree and prints one
// stable, diffable line per element. Built for C5 (review E13: "visual
// render NOT RUN" without Screen Recording — Screen Recording is blocked
// per feedback-measure-her-screenshot-pixels; this is a text substitute
// a snapshot test CAN diff byte-for-byte, which a screenshot cannot).
//
// Usage:
//   swift tools/ax-dump.swift <pid>
//   swift tools/ax-dump.swift --bundle-id sh.tien-os.app
//   swift tools/ax-dump.swift --press rail.runs <pid>   (perform an AXPress on the
//     first element whose kAXIdentifierAttribute matches, settle 300ms, THEN dump —
//     added after the reality check below showed the plain walk alone was not enough:
//     three of the six ui-states fixtures (empty/run-verified/run-many-agents) land on
//     an empty Queue tab and are otherwise AX-indistinguishable from each other, because
//     WorkspaceShellView.swift defaults to the Queue surface and their differences live
//     on the Runs tab. `--press rail.runs` is how test-ax-snapshot.py gets there without
//     adding a second tool.)
//
// Exit codes (test-ax-snapshot.py branches on these):
//   0  tree printed to stdout
//   2  AXIsProcessTrusted() is false — this process (whatever ran this
//      script) has no Accessibility grant. Never auto-grant: unblock is
//      System Settings > Privacy & Security > Accessibility > add the
//      invoking binary (hers to click).
//   3  no such PID, or no running app with that bundle id
//   4  usage error
//
// DETERMINISM IS THE WHOLE POINT — read this before touching `stringify`.
// A plain `"\(value)"` interpolation on an opaque CFTypeRef (AXValueRef,
// AXUIElementRef, NSConcreteValue, ...) prints its allocation's pointer
// address on many Foundation builds, e.g. "<AXValueRef 0x600002a1c000>".
// That address changes every launch, so a naive dump would fail every diff
// even when nothing about the render changed — the opposite of what a
// snapshot test is for. `stringify` below is an explicit switch over the
// CFTypeIDs actually seen in a SwiftUI accessibility tree (string, number,
// boolean, AXValue-encoded geometry, array, url) and refuses to fall back
// to raw interpolation for anything it does not recognize; an unrecognized
// type prints its CF type name only, never its address.
//
// Screen position/size are geometry, and geometry moves with the window's
// on-screen placement, which is not part of what a fixture substrate
// determines — so even where kAXValueAttribute DOES resolve to a decoded
// CGPoint/CGSize/CGRect, this tool prints a type tag ("<point>", "<size>",
// "<rect>") instead of the numbers. This is deliberate, not a shortcut: a
// snapshot that embedded window-position numbers would fail on every
// developer's differently-placed window, which would just retrain
// reviewers to ignore diffs — a worse failure mode than under-reporting.
//
// Traversal is a bounded pre-order DFS over kAXChildrenAttribute only
// (never kAXParentAttribute — no cycle risk from a tree walked one
// direction). The `AXMenuBar` child of the top-level application element
// is named but not descended into: it is identical across every fixture
// (it is the app's static menu, not fixture-driven content) and would pad
// every snapshot with the same few hundred lines for zero signal.

import ApplicationServices
import AppKit
import Foundation

// MARK: - CLI

func usageError(_ msg: String) -> Never {
    FileHandle.standardError.write("ax-dump: \(msg)\nusage: ax-dump.swift [--press <identifier>] <pid> | --bundle-id <id>\n".data(using: .utf8)!)
    exit(4)
}

var args = Array(CommandLine.arguments.dropFirst())
var pressIdentifier: String?
if let i = args.firstIndex(of: "--press") {
    guard i + 1 < args.count else { usageError("--press needs an identifier argument") }
    pressIdentifier = args[i + 1]
    args.removeSubrange(i...(i + 1))
}

var targetPID: pid_t?

if args.count == 2, args[0] == "--bundle-id" {
    let bundleId = args[1]
    guard let app = NSWorkspace.shared.runningApplications.first(where: { $0.bundleIdentifier == bundleId }) else {
        FileHandle.standardError.write("ax-dump: no running app with bundle id \(bundleId)\n".data(using: .utf8)!)
        exit(3)
    }
    targetPID = app.processIdentifier
} else if args.count == 1, let n = pid_t(args[0]) {
    targetPID = n
} else {
    usageError("expected a numeric PID or `--bundle-id <id>`, got \(args)")
}

guard let pid = targetPID else { usageError("could not resolve a PID") }

// MARK: - Permission probe (REALITY CHECK — do this before touching the AX API at all)

guard AXIsProcessTrusted() else {
    FileHandle.standardError.write("""
    ax-dump: Accessibility permission not granted to this process.
    Unblock: System Settings > Privacy & Security > Accessibility > grant \
    the invoking binary (the `swift` interpreter, or wherever this script's \
    process identity resolves to) access, then re-run. Never auto-granted.

    """.data(using: .utf8)!)
    exit(2)
}

if kill(pid, 0) != 0 {
    FileHandle.standardError.write("ax-dump: no process with pid \(pid)\n".data(using: .utf8)!)
    exit(3)
}

// MARK: - Safe, deterministic stringification

/// Escapes the three characters that would otherwise break the one-line-per-node,
/// `|`-delimited output format: a literal `|`, a literal `\`, and any embedded newline
/// or tab a text value might carry.
func escapeField(_ s: String) -> String {
    var out = s
    out = out.replacingOccurrences(of: "\\", with: "\\\\")
    out = out.replacingOccurrences(of: "|", with: "\\|")
    out = out.replacingOccurrences(of: "\n", with: "\\n")
    out = out.replacingOccurrences(of: "\t", with: "\\t")
    return out
}

let maxValueChars = 300

func truncate(_ s: String) -> String {
    if s.count <= maxValueChars { return s }
    let head = s.prefix(maxValueChars)
    return "\(head)…(+\(s.count - maxValueChars) chars)"
}

/// See the file header's DETERMINISM comment. Every branch here is deliberate; the
/// `default` at the bottom is the refusal to ever print a raw CFTypeRef description.
func stringify(_ value: CFTypeRef) -> String {
    let typeID = CFGetTypeID(value)

    if typeID == CFStringGetTypeID() {
        return truncate(escapeField(value as! String))
    }
    if typeID == CFBooleanGetTypeID() {
        return (value as! Bool) ? "true" : "false"
    }
    if typeID == CFNumberGetTypeID() {
        let n = value as! NSNumber
        return n.stringValue
    }
    if typeID == CFURLGetTypeID() {
        return truncate(escapeField((value as! URL).absoluteString))
    }
    if typeID == CFArrayGetTypeID() {
        let arr = value as! [AnyObject]
        return "<array:\(arr.count)>"
    }
    if typeID == AXValueGetTypeID() {
        let axValue = value as! AXValue
        switch AXValueGetType(axValue) {
        case .cgPoint: return "<point>"
        case .cgSize: return "<size>"
        case .cgRect: return "<rect>"
        case .cfRange: return "<range>"
        case .axError: return "<ax-error>"
        default: return "<ax-value>"
        }
    }
    if typeID == AXUIElementGetTypeID() {
        // Some attributes (e.g. AXTitleUIElement) resolve to another element rather
        // than a leaf value. Naming that it IS one is useful; its own role/identifier
        // is available by walking to it as a child, so this never recurses here.
        return "<ax-element>"
    }
    // Unknown/unhandled CFTypeID — name the type, never interpolate the value itself
    // (interpolation is where a raw pointer address would leak in and break the diff).
    let typeName = (CFCopyTypeIDDescription(typeID) as String?) ?? "unknown"
    return "<unhandled:\(typeName)>"
}

func attribute(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
    var value: CFTypeRef?
    let err = AXUIElementCopyAttributeValue(element, name as CFString, &value)
    guard err == .success, let v = value else { return nil }
    return v
}

func stringAttribute(_ element: AXUIElement, _ name: String) -> String {
    guard let v = attribute(element, name) else { return "-" }
    return stringify(v)
}

/// The "value" column: kAXValueAttribute first, per the brief's literal ask, but falling
/// back to kAXTitleAttribute then kAXDescriptionAttribute when it is empty. FOUND BY
/// ACTUALLY RUNNING THIS AGAINST TWO DIFFERENT FIXTURES, not anticipated up front: a plain
/// SwiftUI `Button`'s visible label lives in AXTitle, not AXValue — AXValue is for
/// stateful controls (checkboxes, sliders, text fields). Reading AXValue alone made
/// run-verified and run-many-agents produce a BYTE-IDENTICAL snapshot on the very surface
/// (Runs, via --press) added specifically to tell them apart — the jobs-strip buttons
/// carrying each run's distinguishing text were dumped as `AXButton|-|-` for both. This
/// fallback is why "value" here means "whatever text-bearing attribute this node actually
/// carries," not literally kAXValueAttribute alone.
func displayValue(_ element: AXUIElement) -> String {
    let v = stringAttribute(element, kAXValueAttribute)
    if v != "-" { return v }
    let title = stringAttribute(element, kAXTitleAttribute)
    if title != "-" { return title }
    return stringAttribute(element, kAXDescriptionAttribute)
}

func children(_ element: AXUIElement) -> [AXUIElement] {
    guard let v = attribute(element, kAXChildrenAttribute) else { return [] }
    return (v as? [AXUIElement]) ?? []
}

// MARK: - Bounded pre-order walk

let maxDepth = 40
let maxNodes = 20000
var nodeCount = 0
var capped = false
var lines: [String] = []

func walk(_ element: AXUIElement, depth: Int) {
    if capped { return }
    if nodeCount >= maxNodes {
        capped = true
        FileHandle.standardError.write("ax-dump: node cap (\(maxNodes)) reached — output truncated\n".data(using: .utf8)!)
        return
    }
    nodeCount += 1

    let role = stringAttribute(element, kAXRoleAttribute)
    let identifier = stringAttribute(element, kAXIdentifierAttribute)
    let value = displayValue(element)
    lines.append("\(depth)|\(role)|\(identifier)|\(value)")

    if depth >= maxDepth {
        FileHandle.standardError.write("ax-dump: max depth (\(maxDepth)) reached at role=\(role)\n".data(using: .utf8)!)
        return
    }

    // Deliberately not descending into the static menu bar — see file header.
    if role == "AXMenuBar" { return }

    for child in children(element) {
        walk(child, depth: depth + 1)
        if capped { return }
    }
}

// MARK: - Optional press-before-dump

/// Bounded pre-order search for the first element whose kAXIdentifierAttribute equals
/// `target`. Reuses the same node/depth caps as the main walk (a runaway search is the
/// same failure mode as a runaway dump) but does not populate `lines` — this is a probe,
/// not part of the printed tree.
func findByIdentifier(_ element: AXUIElement, target: String, depth: Int, seen: inout Int) -> AXUIElement? {
    if depth > maxDepth || seen >= maxNodes { return nil }
    seen += 1
    if stringAttribute(element, kAXIdentifierAttribute) == target { return element }
    let role = stringAttribute(element, kAXRoleAttribute)
    if role == "AXMenuBar" { return nil }
    for child in children(element) {
        if let hit = findByIdentifier(child, target: target, depth: depth + 1, seen: &seen) {
            return hit
        }
    }
    return nil
}

let appElement = AXUIElementCreateApplication(pid)

if let target = pressIdentifier {
    var seen = 0
    if let hit = findByIdentifier(appElement, target: target, depth: 0, seen: &seen) {
        let err = AXUIElementPerformAction(hit, kAXPressAction as CFString)
        if err != .success {
            FileHandle.standardError.write("ax-dump: AXPress on '\(target)' returned \(err.rawValue)\n".data(using: .utf8)!)
        }
        // Let SwiftUI finish its re-render before the walk below reads it.
        Thread.sleep(forTimeInterval: 0.3)
    } else {
        FileHandle.standardError.write("ax-dump: press target '\(target)' not found\n".data(using: .utf8)!)
    }
}

walk(appElement, depth: 0)

print(lines.joined(separator: "\n"))
