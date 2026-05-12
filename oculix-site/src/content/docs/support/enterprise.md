---
title: Getting help
description: How to ask for help with OculiX — community channels, what to expect, and the door we keep open for organizations.
---

OculiX is free and open source under MIT. It isn't built as a commercial product, there's no SaaS, no usage tracking, no paid SLA out of the box. But none of that means **closed** — if your team is using OculiX seriously, we want to hear about it, and we'll do what we can.

This page explains where to ask, what to expect, and how the door stays open.

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

### Your team uses OculiX at work → just reach out

If a team, a department, or a whole company is running OculiX in production and wants to **talk to the maintainer directly** — about a specific need, an integration question, a roadmap influence, or just to say hello — email **contact@oculix.org** or open a discussion on GitHub.

We're not running an enterprise sales pipeline, but we're also not pretending the project lives in a vacuum. Many of the companies on the [Showcase page](/showcase/) found OculiX through a single engineer's bug report. Real conversations help the project as much as code does.

## What to expect

OculiX is currently maintained by one person, on personal time. The realistic numbers:

| You report a…              | First response in…               |
| -------------------------- | -------------------------------- |
| Reproducible crash         | A few days, often sooner          |
| `FindFailed` you can repro | A week                            |
| Feature request            | Triaged within a week — implementation timeline varies wildly |
| Security advisory          | Acknowledged within 48 hours      |
| Email from an organization | Read within a few days, replied within a week |

Major bugs get same-day fixes when they're reproducible. Speculative bugs ("sometimes it doesn't click") take longer because they need a reliable repro first.

## How far we can go for an organization

OculiX is a small project, not a vendor. But "small" doesn't mean "no" — it means everything is case-by-case, asynchronous, and decided in conversation. Things that have actually happened:

- **A specific bug got prioritized** because a team explained the production impact in a clear issue. That's usually all it takes.
- **A feature got built** because an organization sponsored the maintainer's time to focus on it. No tier, no contract — a discussion and a GitHub Sponsors arrangement.
- **A custom audit / training session** was put together for a team that needed to onboard several engineers at once. Off the books, agreed by email.
- **A patch shipped to `master` faster than the normal RC cycle** because a regulated industry hit it and provided a clean repro.

What we won't do:

- Run a formal vendor-of-record contract with a procurement department — there is no legal entity behind the project for that, today.
- Promise an SLA we can't keep with one maintainer.
- Develop a feature in private without it landing back in the public project.

In short: **if you have a real need, write to us before you assume it's impossible.** The honest answer is often "yes, here's how" or "yes, with this caveat" — not "no."

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

## Auditability & regulated environments

OculiX runs entirely on your machine. Nothing phones home, nothing sends telemetry, no analytics, no auto-update. The optional MCP server module writes an Ed25519-signed, SHA-256-chained JSONL audit journal — designed for environments where every action needs to be auditable.

Where OculiX fits well:

- **Self-hosted, source-available** code under a permissive license
- **Auditable end-to-end** — you can read every line that runs in your build
- **No vendor lock-in** — fork it the day the maintainer disappears

Where it's worth a conversation first:

- If your procurement requires a **signed vendor contract**, talk to us about what's possible — the answer today is informal, but it isn't always "no."
- If you need **SOC 2 / HIPAA / FedRAMP** attestations, the project itself isn't certified — but its architecture (no telemetry, no cloud, no third-party API calls from the runtime) makes it easier to fit into a certified environment you control.

Either way, write to **contact@oculix.org** before you assume it doesn't fit.

## Saying thanks

If OculiX saved you time and you'd like to give back, the most useful things are:

- A good bug report when you find something
- A PR for a fix you've already made locally
- Testing an RC on a platform we don't have
- Translating UI strings into your language
- Letting us cite your organization on the [Showcase page](/showcase/) — or sponsoring on [GitHub Sponsors](https://github.com/sponsors/julienmerconsulting) (see [Sponsors](/community/sponsors/))

We'd love both — a contributor entry **and** a sponsor entry. Either alone is already a huge help.
