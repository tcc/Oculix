---
title: Langages de scripting
description: Jython est le langage par défaut — mais OculiX exécute aussi JRuby, Python (CPython), PowerShell, AppleScript et Robot Framework.
---

OculiX est multi-langage. Le défaut est **Jython** (Python 2.7 sur la JVM) pour des raisons historiques et ergonomiques — mais la couche runtime expose une API `Runner` qui peut exécuter des scripts dans n'importe quel langage supporté.

## Jython — le défaut

Quand vous ouvrez un bundle `.sikuli` dans l'IDE, vous écrivez du **Jython** : syntaxe Python 2.7, exécutée à l'intérieur de la JVM, avec accès complet à toutes les classes Java du classpath.

```python
from sikuli import *
import java.util.Date as Date

# Python pur
greeting = "Hello, " + getDate()
print greeting

# Interop Java — instancier n'importe quelle classe JVM
date = Date()
print date.toString()

# API OculiX
click("button.png")
wait("done.png", 5)
```

### Ce que vous gardez de CPython

- Blocs basés sur l'indentation
- `def`, `class`, `for`, `while`, `if/elif/else`
- `import` pour les modules Python purs et les classes Java
- Modules de la bibliothèque standard qui ne dépendent pas d'extensions C (`os`, `sys`, `re`, `json`, `datetime`, `collections`, etc.)

### Ce que vous perdez

Jython est Python 2.7 — donc :

- **Pas de f-strings.** Utilisez le formatage `%` ou `.format()`.
- **Pas de `print()` comme fonction** sauf si vous faites `from __future__ import print_function`.
- **Pas d'extensions C.** Pas de `numpy`, pas de `pandas`, pas de `requests`. Les équivalents JVM marchent (`java.net.URL`, `org.json`, etc.).

### Pourquoi Jython, pas Python 3

Deux raisons :

1. **Compatibilité SikuliX.** Tous les scripts SikuliX existants écrits entre 2010 et 2026 tournent dans OculiX sans modification. Cette rétro-compatibilité compte pour des milliers d'équipes.
2. **Un seul processus JVM.** Pas de sous-processus, pas de coût FFI, pas de pénalité de démarrage. Le script entier et le moteur OculiX entier partagent la même JVM.

Un wrapper CPython 3 (**Operix**) est sur la roadmap — il appellera OculiX via py4j pour que vous puissiez écrire du Python 3 avec tout le confort moderne. Voir la [section écosystème du README](https://github.com/oculix-org/Oculix#-ecosystem).

## Autres runners

L'API `Runner` dans `org.sikuli.script.Runner` distribue vers des implémentations spécifiques à chaque langage. Toutes celles-ci sont incluses.

### JRuby

```ruby
require 'sikuli'
Sikuli::screen.click("button.png")
Sikuli::screen.type("hello\n")
```

Même surface que Jython mais avec l'ergonomie Ruby. Bon choix pour les équipes déjà investies dans JRuby.

### CPython 3 (via sous-processus)

```bash
java -jar oculixide.jar -r py3 my_script.py
```

Lance le `python3` système et lui passe le script + les appels API OculiX. Vous permet d'utiliser les libs Python modernes (`numpy`, `pandas`, `requests`) au prix d'un saut sous-processus.

### PowerShell

```powershell
# my_workflow.ps1
$screen = New-Object org.sikuli.script.Screen
$screen.Click("button.png")
$screen.Wait("done.png", 5)
```

Utile pour les pipelines centrés Windows où le reste de la chaîne d'outils est en PowerShell.

### AppleScript

```applescript
-- my_macos_task.scpt
tell application "OculiX"
  click image "button.png"
  wait image "done.png" with timeout 5
end tell
```

macOS seulement. Intègre OculiX aux workflows Automator et Shortcuts.

### Robot Framework

```robotframework
*** Settings ***
Library    OculiXLibrary

*** Test Cases ***
Submit Form
    Click    submit_button.png
    Wait     confirmation.png    5
```

La bibliothèque de keywords Robot Framework enveloppe l'API OculiX dans la syntaxe verbeuse-mais-lisible de Robot. Idéal pour les équipes QA déjà sur Robot.

### Runner serveur — CI headless

```bash
java -jar oculix-server.jar --port 5555
```

Fait tourner OculiX en mode headless, accepte les scripts via une API HTTP. Conçu pour les runners CI et les outils d'orchestration qui ont besoin de lancer des scripts à distance sans démarrer un IDE complet.

### Runner réseau — exécution distribuée

`org.sikuli.scriptrunner.NetworkRunner` vous permet d'exécuter un script sur la machine **A** alors qu'OculiX est invoqué depuis la machine **B**. Cas d'usage : un plan de contrôle sur votre laptop qui déclenche des scripts simultanément sur plusieurs machines agents.

## Appeler du Java depuis Jython

Toute bibliothèque JVM ajoutée au classpath est appelable directement :

```python
import java.io.File as File
import java.nio.file.Files as Files
import java.nio.file.Paths as Paths

# I/O fichier natif JDK
content = Files.readString(Paths.get("config.json"))
print content
```

Pour les classes spécifiques à OculiX :

```python
from org.sikuli.script import Screen, Region, Pattern, Match
from org.sikuli.script import VNCScreen, ADBScreen
from org.sikuli.script import PaddleOCREngine
```

## Modules réutilisables

Déposez un fichier `.py` à côté de votre bundle `.sikuli` et importez-le comme n'importe quel module Python :

```python
# my_helpers.py
def login(user, password):
    click("user_field.png")
    type(user + "\t" + password + "\n")
    wait("home.png", 10)
```

```python
# main.sikuli/main.py
from my_helpers import login
login("alice", "hunter2")
```

OculiX ajoute le répertoire parent du bundle au `sys.path` automatiquement.

## Patterns courants

### Réessai avec timeout

```python
def click_until(image, total_timeout=30):
    end = time.time() + total_timeout
    while time.time() < end:
        if exists(image):
            click(image)
            return True
        wait(1)
    raise FindFailed(image)
```

### Brancher selon ce qui est visible

```python
if exists("dialog_yes.png"):
    click("yes.png")
elif exists("dialog_no.png"):
    click("no.png")
else:
    click("default_action.png")
```

### Boucler sur les lignes d'un tableau

```python
rows = findAll("row_anchor.png")
for r in rows:
    r.right(200).click()    # clic 200 px à droite de chaque ligne
```

## Débogage

```python
Settings.DebugLogs = True       # logging interne verbeux
Settings.ActionLogs = True      # log chaque click/type/etc.
Settings.InfoLogs = True

print "About to click " + str(target)
```

Toute la sortie atterrit dans la console IDE (ou stdout si vous avez lancé via la CLI).

## Suite

- [Référence API](/fr/reference/api/) — l'index complet des classes
- [Référence CLI](/fr/reference/cli/) — exécuter des scripts en headless
- [Migration depuis SikuliX](/fr/reference/migration/) — pour les scripts existants
