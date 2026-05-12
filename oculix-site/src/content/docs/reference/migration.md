---
title: Migration from SikuliX
description: Move existing SikuliX scripts and projects to OculiX with minimal effort.
---

OculiX is the active continuation of [SikuliX1](https://github.com/RaiMan/SikuliX1), which was archived in March 2026 after two decades of community work. This page explains how to bring a SikuliX project to OculiX.

**The short version:** for 95 % of scripts, you change nothing. Open them, hit run.

## What stays the same

- `.sikuli` bundles open as-is. The format is identical.
- The Jython API is 100 % compatible. `from sikuli import *` works.
- Image files are read with the same conventions and search paths.
- Settings (`Settings.MinSimilarity`, `WaitScanRate`, etc.) keep the same names and defaults.
- Robot Framework / JRuby / PowerShell runners are still there.

If you've been running SikuliX 2.0.5 in production, the upgrade path is "drop the new JAR in place of the old one."

## What changes — Maven coordinates

Old SikuliX:

```xml
<dependency>
  <groupId>com.sikulix</groupId>
  <artifactId>sikulixapi</artifactId>
  <version>2.0.5</version>
</dependency>
```

New OculiX:

```xml
<dependency>
  <groupId>io.github.oculix-org</groupId>
  <artifactId>oculixapi</artifactId>
  <version>3.0.3</version>
</dependency>
```

`groupId` and `artifactId` both change. The package layout (`org.sikuli.script.*`) is preserved so your imports don't move.

## What changes — OpenCV dependency

SikuliX shipped against `org.openpnp:opencv`. OculiX ships against **Apertix**, a custom JNA-based OpenCV 4.10.0 build:

```xml
<dependency>
  <groupId>io.github.julienmerconsulting.apertix</groupId>
  <artifactId>opencv</artifactId>
  <version>4.10.0-0</version>
</dependency>
```

If your project explicitly depends on `org.openpnp:opencv`, replace it with the Apertix dependency. If you didn't add OpenCV manually (most users), this happens transparently.

## What's new in OculiX (compared to SikuliX 2.0.5)

These are additions — nothing in the SikuliX API was removed.

| Capability               | SikuliX 2.0.5            | OculiX 3.0.3                                |
| ------------------------ | ------------------------ | ------------------------------------------- |
| VNC remote screens       | Limited                  | Full stack: `VNCScreen`, `VNCRobot`, …      |
| Android via ADB          | —                        | `ADBScreen`, `ADBDevice`, `ADBRobot`        |
| Native SSH tunnels       | —                        | `SSHTunnel` with embedded `jcraft/jsch`     |
| PaddleOCR                | —                        | `PaddleOCREngine` HTTP client                |
| OpenCV                   | 3.x (openpnp)            | 4.10.0 (Apertix, JNA)                       |
| OCR Tesseract            | Manual install            | Bundled via Legerix                         |
| Modern Recorder          | Basic                    | Swipe, DragDrop, Wheel, KeyCombo, image lib |
| Workspace / Script Explorer | —                     | Full workspace management with cards        |
| Apple Silicon            | Rosetta only             | Native (M1/M2/M3) from 3.0.2                |
| Linux fat-jar size       | ~ 250 MB                 | ~ 200 MB (3.0.3 trims 50 MB)                |
| Windows fat-jar size     | ~ 350 MB                 | ~ 236 MB (3.0.3 trims 114 MB)               |
| Universal `type()`       | ASCII only on Mac/Win    | UTF-8 via auto-clipboard routing (3.0.3)    |
| CLI `-l … -e`            | —                        | Available cross-platform                    |
| MCP server               | —                        | `oculix-mcp-server` module                  |
| Theme system             | —                        | Dark / light with persistent preference     |
| IDE auto-recovery        | Best effort              | Periodic save to `~/.OculiX/recovery/`      |

## Things to double-check after migration

1. **Java version** — OculiX requires Java 11+. SikuliX accepted Java 8. If you were on 8, upgrade to Temurin 11 or 17 LTS.
2. **macOS permissions** — re-grant *Accessibility* and *Screen Recording* to the new Java runtime. macOS treats `oculixide.jar` as a different app from `sikulix.jar`.
3. **Headless mode** — if you ran SikuliX with `-jar sikulixide.jar` and a custom display, switch to `-c` for console mode in OculiX.
4. **Old `.sikuli` bundles** with embedded Jython 2.5 scripts: still work, but `print "..."` may trigger deprecation warnings. Add `from __future__ import print_function` at the top to silence them.

## Side-by-side: a small example

Same script, both worlds:

```python
# SikuliX 2.0.5
from sikuli import *
click("button.png")
wait("done.png", 5)
type("hello\n")
```

```python
# OculiX 3.0.3
from sikuli import *
click("button.png")
wait("done.png", 5)
type("hello\n")
```

That's not a typo — they're identical.

## Need help?

If a migration hits something unexpected, open an issue on [oculix-org/Oculix](https://github.com/oculix-org/Oculix/issues) with:

- Your OculiX version (`java -jar oculixide.jar -v`)
- Your Java version (`java -version`)
- The smallest reproducer you can extract
- The full stack trace from the IDE console

SikuliX regressions get **top priority** on the OculiX bug tracker — see [CONTRIBUTING.md](https://github.com/oculix-org/Oculix/blob/master/CONTRIBUTING.md).

## Credits to the original work

OculiX exists because of two decades of work by [Raimund Hocke](https://github.com/RaiMan) and the SikuliX community. The continuation is in the same spirit — open, simple, accessible — and the door stays open for the original author to come back and contribute whenever he wants.
