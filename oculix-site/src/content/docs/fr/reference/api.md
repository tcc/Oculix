---
title: Référence API
description: Toutes les classes et méthodes publiques exposées par OculiX, organisées par finalité.
---

Cette page est un index navigable de l'API OculiX. Pour les signatures de méthodes complètes et la description des paramètres, voir la [Javadoc sur javadoc.io](https://javadoc.io/doc/io.github.oculix-org/oculixapi).

Le layout des packages reflète celui de SikuliX pour que les scripts existants continuent de marcher sans modification. La plupart des utilisateurs n'ont jamais besoin que d'une poignée de classes dans `org.sikuli.script`.

## Core — matching visuel

| Classe               | Rôle                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| `Screen`             | Un écran physique. `Screen(0)` est le principal. Hérite de `Region`.             |
| `Region`             | Une zone de recherche rectangulaire. Là où vivent `find / click / type`.         |
| `Pattern`            | Une image plus des paramètres de matching (`similar()`, `targetOffset()`).       |
| `Match`              | Un find réussi — une `Region` enrichie d'un score et du pattern d'origine.       |
| `Location`           | Un point (x, y) unique.                                                          |
| `Image`              | Une image capturée ou chargée, découplée du disque.                              |
| `ScreenImage`        | Une `BufferedImage` plus sa région d'origine — ce que retourne `capture()`.      |
| `Finder`             | Wrapper OpenCV bas-niveau. `findFeatures()` vit ici.                             |
| `FindFailed`         | Exception levée quand aucun match n'atteint le seuil de similarité.              |
| `ImageMissing`       | Exception levée quand un fichier image référencé n'est pas sur le disque.        |
| `Settings`           | Configuration statique : `MinSimilarity`, `WaitScanRate`, `AutoWaitTimeout`, …   |

### `Region` — le cheval de trait

Les cinq verbes de matching :

```java
Match  find(Object target);                  // lève FindFailed
Match  exists(Object target);                // null si pas trouvé
Match  exists(Object target, double timeout);
Match  wait(Object target, double timeout);
boolean waitVanish(Object target, double timeout);
Iterator<Match> findAll(Object target);
```

Les verbes d'action (chacun retourne la cible sur laquelle il a agi, pour le chaînage) :

```java
int click(Object target);
int doubleClick(Object target);
int rightClick(Object target);
int hover(Object target);
int type(String text);
int type(Object target, String text);        // clic d'abord, puis frappe
int paste(String text);
int dragDrop(Object from, Object to);
int mouseDown(int buttons);
int mouseUp(int buttons);
int wheel(int direction, int steps);
int keyDown(String keys);
int keyUp(String keys);
```

Opérations de sous-région (toutes retournent une nouvelle `Region`) :

```java
Region above(int n);
Region below(int n);
Region left(int n);
Region right(int n);
Region inside();
Region nearby(int n);
Region grow(int width, int height);
Region morphTo(Region other);
```

### `Pattern`

```java
Pattern p = new Pattern("button.png")
    .similar(0.85)            // seuil de similarité
    .targetOffset(20, 5);     // clic 20 px à droite, 5 px en bas du centre
```

### `Screen`

```java
Screen.getNumberScreens();    // combien de moniteurs ?
Screen s = new Screen(0);     // principal
Screen s = new Screen(1);     // secondaire
s.capture();                  // ScreenImage de tout l'écran
s.capture(region);            // ScreenImage d'une sous-région
```

## OCR — texte à l'écran

| Classe               | Rôle                                                               |
| -------------------- | ------------------------------------------------------------------ |
| `TextRecognizer`     | Front-end Tesseract embarqué. Utilisé par `Region.text()`.         |
| `PaddleOCREngine`    | Client HTTP pour le serveur PaddleOCR (`localhost:5000`).          |
| `PaddleOCRClient`    | Transport bas-niveau — la plupart des utilisateurs appellent `PaddleOCREngine`. |

```java
String all = region.text();
Match label = region.findText("Submit");

PaddleOCREngine ocr = new PaddleOCREngine();
String json = ocr.recognize(screenImage.getFile());
int[] xywh = ocr.findTextCoordinates(json, "Submit");
Map<String, Double> all = ocr.parseTextWithConfidence(json);
```

Voir le [guide OCR](/fr/guides/ocr/) pour l'histoire complète.

## Écrans distants

| Classe              | Rôle                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `VNCScreen`         | Un `Screen` adossé à un serveur VNC distant. Même API que `Screen`.      |
| `VNCRobot`          | Injection bas-niveau d'événements d'entrée via VNC.                      |
| `VNCClient`         | Le client brut du protocole VNC.                                         |
| `VNCFrameBuffer`    | Buffer de pixels décodé de l'écran distant.                              |
| `VNCClipboard`      | Synchronisation bidirectionnelle du presse-papier.                       |
| `XKeySym`           | 2200+ définitions de symboles de touche X11.                             |
| `ThreadLocalSecurityClient` | Contexte d'auth par thread pour les sessions VNC parallèles.     |

