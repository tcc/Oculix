---
title: Obtenir de l'aide
description: Comment demander de l'aide pour OculiX — canaux communautaires, ce à quoi s'attendre, et la porte qu'on garde ouverte pour les organisations.
---

OculiX est libre et open source sous MIT. Ce n'est pas un produit commercial : pas de SaaS, pas de tracking, pas de SLA payant par défaut. Mais ça ne veut **pas** dire **fermé** — si votre équipe utilise OculiX sérieusement, on aimerait le savoir, et on fera ce qu'on peut.

Cette page explique où demander, à quoi s'attendre, et comment la porte reste ouverte.

## Où poser ses questions

### Bugs → GitHub Issues

Pour tout ce qui ressemble à un bug — crashs, régressions, comportement inattendu, docs cassées — ouvrez une issue sur [oculix-org/Oculix/issues](https://github.com/oculix-org/Oculix/issues).

Un bon rapport de bug contient :

- **Ce que vous avez fait** — le plus petit script qui reproduit le problème
- **Ce que vous attendiez** vs **ce qui s'est passé**
- **Environnement** — OS, version Java, version OculiX
- **Stack trace** depuis la console de l'IDE, copiée-collée

L'IDE a **Help → Copy diagnostic info** pour récupérer l'environnement en un clic.

### Questions & discussions → GitHub Discussions

Pour les questions plus larges (« comment faire… ? », « quelle est la meilleure approche pour… ? », « OculiX est-il adapté à… ? »), utilisez [GitHub Discussions](https://github.com/oculix-org/Oculix/discussions). La communauté répond — et le mainteneur aussi, quand le temps le permet.

### Failles de sécurité → privé

Pour tout ce qui est sensible (bypass d'auth, RCE, fuite de credentials dans les logs), **n'ouvrez pas d'issue publique**. Utilisez le [signalement privé de vulnérabilité de GitHub](https://github.com/oculix-org/Oculix/security/advisories/new) ou écrivez au mainteneur (contact sur le [profil GitHub](https://github.com/julienmerconsulting)).

Voir aussi [SECURITY.md](https://github.com/oculix-org/Oculix/blob/master/SECURITY.md).

### Votre équipe utilise OculiX au travail → écrivez-nous

Si une équipe, un département, ou une entreprise entière fait tourner OculiX en production et souhaite **discuter directement avec le mainteneur** — un besoin spécifique, une question d'intégration, une influence sur la roadmap, ou simplement dire bonjour — écrivez à [contact@oculix.org](mailto:contact@oculix.org) ou ouvrez une discussion sur GitHub.

On ne fait pas tourner un pipeline de vente entreprise, mais on ne fait pas non plus comme si le projet vivait dans le vide. Beaucoup des entreprises citées sur la [page Adoption](/fr/showcase/) ont découvert OculiX via le rapport de bug d'un seul ingénieur. Les vraies conversations aident le projet autant que le code.

## À quoi s'attendre

OculiX est actuellement maintenu par une seule personne, sur son temps libre. Les chiffres réalistes :

| Vous signalez…                | Première réponse en…                 |
| ----------------------------- | ------------------------------------ |
| Crash reproductible           | Quelques jours, souvent plus vite     |
| `FindFailed` reproductible    | Une semaine                           |
| Demande de fonctionnalité     | Triagée en une semaine — délai d'implémentation très variable |
| Avis de sécurité              | Accusé de réception sous 48 h         |
| Email d'une organisation      | Lu sous quelques jours, réponse sous une semaine |

Les bugs majeurs reçoivent des correctifs le jour même quand ils sont reproductibles. Les bugs spéculatifs (« parfois ça ne clique pas ») prennent plus de temps parce qu'ils ont besoin d'un repro fiable d'abord.

## Jusqu'où on peut aller pour une organisation

OculiX est un petit projet, pas un éditeur. Mais « petit » ne veut pas dire « non » — ça veut dire que tout est au cas par cas, asynchrone, et se décide en conversation. Ce qui s'est **réellement** déjà passé :

- **Un bug spécifique a été priorisé** parce qu'une équipe a expliqué l'impact en production dans une issue claire. C'est souvent suffisant.
- **Une fonctionnalité a été développée** parce qu'une organisation a sponsorisé le temps du mainteneur pour la concentrer dessus. Pas de tier, pas de contrat — une discussion et un arrangement via GitHub Sponsors.
- **Un audit / une formation sur mesure** a été organisé pour une équipe qui devait onboarder plusieurs ingénieurs en même temps. En dehors des cadres, convenu par email.
- **Un correctif a été poussé sur `master`** plus vite que le cycle RC normal parce qu'un secteur régulé l'avait rencontré et fourni un repro propre.

Ce qu'on ne fera **pas** :

- Signer un contrat formel vendor-of-record avec un service achats — il n'y a pas d'entité juridique derrière le projet pour ça aujourd'hui.
- Promettre un SLA qu'on ne peut pas tenir avec un seul mainteneur.
- Développer une fonctionnalité en privé sans qu'elle ré-atterrisse dans le projet public.

En bref : **si vous avez un vrai besoin, écrivez-nous avant de supposer que c'est impossible.** La réponse honnête est souvent « oui, voici comment » ou « oui, avec cette réserve » — pas « non ».

## Ce que vous pouvez faire vous-même

### Builder depuis les sources

Si vous avez besoin d'un correctif déjà sur `master` mais pas encore publié :

```bash
git clone https://github.com/oculix-org/Oculix.git
cd Oculix
mvn clean install -DskipTests
```

Les fat-jars dans le `target/` de chaque module sont exactement ce qui est uploadé sur Maven Central à chaque release.

### Forker et patcher

OculiX est sous licence MIT. Forkez-le, patchez le problème qui vous concerne, faites tourner votre propre build. Si le patch est généralement utile, ouvrez une PR upstream — c'est la contribution la plus rentable que vous puissiez faire au projet.

### S'abonner aux releases

Le moyen le plus rapide de savoir qu'un correctif est sorti : suivre le repo. **GitHub → Watch → Custom → Releases.** Vous recevez un email pour chaque nouvelle RC et stable.

## Auditabilité & environnements régulés

OculiX tourne entièrement sur votre machine. Rien ne « phone home », aucune télémétrie, aucun analytics, pas d'auto-update. Le module optionnel serveur MCP écrit un journal d'audit JSONL signé Ed25519 et chaîné SHA-256 — conçu pour les environnements où chaque action doit être auditable.

Là où OculiX s'intègre bien :

- **Source-available, auto-hébergé**, sous licence permissive
- **Auditable de bout en bout** — vous pouvez lire chaque ligne qui tourne dans votre build
- **Pas de vendor lock-in** — vous le forkez le jour où le mainteneur disparaît

Là où une conversation préalable vaut le coup :

- Si vos achats exigent un **contrat fournisseur signé**, parlons de ce qui est possible — la réponse aujourd'hui est informelle, mais ce n'est pas toujours « non ».
- Si vous avez besoin d'attestations **SOC 2 / HIPAA / FedRAMP**, le projet lui-même n'est pas certifié — mais son architecture (pas de télémétrie, pas de cloud, pas d'appel API tiers depuis le runtime) facilite son intégration dans un environnement certifié que vous contrôlez.

Dans tous les cas, écrivez à [contact@oculix.org](mailto:contact@oculix.org) avant de supposer que ça ne colle pas.

## Dire merci

Si OculiX vous a fait gagner du temps et que vous voulez rendre la pareille, les choses les plus utiles sont :

- Un bon rapport de bug quand vous en trouvez un
- Une PR pour un correctif que vous avez déjà fait en local
- Tester une RC sur une plateforme qu'on n'a pas
- Traduire les chaînes d'UI dans votre langue
- Nous autoriser à citer votre organisation sur la [page Adoption](/fr/showcase/) — ou sponsoriser sur [GitHub Sponsors](https://github.com/sponsors/julienmerconsulting) (voir [Sponsors](/fr/community/sponsors/))

On adorerait les deux — une entrée contributeur **et** une entrée sponsor. L'un ou l'autre est déjà une aide énorme.
