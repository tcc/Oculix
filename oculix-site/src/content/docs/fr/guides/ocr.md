---
title: OCR et reconnaissance de texte
description: Deux moteurs OCR dans OculiX — Tesseract (embarqué) et PaddleOCR (serveur HTTP optionnel).
---

OculiX vous donne deux moteurs OCR complémentaires, avec des compromis très différents :

| Moteur     | Quand l'utiliser                                                     | Installation |
| ---------- | -------------------------------------------------------------------- | ------------ |
| **Tesseract** | Scripts latins, mises en page simples, aucun process externe       | Embarqué, zéro install |
| **PaddleOCR** | CJK, scripts mélangés, mises en page complexes, haute précision    | Serveur HTTP optionnel |

Vous pouvez utiliser les deux dans le même script. Choisissez par appel selon ce que vous lisez.

## Tesseract — embarqué via Legerix

Tesseract est **entièrement embarqué** dans OculiX via [Legerix](https://github.com/oculix-org/Legerix). La coordonnée Maven `io.github.oculix-org:legerix:5.5.0-4` amène les binaires natifs *et* les fichiers traineddata `tessdata` dans le JAR. Rien à installer de votre côté.

**Langues fournies clé en main :**

| Code        | Langue                                  |
| ----------- | --------------------------------------- |
| `eng`       | Anglais                                 |
| `fra`       | Français                                |
| `spa`       | Espagnol                                |
| `chi_sim`   | Chinois simplifié                       |
| `hin`       | Hindi                                   |
| `osd`       | Orientation & Script Detection (auto-rotation) |

### Lire du texte — API haut-niveau

```python
from sikuli import *

# Lit tout l'écran
print Screen(0).text()
# → "File  Edit  View  ...   Save   Cancel"

# Lit dans une region
btn_area = Region(100, 200, 300, 50)
print btn_area.text()
```

`Region.text()` lance Tesseract sur la region capturée et retourne le texte reconnu. La region englobante est automatiquement nettoyée — pour la meilleure précision, capturez un crop serré autour du texte.

### Trouver un bouton par son libellé

```python
# Localise le libellé "Submit" à l'écran, clique dessus
target = Region(0, 0, 1920, 1080).findText("Submit")
target.click()
```

`findText(label)` renvoie un `Match` que vous pouvez cliquer, survoler, dans lequel taper, ou chaîner avec d'autres opérations de region. À utiliser quand l'**image** du bouton change (thème, icône dynamique) mais que son **libellé** est stable.

### Changer de langue par appel

```python
Settings.OcrLanguage = "fra"
print Region(...).text()          # lit comme du français

Settings.OcrLanguage = "chi_sim"
print Region(...).text()          # lit comme du chinois simplifié
```

### Régler le moteur

Tesseract expose des Page Segmentation Modes (PSM) et OCR Engine Modes (OEM) :

```python
Settings.OcrPSM = 7    # bloc unique de texte uniforme (idéal pour un libellé)
Settings.OcrPSM = 11   # texte épars — trouve autant que possible
Settings.OcrOEM = 3    # défaut — neural + legacy
```

PSM `7` est le sweet spot pour matcher des libellés de boutons — `11` est meilleur pour lire des paragraphes.

## PaddleOCR — serveur HTTP optionnel

Pour les langues CJK, le texte vertical, l'écriture manuscrite, ou les mises en page bruitées, **PaddleOCR** surclasse Tesseract de loin. Il tourne comme un petit serveur HTTP Python avec lequel OculiX communique en localhost.

### Installer le serveur

```bash
pip install paddleocrserver-powered
paddleocrserver
# Écoute sur http://localhost:5000
```

Le serveur est publié sur PyPI sous [`paddleocrserver-powered`](https://pypi.org/project/paddleocrserver-powered/) et tourne sur Flask + Waitress, binaire unique, GPU optionnel.

### L'utiliser depuis un script

```python
from sikuli import *
from org.sikuli.script import PaddleOCREngine

ocr = PaddleOCREngine()   # détecte automatiquement http://localhost:5000

# Capture la region, lance l'OCR
img = capture(Region(0, 0, 1920, 1080))
json = ocr.recognize(img.getFile())

# Trouve les coordonnées d'un texte à l'écran
coords = ocr.findTextCoordinates(json, "Validate")
if coords:
    x, y, w, h = coords[0], coords[1], coords[2], coords[3]
    click(Location(x + w//2, y + h//2))
```

### Inspecter tout ce que PaddleOCR voit

```python
results = ocr.parseTextWithConfidence(json)
for text, confidence in results.items():
    print "%-30s  %.2f" % (text, confidence)
# Submit                          0.9997
# Cancel                          0.9981
# 你好                            0.9962
```

### Quand préférer PaddleOCR

- **CJK** — chinois, japonais, coréen. PaddleOCR a été entraîné pour eux.
- **Scripts mélangés** dans la même image (latin + asiatique)
- **Texte vertical** (japonais, chinois traditionnel)
- **Haute précision requise** sur petites polices, antialiasing, fonds bruités

## Chaîne de fallback (interne, pour info)

`Commons.loadTesseract()` exécute un fallback à 4 niveaux à l'initialisation :

1. **Binaires natifs Legerix** (embarqués) — première tentative
2. **Tess4J + tessdata Legerix** — deuxième si le loader natif échoue
3. **Binaire système `tesseract`** — troisième si la JVM ne charge pas JNI
4. **`SikuliXception("Reinstall OculiX")`** — abandon

En pratique vous ne dépasserez jamais l'étape 1, mais si vous voyez ça dans vos logs, c'est presque toujours une install corrompue — réinstallez ou rebuildez depuis les sources.

## Conseils de performance

- **Crop serré.** Tesseract bosse sur ce qu'on lui donne — une petite region focalisée tourne 10× plus vite que tout l'écran.
- **Cachez le moteur.** `PaddleOCREngine ocr = new PaddleOCREngine()` une fois par script, pas par appel.
- **Utilisez `findText()` plutôt que `text()` + parsing** quand vous voulez *cliquer* un mot précis — un seul aller-retour.
- **Ne lancez pas l'OCR là où un match d'image marche.** Un match PNG est toujours moins cher qu'un OCR. Gardez l'OCR pour les libellés dynamiques.

## Pièges courants

| Symptôme                                          | Cause probable                            |
| ------------------------------------------------- | ----------------------------------------- |
| Les chiffres reviennent en lettres (`O` au lieu de `0`) | PSM pas sur ligne unique ; détendre la similarité |
| Le chinois revient en caractères latins           | `Settings.OcrLanguage` est toujours `"eng"` |
| PaddleOCR renvoie des résultats vides             | Serveur pas lancé sur `localhost:5000`     |
| `Connection refused`                              | Installez `paddleocrserver-powered` et démarrez-le |

## Pour la suite

- [Internes du pipeline de vision](/fr/guides/vision-pipeline/) — comment OculiX voit
- [Scripting Jython en profondeur](/fr/guides/jython/)
- [Référence API](/fr/reference/api/) — `Region.text()`, `Region.findText()`, `PaddleOCREngine`