```java
VNCScreen vnc = VNCScreen.start("192.168.1.10", 5900, "password", 1920, 1080);
vnc.click("button.png");
vnc.type("hello");
vnc.stop();
```

## Android — ADB

| Classe              | Rôle                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `ADBScreen`         | Un `Screen` adossé à un appareil Android via ADB.                        |
| `ADBDevice`         | Contrôle direct de l'appareil (`tap`, `swipe`, `key`, `shell`).          |
| `ADBClient`         | Client bas-niveau du protocole ADB. `jadb` embarqué — pas besoin du binaire `adb`. |
| `ADBRobot`          | Injection d'événements d'entrée.                                         |

```java
ADBScreen android = ADBScreen.start("/path/to/adb");
android.click("button.png");
android.getDevice().tap(540, 1200);
```

Testé sur Android 12+ via USB et WiFi (pairing ADB).

## SSH

| Classe              | Rôle                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `SSHTunnel`         | Ouvrir un tunnel SSH depuis Java. `jcraft/jsch` embarqué. Aucune dépendance externe. |

```java
SSHTunnel tunnel = new SSHTunnel("user", "remote-host", 22, "password");
tunnel.open(5900, "localhost", 5900);  // local 5900 → distant localhost:5900
VNCScreen vnc = VNCScreen.start("localhost", 5900, "", 1920, 1080);
```

## Runners

| Classe              | Rôle                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `Runner`            | Table de dispatch vers les runners spécifiques à chaque langage.         |
| `JythonRunner`      | Jython (Python 2.7 sur la JVM) — le défaut.                              |
| `JRubyRunner`       | JRuby.                                                                   |
| `PythonRunner`      | CPython 3 via sous-processus.                                            |
| `PowerShellRunner`  | PowerShell (Windows).                                                    |
| `AppleScriptRunner` | AppleScript (macOS).                                                     |
| `RobotFrameworkRunner` | Bibliothèque de keywords Robot Framework.                             |
| `NetworkRunner`     | Exécution distribuée à distance.                                         |
| `ServerRunner`      | Serveur HTTP headless pour la CI.                                        |

Voir le [guide des langages de scripting](/fr/guides/jython/).

## IDE & workspace

| Classe                 | Rôle                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `SikulixIDE`           | Point d'entrée de l'IDE.                                              |
| `ScriptExplorer`       | Le panneau d'exploration du workspace.                                |
| `WelcomeTab`           | Onglet d'accueil au premier lancement.                                |
| `EditorTabPane`        | L'éditeur de script avec vignettes d'images.                          |
| `ConsolePanel`         | La console du bas.                                                    |
| `RecorderAssistant`    | Moteur Recorder moderne.                                              |

Les utilisateurs finaux n'y touchent normalement pas. Elles sont publiques pour que les auteurs de plugins puissent étendre l'IDE.

## MCP — serveur Model Context Protocol

`oculix-mcp-server` est un module Maven séparé qui expose OculiX comme un serveur MCP (stdio + HTTP). Il signe chaque action avec Ed25519 et écrit un journal d'audit JSONL chaîné en SHA-256, conçu pour les environnements régulés.

| Outil exposé via MCP | Correspond à                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `Click`              | `Region.click()`                                                     |
| `DblClick`           | `Region.doubleClick()`                                               |
| `RClick`             | `Region.rightClick()`                                                |
| `Find`               | `Region.find()`                                                      |
| `FindText`           | `Region.findText()`                                                  |
| `Exists`             | `Region.exists()`                                                    |
| `Wait`               | `Region.wait()`                                                      |
| `KeyCombo`           | Événement clavier synthétique                                        |
| `OCR`                | `Region.text()` / `PaddleOCREngine.recognize()`                      |
| `Screenshot`         | `Screen.capture()`                                                   |
| `Type`               | `Region.type()`                                                      |

```xml
<dependency>
  <groupId>io.github.oculix-org</groupId>
  <artifactId>oculix-mcp-server</artifactId>
  <version>3.0.3</version>
</dependency>
```

## Utilitaires

| Classe                  | Rôle                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `Commons`               | Helpers partagés (résolution de chemins, checks de version, bootstrap OCR). |
| `Debug`                 | Façade de logging — `Debug.log()`, `Debug.error()`, `Debug.info()`.  |
| `RunTime`               | Introspection runtime (OS, version Java, statut fat-jar).            |
| `FileManager`           | Opérations fichier multi-plateforme utilisées par l'IDE.             |
| `XKeySym`               | Définitions de keysyms X11 pour VNC.                                 |
| `SikuliXception`        | Exception checked à l'échelle du projet.                             |

## Javadoc complète

→ **[javadoc.io / oculixapi](https://javadoc.io/doc/io.github.oculix-org/oculixapi)**

La Javadoc est auto-générée à chaque release Maven Central et c'est la source de vérité pour les signatures de méthodes, les noms de paramètres et les types de retour.

## Suite

- [Référence CLI](/fr/reference/cli/)
- [Migration depuis SikuliX](/fr/reference/migration/)
