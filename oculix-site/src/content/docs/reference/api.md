---
title: API reference
description: Every public class and method exposed by OculiX, organized by purpose.
---

This page is a navigable index of the OculiX API. For full method signatures and parameter descriptions, see the [Javadoc on javadoc.io](https://javadoc.io/doc/io.github.oculix-org/oculixapi).

The package layout mirrors SikuliX so existing scripts keep working unchanged. Most users only ever need a handful of classes from `org.sikuli.script`.

## Core — visual matching

| Class                | Purpose                                                                          |
| -------------------- | -------------------------------------------------------------------------------- |
| `Screen`             | A physical monitor. `Screen(0)` is primary. Inherits `Region`.                   |
| `Region`             | A rectangular search area. Where every `find / click / type` lives.              |
| `Pattern`            | An image plus matching parameters (`similar()`, `targetOffset()`).               |
| `Match`              | A successful find — a `Region` enriched with score and original pattern.         |
| `Location`           | A single (x, y) point.                                                           |
| `Image`              | A captured or loaded image, decoupled from disk.                                 |
| `ScreenImage`        | A `BufferedImage` plus its origin region — what `capture()` returns.             |
| `Finder`             | Low-level OpenCV wrapper. `findFeatures()` lives here.                           |
| `FindFailed`         | Exception raised when no match meets the similarity floor.                       |
| `ImageMissing`       | Exception raised when a referenced image file is not on disk.                    |
| `Settings`           | Static configuration: `MinSimilarity`, `WaitScanRate`, `AutoWaitTimeout`, …      |

### `Region` — the workhorse

The five matching verbs:

```java
Match  find(Object target);                  // throw FindFailed
Match  exists(Object target);                // null if not found
Match  exists(Object target, double timeout);
Match  wait(Object target, double timeout);
boolean waitVanish(Object target, double timeout);
Iterator<Match> findAll(Object target);
```

The action verbs (every one returns the target it acted on, for chaining):

```java
int click(Object target);
int doubleClick(Object target);
int rightClick(Object target);
int hover(Object target);
int type(String text);
int type(Object target, String text);        // click first, then type
int paste(String text);
int dragDrop(Object from, Object to);
int mouseDown(int buttons);
int mouseUp(int buttons);
int wheel(int direction, int steps);
int keyDown(String keys);
int keyUp(String keys);
```

Subregion operations (all return a new `Region`):

```java
Region above(int n);
Region below(int n);
Region left(int n);
Region right(int n);
Region inside();
Region nearby(int n);
Region grow(int width, int height);
Region morphTo(Region other);
```

### `Pattern`

```java
Pattern p = new Pattern("button.png")
    .similar(0.85)            // similarity floor
    .targetOffset(20, 5);     // click 20 px right, 5 px down of center
```

### `Screen`

```java
Screen.getNumberScreens();    // how many monitors?
Screen s = new Screen(0);     // primary
Screen s = new Screen(1);     // secondary
s.capture();                  // ScreenImage of the whole screen
s.capture(region);            // ScreenImage of a sub-region
```

## OCR — text on screen

| Class                | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `TextRecognizer`     | Bundled Tesseract front-end. Used by `Region.text()`.              |
| `PaddleOCREngine`    | HTTP client for the PaddleOCR server (`localhost:5000`).           |
| `PaddleOCRClient`    | Low-level transport — most users call `PaddleOCREngine` instead.   |

```java
String all = region.text();
Match label = region.findText("Submit");

PaddleOCREngine ocr = new PaddleOCREngine();
String json = ocr.recognize(screenImage.getFile());
int[] xywh = ocr.findTextCoordinates(json, "Submit");
Map<String, Double> all = ocr.parseTextWithConfidence(json);
```

See the [OCR guide](/guides/ocr/) for the full story.

## Remote screens

| Class               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `VNCScreen`         | A `Screen` backed by a remote VNC server. Same API as `Screen`.          |
| `VNCRobot`          | Low-level input event injection over VNC.                                |
| `VNCClient`         | The raw VNC protocol client.                                             |
| `VNCFrameBuffer`    | Decoded pixel buffer of the remote screen.                               |
| `VNCClipboard`      | Bidirectional clipboard sync.                                            |
| `XKeySym`           | 2200+ X11 key symbol definitions.                                        |
| `ThreadLocalSecurityClient` | Per-thread auth context for parallel VNC sessions.               |

```java
VNCScreen vnc = VNCScreen.start("192.168.1.10", 5900, "password", 1920, 1080);
vnc.click("button.png");
vnc.type("hello");
vnc.stop();
```

## Android — ADB

| Class               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `ADBScreen`         | A `Screen` backed by an Android device over ADB.                         |
| `ADBDevice`         | Direct device control (`tap`, `swipe`, `key`, `shell`).                  |
| `ADBClient`         | Low-level ADB protocol client. Embedded `jadb` — no `adb` binary needed. |
| `ADBRobot`          | Input event injection.                                                   |

```java
ADBScreen android = ADBScreen.start("/path/to/adb");
android.click("button.png");
android.getDevice().tap(540, 1200);
```

Tested on Android 12+ via USB and WiFi (ADB pairing).

## SSH

| Class               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `SSHTunnel`         | Open an SSH tunnel from Java. Embedded `jcraft/jsch`. No external deps.  |

```java
SSHTunnel tunnel = new SSHTunnel("user", "remote-host", 22, "password");
tunnel.open(5900, "localhost", 5900);  // local 5900 → remote localhost:5900
VNCScreen vnc = VNCScreen.start("localhost", 5900, "", 1920, 1080);
```

## Runners

| Class               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `Runner`            | Dispatch table to language-specific runners.                             |
| `JythonRunner`      | Jython (Python 2.7 on the JVM) — the default.                            |
| `JRubyRunner`       | JRuby.                                                                   |
| `PythonRunner`      | CPython 3 via subprocess.                                                |
| `PowerShellRunner`  | PowerShell (Windows).                                                    |
| `AppleScriptRunner` | AppleScript (macOS).                                                     |
| `RobotFrameworkRunner` | Robot Framework keyword library.                                      |
| `NetworkRunner`     | Distributed remote execution.                                            |
| `ServerRunner`      | Headless HTTP server for CI.                                             |

See the [scripting languages guide](/guides/jython/).

## IDE & workspace

| Class                  | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `SikulixIDE`           | IDE entry point.                                                      |
| `ScriptExplorer`       | The workspace explorer panel.                                         |
| `WelcomeTab`           | First-launch landing tab.                                             |
| `EditorTabPane`        | The script editor with image thumbnails.                              |
| `ConsolePanel`         | The bottom console.                                                   |
| `RecorderAssistant`    | Modern Recorder engine.                                               |

End-users normally don't touch these. They're public so plugin authors can extend the IDE.

## MCP — Model Context Protocol server

`oculix-mcp-server` is a separate Maven module that exposes OculiX as an MCP server (stdio + HTTP). It signs every action with Ed25519 and writes a SHA-256-chained JSONL audit journal, designed for regulated environments.

| Tool exposed via MCP | Maps to                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `Click`              | `Region.click()`                                                     |
| `DblClick`           | `Region.doubleClick()`                                               |
| `RClick`             | `Region.rightClick()`                                                |
| `Find`               | `Region.find()`                                                      |
| `FindText`           | `Region.findText()`                                                  |
| `Exists`             | `Region.exists()`                                                    |
| `Wait`               | `Region.wait()`                                                      |
| `KeyCombo`           | Synthetic key event                                                  |
| `OCR`                | `Region.text()` / `PaddleOCREngine.recognize()`                      |
| `Screenshot`         | `Screen.capture()`                                                   |
| `Type`               | `Region.type()`                                                      |

```xml
<dependency>
  <groupId>io.github.oculix-org</groupId>
  <artifactId>oculix-mcp-server</artifactId>
  <version>3.0.3</version>
</dependency>
```

## Utilities

| Class                   | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `Commons`               | Shared helpers (path resolution, version checks, OCR bootstrap).     |
| `Debug`                 | Logging façade — `Debug.log()`, `Debug.error()`, `Debug.info()`.     |
| `RunTime`               | Runtime introspection (OS, Java version, fat-jar status).            |
| `FileManager`           | Cross-platform file operations used by the IDE.                      |
| `XKeySym`               | X11 keysym definitions for VNC.                                      |
| `SikuliXception`        | Project-wide checked exception.                                      |

## Full Javadoc

→ **[javadoc.io / oculixapi](https://javadoc.io/doc/io.github.oculix-org/oculixapi)**

The Javadoc is auto-generated on every Maven Central release and is the source of truth for method signatures, parameter names, and return types.

## Next

- [CLI reference](/reference/cli/)
- [Migration from SikuliX](/reference/migration/)
