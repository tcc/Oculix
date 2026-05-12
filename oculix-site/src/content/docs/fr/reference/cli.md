---
title: Référence CLI
description: Toutes les options en ligne de commande acceptées par l'IDE OculiX et les runners.
---

OculiX peut être piloté en ligne de commande pour les jobs planifiés, les pipelines CI, les serveurs headless et les scripts ponctuels. Cette page documente chaque option acceptée par le jar IDE et par le runner serveur.

## Jar IDE

```bash
java -jar oculixide-3.0.3.jar [options]
```

### Options courantes

| Option                | Argument         | Rôle                                                          |
| --------------------- | ---------------- | ------------------------------------------------------------- |
| `-l <path>`           | chemin du bundle | Ouvrir ce bundle `.sikuli` au lancement                       |
| `-e`                  | —                | Exécuter le bundle ouvert immédiatement et quitter à la fin   |
| `-r <runner>`         | `py` `py3` `rb` `ps1` `applescript` `robot` | Forcer un runner spécifique  |
| `-c`                  | —                | Mode console — pas de GUI, log sur stdout                     |
| `-d <level>`          | `0`–`3`          | Verbosité de debug (`0` silencieux → `3` très verbeux)        |
| `-v`                  | —                | Afficher la version et quitter                                |
| `-h`                  | —                | Afficher l'aide et quitter                                    |
| `--workspace <dir>`   | dossier          | Utiliser ce workspace au lieu du dernier ouvert               |
| `--theme <name>`      | `dark` `light`   | Forcer un thème                                               |

### Exemples

```bash
# Ouvrir l'IDE sur un script
java -jar oculixide-3.0.3.jar -l ./reports/daily.sikuli

# Lancer un script sans surveillance (cron, Planificateur de tâches)
java -jar oculixide-3.0.3.jar -l ./reports/daily.sikuli -e

# Lancer un script Python 3 via le runner CPython
java -jar oculixide-3.0.3.jar -r py3 my_script.py

# Mode console headless — utile dans les runners CI
java -jar oculixide-3.0.3.jar -c -l ./tests/smoke.sikuli -e
```

Codes de sortie de l'option `-e` :

| Code | Signification                          |
| ---- | -------------------------------------- |
| `0`  | Script terminé sans exception          |
| `1`  | Script a levé un `FindFailed`          |
| `2`  | Script a levé une `SikuliXception`     |
| `3`  | Script a levé toute autre exception    |
| `4`  | Bundle introuvable / non chargeable    |

Donc dans un pipeline CI :

```bash
java -jar oculixide-3.0.3.jar -l my.sikuli -e
if [ $? -eq 0 ]; then echo "OK"; else echo "Failed"; exit 1; fi
```

## Runner serveur — headless

```bash
java -jar oculix-server.jar --port 5555 [options]
```

| Option                | Argument         | Rôle                                                          |
| --------------------- | ---------------- | ------------------------------------------------------------- |
| `--port <n>`          | port TCP         | Port d'écoute (défaut `4567`)                                 |
| `--host <addr>`       | adresse de bind  | Adresse de bind (défaut `127.0.0.1`)                          |
| `--auth <token>`      | bearer token     | Exige ce token sur chaque requête                             |
| `--tls`               | —                | Active HTTPS avec un certificat auto-généré                   |
| `--cert <path>`       | fichier PEM      | Certificat TLS custom                                         |
| `--key <path>`        | fichier PEM      | Clé privée TLS custom                                         |
| `--workspace <dir>`   | dossier          | Racine du workspace                                           |
| `--allow-shell`       | —                | Autorise les commandes shell `Runner.run()` (off par défaut)  |

Résumé de l'API HTTP :

```
POST /run          { "bundle": "path", "args": [] }   → 200 / 4xx
GET  /status                                          → { "running": false, "lastRun": {...} }
POST /stop                                            → 200
GET  /version                                         → { "version": "3.0.3" }
```

Voir [`org.sikuli.scriptrunner.ServerRunner`](https://github.com/oculix-org/Oculix/tree/master/API/src/main/java/org/sikuli/scriptrunner) pour la surface complète.

## Serveur MCP

```bash
java -jar oculix-mcp-server.jar [stdio|http] [options]
```

| Option                | Argument         | Rôle                                                          |
| --------------------- | ---------------- | ------------------------------------------------------------- |
| `stdio`               | —                | Transport stdio (pour brancher directement un agent IA)       |
| `http`                | —                | Transport HTTP (multi-session)                                |
| `--port <n>`          | port TCP         | Port du transport HTTP                                        |
| `--journal <path>`    | dossier          | Où écrire le journal d'audit signé Ed25519                    |
| `--keyring <path>`    | fichier          | Trousseau HMAC rotatif                                        |
| `--confidential`      | —                | Mode confidentiel — ne log jamais les payloads                |
| `--auto-approve`      | —                | Saute l'ActionGate human-in-the-loop (à utiliser avec prudence) |

## Variables d'environnement

| Variable              | Rôle                                                          |
| --------------------- | ------------------------------------------------------------- |
| `OCULIX_HOME`         | Surcharger le répertoire user-data (défaut `~/.OculiX/`)      |
| `OCULIX_WORKSPACE`    | Chemin de workspace par défaut                                |
| `OCULIX_TESSDATA`     | Surcharger l'emplacement `tessdata` Tesseract embarqué        |
| `OCULIX_PADDLEOCR`    | URL de base du serveur PaddleOCR (défaut `http://localhost:5000`) |
| `ANDROID_SERIAL`      | Forcer un device ADB spécifique quand plusieurs sont connectés |
| `OCULIX_DEBUG`        | `1` pour activer le logging interne verbeux                   |
| `OCULIX_THEME`        | `dark` ou `light`                                             |

## Logging

Chaque runner écrit vers :

- **stdout / console IDE** pour `info` et `error`
- `~/.OculiX/logs/oculix.log` pour le fichier de log roulant
- `~/.OculiX/logs/script-<timestamp>.log` pour les logs par exécution de script

Augmentez la verbosité avec `-d 3` ou `OCULIX_DEBUG=1`.

## Suite

- [Migration depuis SikuliX](/fr/reference/migration/) — pour les scripts existants
- [Référence API](/fr/reference/api/) — toutes les classes
