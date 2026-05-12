---
title: Pipeline de vision
description: Comment OculiX voit l'écran — Apertix, OpenCV, template & feature matching.
---

Cette page est pour celles et ceux qui veulent comprendre *pourquoi* OculiX trouve (ou rate) un match. Le TL;DR : sous chaque `find()` il y a `matchTemplate` d'OpenCV plus un fallback feature matching, enveloppés dans une couche JNA (Apertix) qui évite les conflits classiques de bibliothèques natives sous Java.

## Vue d'ensemble de la stack

```
 Votre script (Jython / Java)
        │
        ▼
 sikuli.script.{Screen, Region, Pattern}
        │
        ▼
 org.sikuli.script.Finder      ←—— similarité, target offset, clipping de region
        │
        ▼
 Apertix (OpenCV 4.10.0 via JNA)
        │
        ▼
 Libs OpenCV natives (embarquées dans le JAR)
```

## Apertix — pourquoi pas le OpenCV classique

OculiX dépend d'**Apertix**, un build JNA custom d'OpenCV 4.10.0. Il remplace l'artefact `org.openpnp:opencv` plus courant pour deux raisons :

1. **Pas de conflit `System.loadLibrary`.** Apertix charge via JNA, ce qui veut dire qu'il ne se bat pas avec d'autres libs natives utilisant JNI sous Windows (problème classique en mélangeant OpenCV avec des libs VNC ou JFreeChart).
2. **OpenCV 4.10.0 pinné**, compilé depuis les sources sous Windows x86-64 avec MSVC. Chaque release OculiX est buildée contre exactement la même version d'OpenCV, donc le comportement est reproductible.

Coordonnées Maven :

```xml
<dependency>
  <groupId>io.github.julienmerconsulting.apertix</groupId>
  <artifactId>opencv</artifactId>
  <version>4.10.0-0</version>
</dependency>
```

