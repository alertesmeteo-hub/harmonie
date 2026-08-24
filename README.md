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
3. Produit en parallèle des cartes France (température, précipitations,
   neige, vent, rafales, pression, nébulosité, humidité) à partir de la
   grille native complète, via `scripts/harmonie_maps.py`
   (`build/national/maps/`).
4. Publie le résultat (un fichier JSON par département + les cartes) sur la
   branche [`data`](../../tree/data) du dépôt.

Le plugin WordPress ([`wordpress/harmonie-knmi-widget`](wordpress/harmonie-knmi-widget))
charge ces fichiers directement depuis `raw.githubusercontent.com` — aucun
serveur intermédiaire. Il affiche quatre onglets : prévisions générales,
orages, neige, et carte interactive.

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
scripts/harmonie_maps.py                Rendu des cartes (grille native → Web Mercator)
config/natural-earth/                   Côtes et frontières nationales (overlay des cartes)
config/departements-france.geojson      Contours départementaux (IGN Admin Express, licence ouverte Etalab)
wordpress/harmonie-knmi-widget/         Plugin WordPress (shortcode + carte)
```
