---
title: Vision pipeline
description: How OculiX sees the screen — Apertix, OpenCV, template & feature matching.
---

This page is for anyone who wants to understand *why* OculiX finds (or fails to find) a match. The TL;DR: under every `find()` is OpenCV's `matchTemplate` plus a feature-matching fallback, wrapped in a JNA layer (Apertix) that avoids the classic Java native-library conflicts.

## Stack overview

```
 Your script (Jython / Java)
        │
        ▼
 sikuli.script.{Screen, Region, Pattern}
        │
        ▼
 org.sikuli.script.Finder      ←—— similarity, target offset, region clipping
        │
        ▼
 Apertix (OpenCV 4.10.0 via JNA)
        │
        ▼
 Native OpenCV libs (bundled in JAR)
```

## Apertix — why we don't use vanilla OpenCV

OculiX depends on **Apertix**, a custom JNA-based build of OpenCV 4.10.0. It replaces the more common `org.openpnp:opencv` artifact for two reasons:

1. **No `System.loadLibrary` conflict.** Apertix loads through JNA, which means it doesn't fight other native libraries also using JNI on Windows (a classic problem when mixing OpenCV with VNC libraries or JFreeChart).
2. **Pinned OpenCV 4.10.0** compiled from source on Windows x86-64 with MSVC. Every OculiX release is built against the exact same OpenCV version, so behavior is reproducible across machines.

Maven coordinates:

```xml
<dependency>
  <groupId>io.github.julienmerconsulting.apertix</groupId>
  <artifactId>opencv</artifactId>
  <version>4.10.0-0</version>
</dependency>
```

Apertix repo: [github.com/julienmerconsulting/Apertix](https://github.com/julienmerconsulting/Apertix).

## Template matching — the default

When you call `Region.find("button.png")`, OculiX runs OpenCV's [`matchTemplate`](https://docs.opencv.org/4.10.0/df/dfb/group__imgproc__object.html) with `TM_CCOEFF_NORMED`:

1. The captured `button.png` becomes a **template**.
2. The current screenshot of the region becomes the **scene**.
3. `matchTemplate` slides the template across every pixel of the scene and computes a normalized correlation score in [0.0, 1.0].
4. The pixel with the highest score is the candidate match.
5. If that score ≥ `similarity` (default 0.7), OculiX returns a `Match`; otherwise it raises `FindFailed`.

Template matching is **pixel-precise** but **scale-sensitive**: if the same button is rendered 10 % larger on the target screen (high DPI, theme change), the match score drops. Two strategies:

- **Adjust similarity**: `Pattern("button.png").similar(0.6)` widens tolerance.
- **Re-capture at the target scale**: simple, robust, fast.

## Feature matching — for resilience

When template matching fails too often (rotation, scaling, light changes), OculiX falls back to feature matching:

```python
finder = Finder(image)
finder.findFeatures("logo.png")
if finder.hasNext():
    print finder.next()
```

Feature matching uses ORB descriptors (Oriented FAST and Rotated BRIEF). It's slower than template matching but robust to small rotations, partial occlusion, and moderate scaling. Use it when:

- The target moves *within* a window (drag-and-drop scenarios)
- The target rotates (compass widgets, rotating progress indicators)
- The same image is shown at multiple sizes (responsive UIs)

## Region operations under the hood

`Region.right(N)` doesn't capture anything new — it just adjusts the search rectangle. The actual screen capture happens **lazily** at the next `find()`, `wait()`, or `click()` call.

This is why nested `find()` calls scoped to a small region are dramatically faster than a `find()` on the whole screen — you're reducing the number of pixels OpenCV has to scan.

```python
# Good — OpenCV scans 300 × 50 px
btn = dialog.right(300).find("save.png")

# Bad — OpenCV scans 1920 × 1080 px on every call
btn = Screen(0).find("save.png")
```

## Multi-monitor

Each monitor has its own `Screen(n)` instance. `Screen(0)` is the primary. `Screen.getNumberScreens()` tells you how many you've got.

```python
for i in range(Screen.getNumberScreens()):
    s = Screen(i)
    print "Screen %d: %d × %d at (%d, %d)" % (i, s.getW(), s.getH(), s.getX(), s.getY())
```

Captures and matches stay within a single `Screen` unless you explicitly merge regions across them.

## Highlight — your debugger

The single most useful tool when a script misbehaves:

```python
match = find("button.png")
match.highlight(2)              # red box for 2 s
match.highlight(2, "green")
```

You see exactly where OculiX believes the match is. 90 % of "why didn't it click the right thing?" bugs become obvious within 5 seconds of running with `.highlight()` added.

## Slow Motion mode

**Run → Run Slow Motion** in the IDE adds a brief highlight before every action. Use it for:

- Demoing a script to a non-technical stakeholder
- Debugging an intermittent miss-click
- Recording a screencast of an automation walkthrough

## Settings that change the pipeline

```python
Settings.MinSimilarity = 0.7    # default similarity floor
Settings.AlwaysResize = 1.0     # pre-scale captures by N before matching
Settings.WaitScanRate = 3       # OpenCV scans per second during wait()
Settings.MoveMouseDelay = 0.3   # cursor glide time (visual feedback)
Settings.AutoWaitTimeout = 3.0  # implicit wait before every action
Settings.SaveLastImage = True   # dump the last failed match to ./lastImage.png
```

The `SaveLastImage` toggle is gold for debugging in CI: when a `find()` fails in a headless job, the last captured screen is written to disk for post-mortem.

## VNC, ADB, and the same pipeline

The vision pipeline is **independent of the source**. `VNCScreen`, `ADBScreen`, and the local `Screen` all expose the same `find/click/type` API — they just produce screenshots from different places. The OpenCV stack downstream doesn't care whether the image came from your monitor, an Android phone via ADB, or a remote machine via VNC.

```python
# Same script, three different sources
local_btn   = Screen(0).find("save.png")
android_btn = ADBScreen.start(adb_path).find("save.png")
remote_btn  = VNCScreen.start("192.168.1.10", 5900, "", 1920, 1080).find("save.png")
```

## Performance numbers

Rough order of magnitude on a 2024 mid-range laptop, 1920×1080 screen, 100×30 button:

| Operation                          | Wall-clock time |
| ---------------------------------- | --------------- |
| `Screen(0).capture()`              | ~30 ms          |
| `find()` on whole screen           | ~50 ms          |
| `find()` on 300×100 region         | ~5 ms           |
| `findFeatures()` on whole screen   | ~200 ms         |
| `Region.text()` Tesseract OCR      | ~150 ms         |
| `PaddleOCREngine.recognize()`      | ~300 ms (CPU)   |

OCR is roughly 10× slower than image matching. Use image matching whenever the target's appearance is stable.

## Next

- [Jython scripting](/guides/jython/) — driving the pipeline from Python
- [API reference](/reference/api/) — `Finder`, `Pattern`, `Match`, `Settings`
- [Visual matching guide](/guides/visual-matching/) — the user-facing recipes