Repo Apertix : [github.com/julienmerconsulting/Apertix](https://github.com/julienmerconsulting/Apertix).

## Template matching — par défaut

Quand vous appelez `Region.find("button.png")`, OculiX lance [`matchTemplate`](https://docs.opencv.org/4.10.0/df/dfb/group__imgproc__object.html) d'OpenCV avec `TM_CCOEFF_NORMED` :

1. Le `button.png` capturé devient un **template**.
2. La capture courante de la region devient la **scène**.
3. `matchTemplate` glisse le template sur chaque pixel de la scène et calcule un score de corrélation normalisé dans [0.0, 1.0].
4. Le pixel au score le plus haut est le match candidat.
5. Si ce score ≥ `similarity` (défaut 0.7), OculiX renvoie un `Match` ; sinon il lève `FindFailed`.

Template matching est **précis au pixel** mais **sensible à l'échelle** : si le même bouton est rendu 10 % plus grand sur l'écran cible (high DPI, changement de thème), le score baisse. Deux stratégies :

- **Ajuster la similarité** : `Pattern("button.png").similar(0.6)` élargit la tolérance.
- **Re-capturer à l'échelle cible** : simple, robuste, rapide.

## Feature matching — pour la résilience

Quand le template matching rate trop souvent (rotation, scaling, changements de lumière), OculiX fait fallback en feature matching :

```python
finder = Finder(image)
finder.findFeatures("logo.png")
if finder.hasNext():
    print finder.next()
```

Le feature matching utilise les descripteurs ORB (Oriented FAST and Rotated BRIEF). C'est plus lent que template matching mais robuste aux petites rotations, à l'occlusion partielle, et au scaling modéré. À utiliser quand :

- La cible bouge *à l'intérieur* d'une fenêtre (drag-and-drop)
- La cible tourne (boussoles, indicateurs rotatifs)
- La même image est affichée à plusieurs tailles (UIs responsives)

## Opérations de Region sous le capot

`Region.right(N)` ne capture rien de nouveau — il ajuste juste le rectangle de recherche. La capture écran réelle a lieu **paresseusement** au prochain `find()`, `wait()` ou `click()`.

C'est pourquoi des `find()` imbriqués scoping une petite region sont dramatiquement plus rapides qu'un `find()` sur tout l'écran — vous réduisez le nombre de pixels qu'OpenCV doit scanner.

```python
# Bon — OpenCV scanne 300 × 50 px
btn = dialog.right(300).find("save.png")

# Mauvais — OpenCV scanne 1920 × 1080 px à chaque appel
btn = Screen(0).find("save.png")
```

## Multi-écran

Chaque moniteur a sa propre instance `Screen(n)`. `Screen(0)` est le principal. `Screen.getNumberScreens()` vous dit combien vous en avez.

```python
for i in range(Screen.getNumberScreens()):
    s = Screen(i)
    print "Screen %d: %d × %d at (%d, %d)" % (i, s.getW(), s.getH(), s.getX(), s.getY())
```

Les captures et matches restent dans un seul `Screen` sauf si vous fusionnez explicitement des regions à travers eux.

## Highlight — votre débugger

L'outil le plus utile quand un script déraille :

```python
match = find("button.png")
match.highlight(2)              # encadré rouge pendant 2 s
match.highlight(2, "green")
```

Vous voyez exactement où OculiX croit que le match se trouve. 90 % des bugs « pourquoi a-t-il cliqué là ? » deviennent évidents en 5 secondes après l'ajout de `.highlight()`.

## Mode Slow Motion

**Run → Run Slow Motion** dans l'IDE ajoute un bref highlight avant chaque action. À utiliser pour :

- Démontrer un script à une partie prenante non-technique
- Débugger un miss-click intermittent
- Enregistrer un screencast d'un parcours d'automatisation

## Réglages qui changent le pipeline

```python
Settings.MinSimilarity = 0.7    # plancher de similarité par défaut
Settings.AlwaysResize = 1.0     # pre-scaling des captures par N avant matching
Settings.WaitScanRate = 3       # scans OpenCV par seconde pendant wait()
Settings.MoveMouseDelay = 0.3   # temps de glissement du curseur (feedback visuel)
Settings.AutoWaitTimeout = 3.0  # attente implicite avant chaque action
Settings.SaveLastImage = True   # dump le dernier match raté dans ./lastImage.png
```

Le toggle `SaveLastImage` est en or pour débugger en CI : quand un `find()` rate dans un job headless, le dernier écran capturé est écrit sur disque pour post-mortem.

## VNC, ADB, et le même pipeline

Le pipeline de vision est **indépendant de la source**. `VNCScreen`, `ADBScreen` et le `Screen` local exposent la même API `find/click/type` — ils produisent juste des captures à partir d'endroits différents. La stack OpenCV en aval ne se soucie pas de savoir si l'image vient de votre moniteur, d'un téléphone Android via ADB, ou d'une machine distante via VNC.

```python
# Même script, trois sources différentes
local_btn   = Screen(0).find("save.png")
android_btn = ADBScreen.start(adb_path).find("save.png")
remote_btn  = VNCScreen.start("192.168.1.10", 5900, "", 1920, 1080).find("save.png")
```

## Ordres de grandeur de performance

Sur un laptop milieu de gamme 2024, écran 1920×1080, bouton 100×30 :

| Opération                          | Temps réel      |
| ---------------------------------- | --------------- |
| `Screen(0).capture()`              | ~30 ms          |
| `find()` sur écran entier          | ~50 ms          |
| `find()` sur region 300×100        | ~5 ms           |
| `findFeatures()` sur écran entier  | ~200 ms         |
| `Region.text()` OCR Tesseract      | ~150 ms         |
| `PaddleOCREngine.recognize()`      | ~300 ms (CPU)   |

L'OCR est environ 10× plus lent que le matching d'image. Utilisez le matching d'image dès que l'apparence de la cible est stable.

## Pour la suite

- [Scripting Jython](/fr/guides/jython/) — piloter le pipeline depuis Python
- [Référence API](/fr/reference/api/) — `Finder`, `Pattern`, `Match`, `Settings`
- [Guide de reconnaissance visuelle](/fr/guides/visual-matching/) — les recettes orientées utilisateur
