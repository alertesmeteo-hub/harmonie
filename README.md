# harmonie

Pipeline national HARMONIE-AROME (KNMI, Cy43 P3) pour les 34 746 communes de
France métropolitaine et de Corse, plus le plugin WordPress qui l'affiche.

## Fonctionnement

Une GitHub Action ([`update-harmonie.yml`](.github/workflows/update-harmonie.yml))
tourne toutes les heures :

1. Télécharge le dernier run HARMONIE publié par le KNMI.
2. Décode le GRIB (`scripts/update_harmonie.py`) et calcule, pour chaque
   commune du catalogue (`config/communes-france.json`), les prévisions
   générales, les diagnostics orageux et le risque de neige
   (`scripts/update_harmonie_france.py`).
3. Publie le résultat (un fichier JSON par département) sur la branche
   [`data`](../../tree/data) du dépôt.

Le plugin WordPress ([`wordpress/harmonie-knmi-widget`](wordpress/harmonie-knmi-widget))
charge ces fichiers directement depuis `raw.githubusercontent.com` — aucun
serveur intermédiaire.

## Shortcode

```
[harmonie_table code="75056" departement="75" ville="Paris" heures="48"]
```

Voir le `readme.txt` du plugin pour la liste complète des attributs.

## Structure du dépôt

```
.github/workflows/update-harmonie.yml   Action planifiée (branche data)
config/communes-france.json             Catalogue communal + grille HARMONIE
scripts/update_harmonie.py              Décodage GRIB / accès KNMI (base)
scripts/update_harmonie_france.py       Pipeline national (toutes communes)
wordpress/harmonie-knmi-widget/         Plugin WordPress (shortcode)
```
