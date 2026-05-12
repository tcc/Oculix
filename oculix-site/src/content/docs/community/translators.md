---
title: Translators
description: The humans behind OculiX in your language — and how to add a new one.
---

OculiX is a multilingual project. The IDE, the docs, and (over time) the error messages all aim to be available in the language of the people using them. None of that happens without the translators below — they review hundreds of strings, push back on awkward phrasings, and make sure technical concepts land naturally in their language.

## Locale leads

| Locale | Status | Lead |
| ------ | ------ | ---- |
| **en (English)** | reference | maintainer-owned |
| **fr (Français)** | UI partial, docs in progress | maintainer-owned |
| **zh_CN (简体中文)** | Phase 3 reviewed (~150 keys) | [@peixuana](https://github.com/peixuana) |

### @peixuana — zh_CN

[@peixuana](https://github.com/peixuana) joined the project to do something that very few people do: read every translated string critically, in context, and propose corrections grounded in how Chinese speakers actually phrase software UI. The Phase 3 review covered ~150 keys spanning the menus, dialogs, recorder, and welcome tab. The diff was small in line count but enormous in quality.

If you write code that ends up in front of a Chinese-reading user, please run it past peixuana first.

## Locales in progress

These are partially translated and could use a maintainer:

- **es (Español)**
- **de (Deutsch)**
- **ja (日本語)**
- **pt-BR (Português brasileiro)**
- **it (Italiano)**

## How to become a locale lead

1. **Pick a locale** that's currently unmaintained or where you can add value.
2. **Open an issue** tagged `i18n` with `[lang_code]` in the title (e.g. `[de] German locale lead`).
3. We'll set up the file structure under `IDE/src/main/resources/.../<locale>/` and the corresponding docs folder under `oculix-site/src/content/docs/<locale>/`.
4. You translate as many strings as you have time for. You commit to reviewing future PRs that touch your locale's files — that's the whole "lead" commitment.

A locale lead is **not** a full-time job. Most weeks there's nothing to do. The cadence is "every few releases, a handful of new strings need translation." That's it.

## Translation files

UI strings: `IDE/src/main/resources/org/sikuli/ide/i18n/I18nMessages_<locale>.properties`

Docs: `oculix-site/src/content/docs/<locale>/**/*.md`

Astro/Starlight auto-generates the locale switcher and the routing — your only job is to write good prose.

## How we decide on phrasings

When there's ambiguity:

1. **Native speakers win** — the lead has the final call on their locale.
2. **Match conventional software vocabulary** — if every Chinese-language software calls it `设置` (Settings) rather than `配置` (Configurations), use `设置`.
3. **Prefer clarity over literal translation** — English "Find" might map to two different verbs in your language depending on whether it's a menu action or a method name. Choose what reads best.
4. **Leave technical terms in English** when there's no good native equivalent (e.g. "Pattern", "Match", "Region" stay English in code-adjacent contexts).

## Thank you

To every translator who's contributed — peixuana for the careful zh_CN review, and the contributors who have suggested fixes on individual strings. OculiX speaking more languages is what turns it from "a project" into "a tool people use at work in their own language."

If you'd like to be on this page, [open an issue](https://github.com/oculix-org/Oculix/issues/new?labels=i18n) and let's get started.
