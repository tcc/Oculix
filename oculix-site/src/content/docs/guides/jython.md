---
title: Scripting languages
description: Jython is the default — but OculiX also runs JRuby, Python (CPython), PowerShell, AppleScript, and Robot Framework.
---

OculiX is multi-language. The default is **Jython** (Python 2.7 on the JVM) for historical and ergonomic reasons — but the runtime layer exposes a `Runner` API that can execute scripts in any supported language.

## Jython — the default

When you open a `.sikuli` bundle in the IDE, you're writing **Jython**: Python 2.7 syntax, running inside the JVM, with full access to every Java class on the classpath.

```python
from sikuli import *
import java.util.Date as Date

# Plain Python
greeting = "Hello, " + getDate()
print greeting

# Java interop — instantiate any JVM class
date = Date()
print date.toString()

# OculiX API
click("button.png")
wait("done.png", 5)
```

### What you keep from CPython

- Indentation-based blocks
- `def`, `class`, `for`, `while`, `if/elif/else`
- `import` for both pure-Python modules and Java classes
- Standard library modules that don't depend on C extensions (`os`, `sys`, `re`, `json`, `datetime`, `collections`, etc.)

### What you lose

Jython is Python 2.7 — so:

- **No f-strings.** Use `%` formatting or `.format()`.
- **No `print()` as a function** unless you `from __future__ import print_function`.
- **No C extensions.** No `numpy`, no `pandas`, no `requests`. JVM equivalents work (`java.net.URL`, `org.json`, etc.).

### Why Jython, not Python 3

Two reasons:

1. **SikuliX compatibility.** Every existing SikuliX script written between 2010 and 2026 runs in OculiX unchanged. That backwards compatibility matters to thousands of teams.
2. **Single JVM process.** No subprocess, no FFI cost, no startup penalty. The entire script and the entire OculiX engine share the same JVM.

A CPython 3 wrapper (**Operix**) is on the roadmap — it will call OculiX over py4j so you can write Python 3 with all the modern conveniences. See the [README ecosystem section](https://github.com/oculix-org/Oculix#-ecosystem).

## Other runners

The `Runner` API in `org.sikuli.script.Runner` dispatches to language-specific implementations. All of these are bundled.

### JRuby

```ruby
require 'sikuli'
Sikuli::screen.click("button.png")
Sikuli::screen.type("hello\n")
```

Same surface as Jython but with Ruby ergonomics. Good for teams already invested in JRuby.

### CPython 3 (via subprocess)

```bash
java -jar oculixide.jar -r py3 my_script.py
```

Launches the system `python3` and pipes script + OculiX API calls. Lets you use modern Python libraries (`numpy`, `pandas`, `requests`) at the cost of a subprocess hop.

### PowerShell

```powershell
# my_workflow.ps1
$screen = New-Object org.sikuli.script.Screen
$screen.Click("button.png")
$screen.Wait("done.png", 5)
```

Useful for Windows-centric pipelines where the rest of the toolchain is PowerShell-based.

### AppleScript

```applescript
-- my_macos_task.scpt
tell application "OculiX"
  click image "button.png"
  wait image "done.png" with timeout 5
end tell
```

macOS-only. Integrates OculiX into Automator workflows and Shortcuts.

### Robot Framework

```robotframework
*** Settings ***
Library    OculiXLibrary

*** Test Cases ***
Submit Form
    Click    submit_button.png
    Wait     confirmation.png    5
```

The Robot Framework keyword library wraps the OculiX API in Robot's verbose-but-readable syntax. Great for QA teams already on Robot.

### Server runner — headless CI

```bash
java -jar oculix-server.jar --port 5555
```

Runs OculiX in headless mode, accepting scripts over an HTTP API. Designed for CI runners and orchestration tools that need to fire scripts remotely without launching a full IDE.

### Network runner — distributed execution

`org.sikuli.scriptrunner.NetworkRunner` lets you run a script on machine **A** while OculiX is invoked from machine **B**. Use case: a control plane on your laptop kicking off scripts on multiple agent machines simultaneously.

## Calling Java from Jython

Any JVM library you've added to the classpath is callable directly:

```python
import java.io.File as File
import java.nio.file.Files as Files
import java.nio.file.Paths as Paths

# Native JDK file I/O
content = Files.readString(Paths.get("config.json"))
print content
```

For OculiX-specific classes:

```python
from org.sikuli.script import Screen, Region, Pattern, Match
from org.sikuli.script import VNCScreen, ADBScreen
from org.sikuli.script import PaddleOCREngine
```

## Reusable modules

Drop a `.py` file next to your `.sikuli` bundle and import it like any Python module:

```python
# my_helpers.py
def login(user, password):
    click("user_field.png")
    type(user + "\t" + password + "\n")
    wait("home.png", 10)
```

```python
# main.sikuli/main.py
from my_helpers import login
login("alice", "hunter2")
```

OculiX adds the bundle's parent directory to `sys.path` automatically.

## Common patterns

### Retry with timeout

```python
def click_until(image, total_timeout=30):
    end = time.time() + total_timeout
    while time.time() < end:
        if exists(image):
            click(image)
            return True
        wait(1)
    raise FindFailed(image)
```

### Branch on what's visible

```python
if exists("dialog_yes.png"):
    click("yes.png")
elif exists("dialog_no.png"):
    click("no.png")
else:
    click("default_action.png")
```

### Loop over rows in a table

```python
rows = findAll("row_anchor.png")
for r in rows:
    r.right(200).click()    # click 200 px right of each row
```

## Debugging

```python
Settings.DebugLogs = True       # verbose internal logging
Settings.ActionLogs = True      # log every click/type/etc.
Settings.InfoLogs = True

print "About to click " + str(target)
```

All output lands in the IDE console (or stdout if you ran via CLI).

## Next

- [API reference](/reference/api/) — the full class index
- [CLI reference](/reference/cli/) — running scripts headless
- [Migration from SikuliX](/reference/migration/) — for existing scripts
