---
title: CLI reference
description: Every command-line flag accepted by the OculiX IDE and runners.
---

OculiX can be driven from the command line for scheduled jobs, CI pipelines, headless servers, and one-off scripts. This page documents every flag accepted by the IDE jar and the server runner.

## IDE jar

```bash
java -jar oculixide-3.0.3.jar [options]
```

### Common flags

| Flag                  | Argument         | Purpose                                                       |
| --------------------- | ---------------- | ------------------------------------------------------------- |
| `-l <path>`           | path to bundle   | Open this `.sikuli` bundle on launch                          |
| `-e`                  | —                | Execute the opened bundle immediately and exit on completion  |
| `-r <runner>`         | `py` `py3` `rb` `ps1` `applescript` `robot` | Force a specific runner |
| `-c`                  | —                | Console mode — no GUI, log to stdout                          |
| `-d <level>`          | `0`–`3`          | Debug verbosity (`0` silent → `3` very verbose)               |
| `-v`                  | —                | Print version and exit                                        |
| `-h`                  | —                | Print help and exit                                           |
| `--workspace <dir>`   | directory        | Use this workspace instead of the last-opened one             |
| `--theme <name>`      | `dark` `light`   | Force a theme                                                 |

### Examples

```bash
# Open the IDE on a script
java -jar oculixide-3.0.3.jar -l ./reports/daily.sikuli

# Run a script unattended (cron, Task Scheduler)
java -jar oculixide-3.0.3.jar -l ./reports/daily.sikuli -e

# Run a Python 3 script via the CPython runner
java -jar oculixide-3.0.3.jar -r py3 my_script.py

# Headless console mode — useful inside CI runners
java -jar oculixide-3.0.3.jar -c -l ./tests/smoke.sikuli -e
```

The `-e` flag exit codes:

| Code | Meaning                              |
| ---- | ------------------------------------ |
| `0`  | Script completed without exception   |
| `1`  | Script raised a `FindFailed`         |
| `2`  | Script raised a `SikuliXception`     |
| `3`  | Script raised any other exception    |
| `4`  | Bundle not found / could not be loaded |

So in a CI pipeline:

```bash
java -jar oculixide-3.0.3.jar -l my.sikuli -e
if [ $? -eq 0 ]; then echo "OK"; else echo "Failed"; exit 1; fi
```

## Server runner — headless

```bash
java -jar oculix-server.jar --port 5555 [options]
```

| Flag                  | Argument         | Purpose                                                       |
| --------------------- | ---------------- | ------------------------------------------------------------- |
| `--port <n>`          | TCP port         | Port to bind (default `4567`)                                 |
| `--host <addr>`       | bind address     | Bind address (default `127.0.0.1`)                            |
| `--auth <token>`      | bearer token     | Require this token on every request                           |
| `--tls`               | —                | Enable HTTPS using auto-generated cert                        |
| `--cert <path>`       | PEM file         | Custom TLS certificate                                        |
| `--key <path>`        | PEM file         | Custom TLS private key                                        |
| `--workspace <dir>`   | directory        | Workspace root                                                |
| `--allow-shell`       | —                | Permit `Runner.run()` shell commands (off by default)         |

HTTP API summary:

```
POST /run          { "bundle": "path", "args": [] }   → 200 / 4xx
GET  /status                                          → { "running": false, "lastRun": {...} }
POST /stop                                            → 200
GET  /version                                         → { "version": "3.0.3" }
```

See [`org.sikuli.scriptrunner.ServerRunner`](https://github.com/oculix-org/Oculix/tree/master/API/src/main/java/org/sikuli/scriptrunner) for the full surface.

## MCP server

```bash
java -jar oculix-mcp-server.jar [stdio|http] [options]
```

| Flag                  | Argument         | Purpose                                                       |
| --------------------- | ---------------- | ------------------------------------------------------------- |
| `stdio`               | —                | Use stdio transport (for direct AI agent plug-in)             |
| `http`                | —                | Use HTTP transport (multi-session)                            |
| `--port <n>`          | TCP port         | HTTP transport port                                           |
| `--journal <path>`    | directory        | Where to write the Ed25519-signed audit journal               |
| `--keyring <path>`    | file             | Rotatable HMAC keyring                                        |
| `--confidential`      | —                | Confidential mode — never logs payloads                       |
| `--auto-approve`      | —                | Skip human-in-the-loop ActionGate (use with caution)          |

## Environment variables

| Variable              | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `OCULIX_HOME`         | Override the user-data directory (default `~/.OculiX/`)        |
| `OCULIX_WORKSPACE`    | Default workspace path                                        |
| `OCULIX_TESSDATA`     | Override the bundled Tesseract `tessdata` location            |
| `OCULIX_PADDLEOCR`    | Base URL of the PaddleOCR server (default `http://localhost:5000`) |
| `ANDROID_SERIAL`      | Force a specific ADB device when several are connected        |
| `OCULIX_DEBUG`        | `1` to enable verbose internal logging                        |
| `OCULIX_THEME`        | `dark` or `light`                                             |

## Logging

Every runner writes to:

- **stdout / IDE console** for `info` and `error`
- `~/.OculiX/logs/oculix.log` for the rolling log file
- `~/.OculiX/logs/script-<timestamp>.log` for per-script run logs

Increase verbosity with `-d 3` or `OCULIX_DEBUG=1`.

## Next

- [Migration from SikuliX](/reference/migration/) — for existing scripts
- [API reference](/reference/api/) — every class
