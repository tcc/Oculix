---
title: Migration depuis SikuliX
description: Faire passer des scripts SikuliX et des projets existants vers OculiX avec un effort minimal.
---

OculiX est la continuité active de [SikuliX1](https://github.com/RaiMan/SikuliX1), archivé en mars 2026 après deux décennies de travail communautaire. Cette page explique comment amener un projet SikuliX sur OculiX.

**La version courte :** pour 95 % des scripts, vous ne changez rien. Vous les ouvrez, vous lancez.

## Ce qui ne change pas

- Les bundles `.sikuli` s'ouvrent tels quels. Le format est identique.
- L'API Jython est 100 % compatible. `from sikuli import *` fonctionne.
- Les fichiers image sont lus avec les mêmes conventions et chemins de recherche.
- Les Settings (`Settings.MinSimilarity`, `WaitScanRate`, etc.) gardent les mêmes noms et valeurs par défaut.
- Les runners Robot Framework / JRuby / PowerShell sont toujours là.

Si vous faites tourner SikuliX 2.0.5 en production, le chemin de mise à niveau est "balancez le nouveau JAR à la place de l'ancien".

## Ce qui change — coordonnées Maven

Ancien SikuliX :

```xml
<dependency>
  <groupId>com.sikulix</groupId>
  <artifactId>sikulixapi</artifactId>
  <version>2.0.5</version>
</dependency>
```

Nouvel OculiX :

```xml
<dependency>
  <groupId>io.github.oculix-org</groupId>
  <artifactId>oculixapi</artifactId>
  <version>3.0.3</version>
</dependency>
```

`groupId` et `artifactId` changent tous les deux. Le layout des packages (`org.sikuli.script.*`) est préservé, donc vos imports ne bougent pas.

## Ce qui change — dépendance OpenCV

SikuliX était livré contre `org.openpnp:opencv`. OculiX est livré contre **Apertix**, un build OpenCV 4.10.0 custom basé sur JNA :

```xml
<dependency>
  <groupId>io.github.julienmerconsulting.apertix</groupId>
  <artifactId>opencv</artifactId>
  <version>4.10.0-0</version>
</dependency>
```

Si votre projet dépend explicitement de `org.openpnp:opencv`, remplacez par la dépendance Apertix. Si vous n'avez pas ajouté OpenCV manuellement (la plupart des utilisateurs), ça se passe de manière transparente.

## Ce qui est nouveau dans OculiX (par rapport à SikuliX 2.0.5)

Ce sont des ajouts — rien n'a été retiré de l'API SikuliX.

| Capacité                 | SikuliX 2.0.5            | OculiX 3.0.3                                |
| ------------------------ | ------------------------ | ------------------------------------------- |
| Écrans distants VNC      | Limité                   | Stack complète : `VNCScreen`, `VNCRobot`, … |
| Android via ADB          | —                        | `ADBScreen`, `ADBDevice`, `ADBRobot`        |
| Tunnels SSH natifs       | —                        | `SSHTunnel` avec `jcraft/jsch` embarqué     |
| PaddleOCR                | —                        | Client HTTP `PaddleOCREngine`                |
| OpenCV                   | 3.x (openpnp)            | 4.10.0 (Apertix, JNA)                       |
| OCR Tesseract            | Installation manuelle    | Embarqué via Legerix                        |
| Recorder moderne         | Basique                  | Swipe, DragDrop, Wheel, KeyCombo, image lib |
| Workspace / Script Explorer | —                     | Gestion complète du workspace avec cartes   |
| Apple Silicon            | Rosetta uniquement       | Natif (M1/M2/M3) depuis 3.0.2               |
| Taille fat-jar Linux     | ~ 250 Mo                 | ~ 200 Mo (3.0.3 retire 50 Mo)               |
| Taille fat-jar Windows   | ~ 350 Mo                 | ~ 236 Mo (3.0.3 retire 114 Mo)              |
| `type()` universel       | ASCII seulement sur Mac/Win | UTF-8 via routage auto-presse-papier (3.0.3) |
| CLI `-l … -e`            | —                        | Disponible multi-plateforme                 |
| Serveur MCP              | —                        | Module `oculix-mcp-server`                  |
| Système de thèmes        | —                        | Dark / light avec préférence persistante    |
| Auto-récupération IDE    | Best effort              | Sauvegarde périodique dans `~/.OculiX/recovery/` |

## Choses à revérifier après migration

1. **Version Java** — OculiX requiert Java 11+. SikuliX acceptait Java 8. Si vous étiez sur 8, passez à Temurin 11 ou 17 LTS.
2. **Permissions macOS** — réaccordez *Accessibilité* et *Enregistrement de l'écran* au nouveau runtime Java. macOS traite `oculixide.jar` comme une app différente de `sikulix.jar`.
3. **Mode headless** — si vous lanciez SikuliX avec `-jar sikulixide.jar` et un display custom, passez à `-c` pour le mode console dans OculiX.
4. **Vieux bundles `.sikuli`** avec des scripts Jython 2.5 embarqués : marchent toujours, mais `print "..."` peut déclencher des warnings de dépréciation. Ajoutez `from __future__ import print_function` en haut pour les silencer.

## Côte à côte : un petit exemple

Le même script, dans les deux mondes :

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

Ce n'est pas une faute de frappe — ils sont identiques.

## Besoin d'aide ?

Si une migration tombe sur quelque chose d'inattendu, ouvrez une issue sur [oculix-org/Oculix](https://github.com/oculix-org/Oculix/issues) avec :

- Votre version OculiX (`java -jar oculixide.jar -v`)
- Votre version Java (`java -version`)
- Le plus petit reproducteur que vous puissiez extraire
- La stack trace complète depuis la console IDE

Les régressions SikuliX sont en **priorité absolue** sur le tracker de bugs OculiX — voir [CONTRIBUTING.md](https://github.com/oculix-org/Oculix/blob/master/CONTRIBUTING.md).

## Crédits au travail d'origine

OculiX existe grâce à deux décennies de travail de [Raimund Hocke](https://github.com/RaiMan) et de la communauté SikuliX. La continuité se fait dans le même esprit — ouvert, simple, accessible — et la porte reste ouverte à l'auteur d'origine pour revenir et contribuer quand il le souhaite.
