# Legacy Recorder Revamp — Design Doc

> **Status :** Proposal — no production code yet (the NPE fix sits on this branch as a leftover from the first pass, the other workstreams are not started)
> **Triggered by :** issue [#286](https://github.com/oculix-org/Oculix/issues/286) (NPE on minimal record session)
> **Scope :** Improve the legacy SikuliX-era Recorder UX + code generation, fix #286 along the way, ship as part of v3.0.4 or v3.0.x patch
> **Out of scope :** the Modern Recorder (separate pipeline under `org.sikuli.ide.ui.recorder.*`, no overlap with this doc)

---

## 1. Why this exists

Two recorders coexist in OculiX :

| Path | Code root | Audience | Output |
|---|---|---|---|
| **Legacy Recorder** (this doc) | `API/.../support/recorder/`, `IDE/.../SikulixIDE.ButtonRecord` | Devs who want editable Python script | Raw `click(Pattern(...))`, `dragDrop(...)`, `type("text")` lines inserted into the active script pane |
| **Modern Recorder** | `IDE/.../ui/recorder/` | QA / non-devs who want no-code workflow | Assistant dialog + visual config + code generation via `ICodeGenerator` plugins |

Decision (recorded on issue #286 second-pass comment) : **both stay**, both get improved. The legacy keeps its "you-get-real-Python" promise — but the current implementation has three real problems we address here.

---

## 2. Problems addressed

### 2.1. NPE on the last event of the session (issue #286)

`RecordedEventsFlow.handleMouseEvent` does a forward lookahead on every event :

| Current event | What the lookahead checks | If `nextEvent == null` (last event) |
|---|---|---|
| `PRESSED`  | Is the next `DRAGGED`? → it's a drag | NPE on `nextEvent.getID()` |
| `RELEASED` | Is the next `PRESSED` within `DOUBLE_CLICK_TIME`? → it's a double-click | NPE on `nextEvent.getID()` and `nextTime` |

For sessions with multiple recorded events, the last event is usually a noise `mouseMove` that the compiler short-circuits before reaching the unsafe branch. For sessions with **exactly one action** (the minimal repro filed by @robserm), the last `RELEASED` hits the unsafe branch directly. Deterministic NPE in `Thread-7`, fatal for the compile step, script pane stays empty, only a stderr trace.

Bug present since the SikuliX 2.0 era (April 2021) — never re-touched.

### 2.2. The "IDE disappears with zero feedback" UX

`SikulixIDE.ButtonRecord.actionPerformed` calls `ideWindow.setVisible(false)` then `recorder.start()`. The IDE simply vanishes. From the user's perspective :

- No indication that recording is active
- No reminder of the stop hotkey (default `Shift+Alt+C` on Win/Linux, `Shift+Cmd+C` on Mac, configurable in preferences but never displayed)
- No live readout of what's being captured
- No way to abort cleanly (re-clicking the IDE icon in the taskbar likely cancels the session silently)

This is the classic "modal action without affordances" anti-pattern. Modern screen-recorder products (OBS, Camtasia, Loom) always show a floating overlay during capture.

### 2.3. The generated code is functional but sparse

Current output for a typical session :

```python
wait(Pattern("1778677264320.png").targetOffset(15,8)).click()
dragDrop(Pattern("1778677315688.png").targetOffset(133,-5), Pattern("1778677316129.png").targetOffset(148,0))
```

It works, but :

- Image filenames are raw epoch-millisecond timestamps — unreadable, hard to refactor
- No `similar()` adjustment exposed (always uses defaults)
- `wait()` insertion is automatic but uses default timeout — no clean way to tune per-action
- No optional error handling / `try/except` wrapper
- No comments documenting what was clicked / typed when

---

## 3. Proposed workstreams

### 3.1. Workstream A — fix the NPE (small, ~ 5 lines)

**File :** `API/src/main/java/org/sikuli/support/recorder/RecordedEventsFlow.java`

**Change :** `handleMouseEvent` — null-guard `nextEventEntry`, treat null as "isolated event, finalize as-is".

```java
Map.Entry<Long, NativeInputEvent> nextEventEntry = getNextEvent(time);
Long nextTime = nextEventEntry != null ? nextEventEntry.getKey() : null;
NativeInputEvent nextEvent = nextEventEntry != null ? nextEventEntry.getValue() : null;

if (NativeMouseEvent.NATIVE_MOUSE_PRESSED == event.getID()) {
    ...
    if (nextEvent != null && NativeMouseEvent.NATIVE_MOUSE_DRAGGED == nextEvent.getID()) {
        ... drag setup ...
    }
} else if (NativeMouseEvent.NATIVE_MOUSE_RELEASED == event.getID()) {
    ...
    if (nextEvent == null
        || nextEvent.getID() != NativeMouseEvent.NATIVE_MOUSE_PRESSED
        || time - DOUBLE_CLICK_TIME > nextTime
        || clickCount >= 2) {
        ... finalize click ...
    }
}
```

**Test :** add a JUnit test that builds a single-event `events` map and asserts no exception, single `ClickAction` produced.

**Companion fix :** `handleKeyEvent` line ~141 has the same unsafe `nextEventEntry.getValue().getID()` pattern. Treat the same way (null-guard, "no follower → finalize the modifier as standalone").

**Status :** the mouse-side fix is already on this branch as commit `d59b4230` (carried over from the original `fix/issue-286-recorder-last-event-npe` branch — the key-side companion fix and the JUnit test are still TODO).

### 3.2. Workstream B — live recording overlay

**Goal :** semi-transparent floating window visible during the entire record session, showing :

- Big red dot + "Recording" label (top-left, ~ 20 px)
- The stop hotkey, always visible : "Stop : Shift+Alt+C"
- Action log scrolling in real time : "✓ Click (340, 220)", "✓ Type 'hello'", "→ Recording mouse move..."
- A pause/stop button (in addition to the hotkey, for users who lost track)
- Auto-positioned top-right of the primary screen, always-on-top, drag-handle if user wants to move it

**Architecture proposal :**

| Component | Responsibility |
|---|---|
| `RecorderOverlayWindow extends JWindow` | The floating UI. `setAlwaysOnTop(true)`, semi-transparent background (`setBackground(new Color(0,0,0,180))`), `setFocusableWindowState(false)` so it never steals keystrokes |
| `RecorderEventListener` | Hooks into the existing `Recorder.start()` event stream, pushes summarized lines into the overlay's `actionLog` |
| `Recorder` integration | `Recorder.start()` instantiates and shows the overlay ; `Recorder.stop()` disposes it |
| Translation keys | `recorder.overlay.title`, `recorder.overlay.stopHint`, `recorder.overlay.action.click`, ... (i18n via existing `_I()` infrastructure) |

**Open question :** the user's mouse can pass *through* the overlay (otherwise we record clicks on our own overlay). Solution : `setIgnoreMouseEvents(true)` on the JWindow, or use a per-pixel-alpha translucent shape with click-through. Test on Win10/11 + Linux/X11 + Mac.

### 3.3. Workstream C — richer code generation

**Goal :** the output is still raw Python, but cleaner and more useful out of the box.

**Changes :**

| Today | After |
|---|---|
| `Pattern("1778677264320.png")` | `Pattern("save_button_at_340_220.png")` — image filename built from the closest text label OCR'd around the click point, or fallback to `action_001_click.png` if no text found |
| `wait(Pattern(...)).click()` | `wait(Pattern("save_button.png"), 5).click()` — explicit timeout, parametrizable via a recorder preference |
| (no comments) | `# Recorded 2026-05-13 14:35 — clicked "Save" button` (auto-generated comment, optional via preference) |
| (no error handling) | Optional `try / except FindFailed:` wrapper around blocks (off by default, on if user toggles "Generate defensive code" in the recorder config dialog) |
| `dragDrop(P, P)` | Same, with named filenames |

**Files to touch :**
- `API/.../recorder/actions/ClickAction.java`, `DragDropAction.java`, etc. — extend `generate(ICodeGenerator)` to use the new filenames + optional comments
- `API/.../recorder/Recorder.java` — add image-naming hook that calls OCR (existing `OCR.readText()` in the API) on the captured pattern region to extract a label
- `IDE/.../SikulixIDE.java` — add a small config dialog before `recorder.start()` (similar to what the Modern Recorder does) to toggle the new options

**Open question :** OCR-based naming adds a few hundred ms per click. Acceptable for record sessions (not real-time). But should be opt-out via a fast-mode preference.

---

## 4. Roadmap

| Phase | Workstream | Effort | Target |
|---|---|---|---|
| Phase 1 | A — NPE fix + JUnit test + handleKeyEvent companion | ~ 1 day | Could ship as 3.0.3.1 hotfix OR bundle with phases 2/3 |
| Phase 2 | B — Live recording overlay | ~ 3-5 days | v3.0.4 or v3.1.0 |
| Phase 3 | C — Richer code generation | ~ 3-5 days | v3.0.4 or v3.1.0 |

Decision (per issue #286 second-pass comment) : **bundle all three** for a single legacy-recorder release rather than chain hotfixes. Reduces release noise, gives reviewers/users one coherent thing to validate. The 3.0.3.1 version bump that was on this branch has been reverted to make space for that bundled release version (likely 3.0.4).

---

## 5. Open questions / decisions to make before coding

- [ ] Bundle or hotfix-then-feature ? → second-pass comment says bundle, confirm before starting
- [ ] Overlay click-through implementation on Linux (X11 quirks with `setIgnoreMouseEvents`) — needs spike
- [ ] OCR-based image naming — opt-in or opt-out by default ?
- [ ] Where does the optional `try/except` wrapper live in the AST (around each action or around the whole block) ? Probably block-level with `IRecordedAction.SessionBoundary` markers
- [ ] Modern Recorder integration : does the live overlay also apply when starting via the Modern Recorder's `RecorderAssistant`, or is it legacy-only ? Probably legacy-only at first

---

## 6. Related

- Issue : [#286 — NullPointerException when recording events](https://github.com/oculix-org/Oculix/issues/286)
- First-pass diagnostic : [#issuecomment-4441217390](https://github.com/oculix-org/Oculix/issues/286#issuecomment-4441217390)
- Second-pass direction : [#issuecomment-4441340424](https://github.com/oculix-org/Oculix/issues/286#issuecomment-4441340424)
- Modern Recorder (separate pipeline) : `IDE/src/main/java/org/sikuli/ide/ui/recorder/`

---

🦎
