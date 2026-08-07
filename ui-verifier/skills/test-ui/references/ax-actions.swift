#!/usr/bin/env swift
//
// ax-actions.swift — MEASUREMENT ONLY (no assertions, no verdicts).
//
// WHY THIS EXISTS. `ax-probe.swift gate <surface>` answers "header present AND not-loading",
// and that gate GREEN-LIT A RUNS SURFACE WITH ZERO USABLE CARDS (2026-08-07). A header is
// chrome; it is present whether or not the surface has content, and it is present whether or
// not that content can be clicked. This tool measures the two facts the gate was missing:
//
//   1. HOW MANY elements carry an identifier with the given prefix (content-present), and
//   2. Which of them expose an accessibility ACTION such as AXPress (actionable).
//
// It prints what it found and exits 0 whenever the walk completed — it never decides whether
// a number is good. That judgement belongs to the caller, so this tool cannot itself become a
// second source of false greens (feedback-checker-that-explains-is-guessing: report the count
// and the population, never the cause).
//
// Same two hang-avoidance measures `ax-probe.swift` documents, for the same measured reasons:
// a 5s per-message timeout, and no descent into AXWebArea/AXMenuBar.
//
// Usage:
//   swift tools/ax-actions.swift <pid> <identifier-prefix>
//   swift tools/ax-actions.swift <pid> <identifier-prefix> --do <AXAction>
// Output (one line per distinct identifier, then a summary):
//   <identifier>|<role>|<actions, comma-separated or "-">|<title>
//   SUMMARY elements=<n> identifiers=<n> with_press=<n>
// With `--do`, performs that action on the FIRST matching element and prints
//   DID <action> on <identifier>
// which is how a scenario drives the app without a mouse and without raising the window.
// Exit: 0 walk completed / action performed · 1 action failed · 2 usage · 3 no such pid/not trusted
import Cocoa
import ApplicationServices

let args = CommandLine.arguments
guard args.count == 3 || (args.count == 5 && args[3] == "--do"), let pid = pid_t(args[1]) else {
    FileHandle.standardError.write(
        "usage: ax-actions.swift <pid> <identifier-prefix> [--do <AXAction>]\n".data(using: .utf8)!)
    exit(2)
}
let actionToPerform: String? = args.count == 5 ? args[4] : nil
guard AXIsProcessTrusted() else {
    FileHandle.standardError.write("ax-actions: this process has no Accessibility grant\n".data(using: .utf8)!)
    exit(3)
}
let prefix = args[2]

let app = AXUIElementCreateApplication(pid)
AXUIElementSetMessagingTimeout(app, 5.0)

func stringAttr(_ el: AXUIElement, _ a: String) -> String? {
    var v: CFTypeRef?
    if AXUIElementCopyAttributeValue(el, a as CFString, &v) == .success, let s = v as? String { return s }
    return nil
}
func children(_ el: AXUIElement) -> [AXUIElement] {
    var v: CFTypeRef?
    if AXUIElementCopyAttributeValue(el, kAXChildrenAttribute as CFString, &v) == .success,
       let a = v as? [AXUIElement] { return a }
    return []
}
/// The element's own action names (`AXPress`, `AXShowMenu`, ...). An element built from a
/// SwiftUI `.gesture(TapGesture())` carries NONE — which is the whole fact this tool was
/// written to make visible.
func actions(_ el: AXUIElement) -> [String] {
    var v: CFArray?
    if AXUIElementCopyActionNames(el, &v) == .success, let a = v as? [String] { return a }
    return []
}

var rows: [(String, String, [String], String)] = []
var matched: [(String, AXUIElement)] = []
var stack = [app]
var visited = 0
while let el = stack.popLast() {
    visited += 1
    if visited > 20000 { break }
    if let id = stringAttr(el, kAXIdentifierAttribute as String), id == prefix || id.hasPrefix(prefix) {
        matched.append((id, el))
        rows.append((id,
                     stringAttr(el, kAXRoleAttribute as String) ?? "-",
                     actions(el),
                     stringAttr(el, kAXTitleAttribute as String)
                        ?? stringAttr(el, kAXValueAttribute as String)
                        ?? stringAttr(el, kAXDescriptionAttribute as String) ?? "-"))
    }
    let role = stringAttr(el, kAXRoleAttribute as String) ?? ""
    if role == "AXWebArea" || role == "AXMenuBar" { continue }
    stack.append(contentsOf: children(el))
}

if let action = actionToPerform {
    guard let (id, el) = matched.first else {
        FileHandle.standardError.write("ax-actions: no element matching \(prefix)\n".data(using: .utf8)!)
        exit(1)
    }
    let err = AXUIElementPerformAction(el, action as CFString)
    guard err == .success else {
        FileHandle.standardError.write(
            "ax-actions: \(action) on \(id) failed (AXError \(err.rawValue))\n".data(using: .utf8)!)
        exit(1)
    }
    print("DID \(action) on \(id)")
    exit(0)
}

for (id, role, acts, title) in rows {
    print("\(id)|\(role)|\(acts.isEmpty ? "-" : acts.joined(separator: ","))|\(title)")
}
let identifiers = Set(rows.map { $0.0 })
let pressable = rows.filter { $0.2.contains("AXPress") }
print("SUMMARY elements=\(rows.count) identifiers=\(identifiers.count) with_press=\(pressable.count)")
