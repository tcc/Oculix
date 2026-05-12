---
title: Contributing
description: How to help OculiX — bug reports, PRs, docs, RC testing, translations.
---

You spotted something. That's already a contribution.

OculiX is the active continuation of SikuliX1, which was archived in March 2026 after twenty years of community work. A lot of that community is still out there running scripts in production — and a lot of them are discovering OculiX one stack trace at a time. If you're one of them: welcome. This page exists so you know what we need, what we promise in return, and how to spend as little time as possible navigating GitHub etiquette.

The full long-form is in [CONTRIBUTING.md](https://github.com/oculix-org/Oculix/blob/master/CONTRIBUTING.md) — this page summarizes the parts most contributors actually use.

## What helps the most

Not every contribution is code. Ranked roughly from *takes five minutes* to *takes a weekend*:

| You can…                                                                  | Time     | What it unlocks                                              |
| ------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| Open a bug report with a stack trace + OS/Java version                    | 5 min    | A real fix — often same-day                                  |
| Share a script that breaks in OculiX but worked in SikuliX                | 10 min   | Direct regression reproducer, top priority                   |
| Test a release candidate on Linux / macOS / Apple Silicon                 | 15 min   | We have one maintainer's machine; RCs need eyes              |
| Fix a typo or unclear sentence in the docs                                | 5 min    | Every typo fix is appreciated                                |
| Triage an old issue (repro, suggest labels, ask for missing info)         | 30 min   | Huge leverage on signal-to-noise                             |
| Submit a PR for an issue tagged `good first issue`                        | 1-3 h    | Real code lands in the next release                          |
| Translate a locale (UI strings, docs)                                     | few hrs  | OculiX in a new language                                     |
| Port a feature from SikuliX1 that didn't make the OculiX cut              | few hrs  | Direct lineage continuity                                    |
| Build a language wrapper (Python 3, JS, .NET — see issues #177/#178/#179) | week+    | Opens OculiX to a new ecosystem                              |

## Reporting a bug

A great bug report has three things:

1. **What you did** — a script, even partial, that exhibits the bug
2. **What you expected** vs **what happened**
3. **Your environment**: OS + version, Java version, OculiX version

The IDE has a **Help → Copy diagnostic info** that fills in environment for you.

Open issues at [oculix-org/Oculix/issues](https://github.com/oculix-org/Oculix/issues). Tag them with `bug` and, if you can, the affected component (`ide`, `vnc`, `android`, `ocr`, `mcp`, `recorder`, …).

## Submitting a pull request

1. Fork the repo.
2. Branch from `master` with a descriptive name (`fix-vnc-clipboard-utf8`, `feat-ide-dark-theme`).
3. Keep the PR focused — one logical change per PR. Easier to review, faster to merge.
4. Run `mvn clean install -DskipTests` locally before pushing — at minimum, the build must pass.
5. If the change touches user-facing behavior, add a one-line entry under "Unreleased" in `CHANGELOG.md`.
6. Open the PR. The CI runs automatically; the maintainer reviews within a few days.

For larger changes (new modules, breaking changes, architectural shifts), open an issue first to discuss the design.

## Testing a release candidate

Every stable version is preceded by 3–5 RCs. The release pipeline tags them as `vX.Y.Z-rcN` and publishes them on GitHub Releases (not on Maven Central until stable). To help test:

1. Download the RC IDE jar from the [Releases page](https://github.com/oculix-org/Oculix/releases).
2. Run your usual scripts.
3. Open an issue on anything that broke — or comment on the RC release page to say "all good on macOS 14".

RC testing is **the** highest-leverage contribution after bug reports.

## Translations

OculiX ships UI strings and docs in English by default. Other locales currently live or in progress:

- **zh_CN (Simplified Chinese)** — maintained by [@peixuana](https://github.com/peixuana)
- **fr (French)** — UI partial, docs in progress

If you'd like to maintain a locale (Spanish, German, Japanese, …), open an issue tagged `i18n` and we'll set up the file structure.

## Development setup

```bash
git clone https://github.com/oculix-org/Oculix.git
cd Oculix
mvn clean install -DskipTests
```

IntelliJ run configurations are checked in under `.idea/runConfigurations/` — open the project in IntelliJ and the "Run IDE" config is one click away.

## Governance

OculiX has one maintainer ([@julienmerconsulting](https://github.com/julienmerconsulting)) and an ever-growing set of contributors. Decisions are made on GitHub, in public, on issues and PRs. There is no Slack, no Discord (yet), no private channel.

The maintainer reserves the right to:

- Close issues that are out-of-scope or duplicates
- Reject PRs that don't align with the project's direction
- Set the roadmap

In exchange, the maintainer commits to:

- Acknowledge every bug report within a few days
- Review every PR within a week
- Tag a new RC every 2–4 weeks while features are in flight

## Security

For anything sensitive — auth bypass in the MCP server, RCE via crafted scripts, etc. — **do not open a public issue**. Email the maintainer (contact link on the [GitHub profile](https://github.com/julienmerconsulting)) or use GitHub's [private vulnerability reporting](https://github.com/oculix-org/Oculix/security/advisories/new).

See also [SECURITY.md](https://github.com/oculix-org/Oculix/blob/master/SECURITY.md).

## Code of conduct

Be kind. Don't be a jerk. Bug reports are about bugs, not about people. We're all building this together — and most of us are doing it on our own time.

## Thank you

OculiX exists because contributors keep showing up. If you've made it this far down the page, you're already part of the project. 🦎
