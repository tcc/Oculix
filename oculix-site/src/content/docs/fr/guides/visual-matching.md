---
title: Reconnaissance visuelle
description: Region, Pattern, Match — le cœur de la reconnaissance visuelle d'OculiX.
---

La reconnaissance visuelle est le cœur d'OculiX. Vous lui donnez une petite image, il vous dit où sur l'écran actuel cette image apparaît. Tout le reste — cliquer, taper, attendre — est bâti sur cette primitive.

## Classes principales

| Classe       | Ce qu'elle représente                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **`Screen`** | Un moniteur physique. `Screen(0)` est l'écran principal. Multi-écran : `Screen(1)`, `Screen(2)`, … |
| **`Region`** | Une zone rectangulaire dans laquelle on peut chercher. `Screen` est une `Region` couvrant tout l'écran. |
| **`Pattern`**| Une image plus des paramètres de matching (similarité, targetOffset).                          |
| **`Match`**  | Le résultat d'une recherche réussie — une `Region` avec un score et le pattern original.       |
| **`Location`**| Un point unique (x, y).                                                                       |

Vous pouvez utiliser `Pattern` partout où `Region` attend une image, et vice-versa.

## Les cinq verbes

Chaque opération visuelle est l'un de ces verbes :

```python
find(image)          # localise une fois, lève FindFailed si absent
exists(image)        # localise une fois, renvoie None si absent
wait(image, secs)    # boucle jusqu'à apparition ou timeout
waitVanish(image, s) # boucle jusqu'à disparition ou timeout
findAll(image)       # localise toutes les occurrences (itérateur)
```

Les cinq acceptent un chemin (`"button.png"`), un `Pattern`, ou une autre `Region`.

## Un exemple concret

```python
from sikuli import *

s = Screen(0)                     # moniteur principal

# Attend jusqu'à 10 s que l'app apparaisse
app = s.wait("main_window.png", 10)

# Restreint la recherche au volet droit uniquement — plus rapide, moins ambigu
right_pane = app.right(app.getW() // 2)
save = right_pane.find("save_button.png")

save.highlight(1.5)               # encadré rouge à l'écran pendant 1,5 s
save.click()
```

## Similarité

La similarité par défaut est de **0.7** (70 %). Surcharge par appel ou globale :

```python
click(Pattern("button.png").similar(0.85))    # par appel
Settings.MinSimilarity = 0.65                  # par script
```

Plus haut = plus strict, plus bas = plus permissif. Antialiasing, transparence, changements de thème et hinting de polices baissent tous le score — détendez la similarité plutôt que de re-capturer l'image à chaque fois.

## Target offset

Par défaut OculiX clique au **centre** d'un match. Pour cliquer ailleurs :

```python
# Clique 30 px à droite et 5 px sous le centre de l'icône
icon = Pattern("icon.png").targetOffset(30, 5)
click(icon)
```

Façon canonique de cliquer un libellé situé à côté d'une icône reconnaissable.

## Opérations de Region

```python
r = Screen(0)

r.left(200)           # bande de 200 px à gauche
r.right(200)          # bande de 200 px à droite
r.above(100)          # bande de 100 px au-dessus
r.below(100)          # bande de 100 px en-dessous
r.inside()            # la region elle-même
r.nearby(50)          # version élargie de 50 px
r.grow(50, 100)       # élargissement asymétrique
r.morphTo(otherRegion)
```

Combinées avec `find()`, elles rendent les scripts dramatiquement plus robustes :

```python
# Cherche uniquement dans la boîte de dialogue
dialog = wait("save_dialog_title.png", 5)
dialog.click("save_button.png")
```

## Ancres — définir une region relative à un repère trouvable

```python
header = find("header_logo.png")
search_box = header.right(800).below(0)
search_box.click()
search_box.type("oculix")
```

Quand le layout bouge mais que la position relative est stable, les ancres maintiennent votre script fonctionnel.

## findAll — toutes les occurrences

```python
for m in findAll("checkbox_unchecked.png"):
    m.click()
```

Retourne un itérateur de `Match`, trié par similarité décroissante.

## Highlight — débugger visuellement

```python
match = find("save_button.png")
match.highlight(2)
match.highlight(2, "green")
```

Excellent pour comprendre *pourquoi* votre script a cliqué au mauvais endroit — `highlight()` vous montre exactement ce qu'OculiX a trouvé.

## Mode Slow Motion

Depuis l'IDE : **Run → Run Slow Motion**. Chaque match flashe avant l'action.

## Réglages qui affectent le matching

```python
Settings.MinSimilarity = 0.7        # plancher de similarité par défaut
Settings.AlwaysResize = 1.0         # mise à l'échelle avant matching
Settings.MoveMouseDelay = 0.3       # secondes pour glisser le curseur
Settings.WaitScanRate = 3           # scans/sec pendant wait()
Settings.AutoWaitTimeout = 3.0      # attente implicite avant chaque action
```

`AutoWaitTimeout` est particulièrement utile : s'il est > 0, `click(image)` *attend implicitement* l'image avant de cliquer.

## Conseils de performance

- **Patterns plus petits = match plus rapide.** Crops serrés > captures larges.
- **Restreignez à une `Region`** plutôt que de chercher dans tout l'écran.
- **Cachez les `Match`** quand le layout est stable — `target.click()` est gratuit ; `find()` coûte en CPU.
- **Utilisez `exists()` pour le branchement**, pas `find()`.

## Erreurs courantes

| Erreur               | Cause typique                                                                |
| -------------------- | ---------------------------------------------------------------------------- |
| `FindFailed`         | Image non visible, cachée, similarité trop stricte                            |
| `ImageMissing`       | Chemin incorrect, image absente du bundle `.sikuli`                          |
| `org.opencv.core…`   | Décalage Apertix — voir [Installation](/fr/getting-started/installation/)    |

## Pour la suite

- [Lire du texte à l'écran avec l'OCR](/fr/guides/ocr/)
- [Le pipeline de vision](/fr/guides/vision-pipeline/)
- [Référence API](/fr/reference/api/)
