---
title: Traducteurs
description: Les humains derrière OculiX dans votre langue — et comment en ajouter une nouvelle.
---

OculiX est un projet multilingue. L'IDE, la doc et (au fil du temps) les messages d'erreur visent tous à être disponibles dans la langue des gens qui les utilisent. Rien de tout cela n'arrive sans les traducteurs ci-dessous — ils relisent des centaines de chaînes, contestent les formulations maladroites et s'assurent que les concepts techniques tombent juste dans leur langue.

## Référents de locale

| Locale | Statut | Référent |
| ------ | ------ | -------- |
| **en (English)** | référence | géré par le mainteneur |
| **fr (Français)** | UI partielle, docs en cours | géré par le mainteneur |
| **zh_CN (简体中文)** | Phase 3 relue (~150 clés) | [@peixuana](https://github.com/peixuana) |

### @peixuana — zh_CN

[@peixuana](https://github.com/peixuana) a rejoint le projet pour faire ce que très peu de gens font : lire chaque chaîne traduite de manière critique, en contexte, et proposer des corrections ancrées dans la façon dont les locuteurs chinois formulent réellement une UI logicielle. La relecture de Phase 3 a couvert ~150 clés réparties entre les menus, les dialogues, le recorder et l'onglet de bienvenue. Le diff était court en lignes mais énorme en qualité.

Si vous écrivez du code qui finit devant un utilisateur sinophone, faites-le passer par peixuana d'abord.

## Locales en cours

Celles-ci sont partiellement traduites et auraient besoin d'un mainteneur :

- **es (Español)**
- **de (Deutsch)**
- **ja (日本語)**
- **pt-BR (Português brasileiro)**
- **it (Italiano)**

## Comment devenir référent de locale

1. **Choisissez une locale** actuellement non maintenue ou sur laquelle vous pouvez apporter de la valeur.
2. **Ouvrez une issue** taguée `i18n` avec `[lang_code]` dans le titre (ex. `[de] German locale lead`).
3. On met en place la structure de fichiers sous `IDE/src/main/resources/.../<locale>/` et le dossier docs correspondant sous `oculix-site/src/content/docs/<locale>/`.
4. Vous traduisez autant de chaînes que vous avez le temps. Vous vous engagez à relire les futures PRs qui touchent les fichiers de votre locale — c'est tout l'engagement de "référent".

Être référent de locale n'est **pas** un boulot à temps plein. La plupart des semaines il n'y a rien à faire. La cadence est "toutes les quelques releases, une poignée de nouvelles chaînes à traduire." C'est tout.

## Fichiers de traduction

Chaînes UI : `IDE/src/main/resources/org/sikuli/ide/i18n/I18nMessages_<locale>.properties`

Docs : `oculix-site/src/content/docs/<locale>/**/*.md`

Astro/Starlight génère automatiquement le sélecteur de locale et le routage — votre seul boulot est d'écrire de la bonne prose.

## Comment on tranche sur les formulations

Quand il y a une ambiguïté :

1. **Les locuteurs natifs gagnent** — le référent a le dernier mot sur sa locale.
2. **Coller au vocabulaire logiciel conventionnel** — si tous les logiciels en chinois disent `设置` (Paramètres) plutôt que `配置` (Configurations), utilisez `设置`.
3. **Préférer la clarté à la traduction littérale** — "Find" en anglais peut correspondre à deux verbes différents dans votre langue selon que c'est une action de menu ou un nom de méthode. Choisissez ce qui se lit le mieux.
4. **Laisser les termes techniques en anglais** quand il n'y a pas de bon équivalent natif (ex. "Pattern", "Match", "Region" restent en anglais dans les contextes proches du code).

## Merci

À chaque traducteur qui a contribué — peixuana pour la relecture méticuleuse zh_CN, et aux contributeurs qui ont suggéré des corrections sur des chaînes individuelles. Qu'OculiX parle plus de langues, c'est ce qui le transforme de "un projet" en "un outil que les gens utilisent au travail dans leur propre langue."

Si vous voulez être sur cette page, [ouvrez une issue](https://github.com/oculix-org/Oculix/issues/new?labels=i18n) et c'est parti.
