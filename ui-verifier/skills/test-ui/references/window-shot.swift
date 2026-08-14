// Reliable window screenshot via ScreenCaptureKit (macOS 14+). Captures a named app's
// main window even when occluded and WITHOUT bringing it on screen or stealing focus — the
// robust "eye". Required over `screencapture`/foreground grabs because the machine has one
// screen and the user is multitasking: the app must never be raised to be photographed.
// Fix vs the first version: no semaphore (that deadlocked SCK's main-queue dispatch);
// the Task calls exit() itself and RunLoop.main.run() keeps the process alive until then.
// Fix 2026-08-07: pick the largest ON-SCREEN window (the content window), never a hard
// >200px filter — that silently dropped a real-but-collapsed 150×144 window and reported
// "no window" when one existed. A small window is now captured WITH a warning, so a
// degenerate/collapsed window surfaces as a visible fact instead of a false "no window".
// Permission: Screen Recording (for SCK) + Accessibility are granted to the TERMINAL (Ghostty),
// and every process spawned from it inherits them — so this works headless from a Bash tool.
// Usage: window-shot.swift <OwnerName> <out.png>
import ScreenCaptureKit
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// MUST come before any ScreenCaptureKit call. Run as a script (`swift tools/window-shot.swift`),
// this process starts with NO window-server connection, and SkyLight does not fail softly when
// one is missing — it produced BOTH failure modes seen on 2026-08-07, in this order:
//
//   1. `SCShareableContent` returned a degraded window list in which workspace's real 1659×991
//      window was absent, so this tool picked a 150×144 decoy and printed a "collapsed window"
//      warning ABOUT A HEALTHY WINDOW. Independently measured via the Accessibility API at the
//      same moment: `window 'workspace' size=1659x991`. A tool that invents a defect in the thing
//      it is measuring is worse than no tool — the warning text below even tells the reader to
//      go clear their saved application state, which fixes nothing.
//   2. `SCContentFilter(desktopIndependentWindow:)` then hit
//      `Assertion failed: (did_initialize), CGS_REQUIRE_INIT` and SIGABRT'd.
//
// `NSApplication.shared` establishes the connection. `.accessory` keeps this process out of the
// Dock and, more importantly, stops it stealing focus — the whole point of the off-screen eye is
// that the user's screen is never touched.
import AppKit
_ = NSApplication.shared
NSApplication.shared.setActivationPolicy(.accessory)

let owner = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "workspace"
let outPath = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : "/tmp/window-shot.png"

func fail(_ m: String, _ code: Int32) -> Never {
    FileHandle.standardError.write("window-shot: \(m)\n".data(using: .utf8)!); exit(code)
}
func warn(_ m: String) {
    FileHandle.standardError.write("window-shot: \(m)\n".data(using: .utf8)!)
}

Task {
    do {
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
        let owned = content.windows.filter { $0.owningApplication?.applicationName == owner }
        // Prefer on-screen windows (the content window is on-screen; the app's off-screen menu/title
        // layers are 2056×39 decoys). Fall back to any owned window only if none are on-screen.
        let onscreen = owned.filter { $0.isOnScreen }
        let pool = onscreen.isEmpty ? owned : onscreen
        let wins = pool.sorted { $0.frame.width * $0.frame.height > $1.frame.width * $1.frame.height }
        guard let win = wins.first else {
            fail("no window owned by \(owner) (SCK sees \(owned.count) owned, \(content.windows.count) total) — "
                 + "is the app running with a window, and is Screen Recording granted to this terminal?", 2)
        }
        if win.frame.width < 400 || win.frame.height < 400 {
            // TWO causes, and THIS TOOL CANNOT TELL THEM APART — so it must not name one.
            // It used to assert "collapsed/degenerate window, clear your saved application
            // state", and on 2026-08-07 it said that about a window measured via the
            // Accessibility API, at the same moment, as a healthy 1659×991. The real cause was
            // the second one below, and the advice sent the reader to delete state that was fine.
            //   (a) the window really is collapsed; or
            //   (b) Screen Recording is not granted to THIS process, in which case SCK hands back
            //       a degraded window list that omits the real window, and the capture then fails
            //       with SCStreamErrorDomain -3811.
            // The check that separates them is outside this tool: read the window's size over the
            // Accessibility API (which needs a different, usually-granted permission). If AX says
            // the window is large, this is (b) — a permission problem, not an app defect.
            warn("WARNING: the largest window SCK can see for \(owner) is only "
                 + "\(Int(win.frame.width))×\(Int(win.frame.height)). That is EITHER a collapsed window "
                 + "OR this process lacking Screen Recording (SCK then hides the real window). "
                 + "Confirm with an Accessibility read of the window size before believing either. "
                 + "Capturing anyway.")
        }
        let cfg = SCStreamConfiguration()
        cfg.width = Int(win.frame.width * 2); cfg.height = Int(win.frame.height * 2)
        cfg.showsCursor = false
        let filter = SCContentFilter(desktopIndependentWindow: win)
        let img = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: cfg)
        guard let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: outPath) as CFURL,
                                                         UTType.png.identifier as CFString, 1, nil)
        else { fail("cannot create png", 4) }
        CGImageDestinationAddImage(dest, img, nil)
        guard CGImageDestinationFinalize(dest) else { fail("cannot write png", 5) }
        print("\(outPath) \(Int(win.frame.width))x\(Int(win.frame.height))")
        exit(0)
    } catch { fail("\(error)", 3) }
}
RunLoop.main.run()
