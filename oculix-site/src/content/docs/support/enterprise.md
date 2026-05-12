---
title: Getting help
description: How to ask for help with OculiX — community channels, what to expect.
---

OculiX is free and open source under MIT. The project has no commercial offering — there is no paid support tier, no SLA, no priority hotline. Everything happens in public, on GitHub, where the rest of the project lives.

If your team needs OculiX to be reliable in production, the best thing you can do is **read the docs, test on RCs, and report bugs early** — that's what keeps the project healthy.

## Where to ask

### Bug reports → GitHub Issues

For anything that looks like a bug — crashes, regressions, unexpected behavior, broken docs — open an issue at [oculix-org/Oculix/issues](https://github.com/oculix-org/Oculix/issues).

A good bug report has:

- **What you did** — the smallest script that reproduces the problem
- **What you expected** vs **what happened**
- **Environment** — OS, Java version, OculiX version
- **Stack trace** from the IDE console, copy-pasted

The IDE has **Help → Copy diagnostic info** to grab environment info in one click.

### Questions & discussions → GitHub Discussions

For broader questions ("how do I…?", "what's the best way to…?", "is OculiX a good fit for…?"), use [GitHub Discussions](https://github.com/oculix-org/Oculix/discussions). The community answers there — and so does the maintainer when time allows.

### Security issues → private

For anything sensitive (auth bypass, RCE, credential leakage in logs), **do not open a public issue**. Use GitHub's [private vulnerability reporting](https://github.com/oculix-org/Oculix/security/advisories/new) or email the maintainer (contact on the [GitHub profile](https://github.com/julienmerconsulting)).

See also [SECURITY.md](https://github.com/oculix-org/Oculix/blob/master/SECURITY.md).

## What to expect

OculiX is currently maintained by one person, on personal time. The realistic numbers:

| You report a…              | First response in…               |
| -------------------------- | -------------------------------- |
| Reproducible crash         | A few days, often sooner          |
| `FindFailed` you can repro | A week                            |
| Feature request            | Triaged within a week — implementation timeline varies wildly |
| Security advisory          | Acknowledged within 48 hours      |

Major bugs get same-day fixes when they're reproducible. Speculative bugs ("sometimes it doesn't click") take longer because they need a reliable repro first.

## Things we don't do

- **No paid support contracts.** If your procurement department needs a vendor-of-record, OculiX is not the right tool for that need.
- **No phone hotline.** Everything is asynchronous, on GitHub, in public.
- **No private patches.** All bug fixes land in the next public RC. If you need a fix before then, build from source.
- **No bespoke consulting.** The maintainer's day job is unrelated; OculiX is not the front for a services business.

## Things you can do yourself

### Build from source

If you need a fix that's on `master` but not yet released:

```bash
git clone https://github.com/oculix-org/Oculix.git
cd Oculix
mvn clean install -DskipTests
```

The fat-jars in each module's `target/` directory are exactly what gets uploaded to Maven Central on release.

### Fork and patch

OculiX is MIT-licensed. Fork it, patch the issue you care about, run your own build. If the patch is generally useful, open a PR upstream — it's the highest-leverage thing you can do for the project.

### Subscribe to releases

The fastest way to know a fix is out: watch the repo. **GitHub → Watch → Custom → Releases.** You get an email for every new RC and stable.

## On dependencies for regulated industries

OculiX runs entirely on your machine. Nothing phones home, nothing sends telemetry, no analytics, no auto-update. The MCP server (separate optional module) writes an Ed25519-signed JSONL audit journal designed for environments where every action needs to be auditable.

What OculiX is **not**:

- A SOC 2 / HIPAA / FedRAMP-certified product (no vendor to certify)
- A turnkey procurement vehicle (no commercial entity behind it)
- A support-backed dependency (the maintainer is one human)

What OculiX **is**:

- Source-available code under a permissive license
- Auditable end-to-end (you can read every line that runs in your build)
- Free of vendor lock-in (you fork it the day the maintainer disappears)

For organizations that need a vendor on the other end of the contract, OculiX is probably the wrong choice. For organizations that can absorb a self-hosted, source-available tool — and there are many — OculiX fits.

## Saying thanks

If OculiX saved you time and you'd like to give back, the most useful things are:

- A good bug report when you find something
- A PR for a fix you've already made locally
- Testing an RC on a platform we don't have
- Translating UI strings into your language
- A sponsorship on [GitHub Sponsors](https://github.com/sponsors/julienmerconsulting) — see [Sponsors](/community/sponsors/)

We'd rather you joined the contributors list than wrote a check.
