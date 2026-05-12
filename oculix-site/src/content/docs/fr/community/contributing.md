---
title: Contribuer
description: Comment aider OculiX — rapports de bugs, PRs, docs, tests de RC, traductions.
---

Vous avez remarqué quelque chose. C'est déjà une contribution.

OculiX est la continuité active de SikuliX1, archivé en mars 2026 après vingt ans de travail communautaire. Une bonne partie de cette communauté fait encore tourner des scripts en production — et beaucoup découvrent OculiX une stack trace à la fois. Si vous êtes dans ce cas : bienvenue. Cette page existe pour que vous sachiez ce dont nous avons besoin, ce que nous promettons en retour, et comment passer le moins de temps possible à naviguer l'étiquette GitHub.

La version longue se trouve dans [CONTRIBUTING.md](https://github.com/oculix-org/Oculix/blob/master/CONTRIBUTING.md) — cette page résume les parties que les contributeurs utilisent réellement.

## Ce qui aide le plus

Toutes les contributions ne sont pas du code. Classées grossièrement de *prend cinq minutes* à *prend un week-end* :

| Vous pouvez…                                                                | Temps    | Ce que ça débloque                                           |
| --------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| Ouvrir un rapport de bug avec stack trace + version OS/Java                 | 5 min    | Un vrai correctif — souvent dans la journée                  |
| Partager un script qui casse dans OculiX mais marchait dans SikuliX         | 10 min   | Reproducteur de régression direct, priorité maximale         |
| Tester une release candidate sous Linux / macOS / Apple Silicon             | 15 min   | On a la machine d'un seul mainteneur ; les RCs ont besoin d'yeux |
| Corriger une faute ou une phrase peu claire dans la doc                     | 5 min    | Chaque correction est appréciée                              |
| Faire le tri d'une vieille issue (repro, suggérer des labels, demander l'info manquante) | 30 min   | Énorme effet de levier sur le rapport signal/bruit           |
| Soumettre une PR pour une issue taguée `good first issue`                   | 1-3 h    | Du vrai code part dans la release suivante                   |
| Traduire une locale (chaînes UI, docs)                                      | qq heures | OculiX dans une nouvelle langue                              |
| Porter une fonctionnalité de SikuliX1 qui n'a pas fait la coupe OculiX      | qq heures | Continuité directe de la lignée                              |
| Construire un wrapper de langage (Python 3, JS, .NET — voir issues #177/#178/#179) | semaine+ | Ouvre OculiX à un nouvel écosystème                          |

## Rapporter un bug

Un bon rapport de bug a trois choses :

1. **Ce que vous avez fait** — un script, même partiel, qui exhibe le bug
2. **Ce que vous attendiez** vs **ce qui s'est passé**
3. **Votre environnement** : OS + version, version Java, version OculiX

L'IDE a un **Aide → Copier infos de diagnostic** qui remplit l'environnement pour vous.

Ouvrez les issues sur [oculix-org/Oculix/issues](https://github.com/oculix-org/Oculix/issues). Taggez-les avec `bug` et, si possible, le composant concerné (`ide`, `vnc`, `android`, `ocr`, `mcp`, `recorder`, …).

## Soumettre une pull request

1. Forkez le dépôt.
2. Créez une branche depuis `master` avec un nom descriptif (`fix-vnc-clipboard-utf8`, `feat-ide-dark-theme`).
3. Gardez la PR focalisée — un changement logique par PR. Plus facile à reviewer, plus rapide à merger.
4. Lancez `mvn clean install -DskipTests` localement avant de pusher — au minimum, le build doit passer.
5. Si le changement touche au comportement utilisateur, ajoutez une ligne sous "Unreleased" dans `CHANGELOG.md`.
6. Ouvrez la PR. La CI tourne automatiquement ; le mainteneur review sous quelques jours.

Pour les gros changements (nouveaux modules, breaking changes, refontes architecturales), ouvrez une issue d'abord pour discuter du design.

## Tester une release candidate

Chaque version stable est précédée de 3 à 5 RCs. Le pipeline de release les tague `vX.Y.Z-rcN` et les publie sur GitHub Releases (pas sur Maven Central tant que ce n'est pas stable). Pour aider à tester :

1. Téléchargez le jar IDE de la RC sur la [page Releases](https://github.com/oculix-org/Oculix/releases).
2. Lancez vos scripts habituels.
3. Ouvrez une issue sur tout ce qui a cassé — ou commentez la release RC pour dire "tout bon sur macOS 14".

Tester les RCs est **la** contribution avec le plus d'effet de levier après les rapports de bugs.

## Traductions

OculiX livre les chaînes UI et la doc en anglais par défaut. Les autres locales actuellement vivantes ou en cours :

- **zh_CN (chinois simplifié)** — maintenue par [@peixuana](https://github.com/peixuana)
- **fr (français)** — UI partielle, docs en cours

Si vous voulez maintenir une locale (espagnol, allemand, japonais, …), ouvrez une issue taguée `i18n` et on met en place la structure de fichiers.

## Setup de développement

```bash
git clone https://github.com/oculix-org/Oculix.git
cd Oculix
mvn clean install -DskipTests
```

Les configurations de lancement IntelliJ sont versionnées sous `.idea/runConfigurations/` — ouvrez le projet dans IntelliJ et la config "Run IDE" est à un clic.

## Gouvernance

OculiX a un mainteneur ([@julienmerconsulting](https://github.com/julienmerconsulting)) et un ensemble toujours plus grand de contributeurs. Les décisions se prennent sur GitHub, en public, sur les issues et les PRs. Il n'y a pas de Slack, pas de Discord (pour l'instant), pas de canal privé.

Le mainteneur se réserve le droit de :

- Fermer les issues hors-périmètre ou doublons
- Refuser les PRs qui ne s'alignent pas sur la direction du projet
- Fixer la roadmap

En échange, le mainteneur s'engage à :

- Accuser réception de chaque rapport de bug en quelques jours
- Reviewer chaque PR sous une semaine
- Sortir une nouvelle RC toutes les 2 à 4 semaines tant que des features sont en vol

## Sécurité

Pour tout ce qui est sensible — bypass d'auth dans le serveur MCP, RCE via scripts forgés, etc. — **n'ouvrez pas d'issue publique**. Envoyez un email au mainteneur (lien de contact sur le [profil GitHub](https://github.com/julienmerconsulting)) ou utilisez le [signalement privé de vulnérabilité](https://github.com/oculix-org/Oculix/security/advisories/new) de GitHub.

Voir aussi [SECURITY.md](https://github.com/oculix-org/Oculix/blob/master/SECURITY.md).

## Code de conduite

Soyez sympa. Ne soyez pas un connard. Les rapports de bugs portent sur des bugs, pas sur des personnes. On construit ça ensemble — et la plupart d'entre nous le font sur leur temps libre.

## Merci

OculiX existe parce que les contributeurs continuent à se pointer. Si vous êtes arrivé jusqu'ici, vous faites déjà partie du projet. 🦎
