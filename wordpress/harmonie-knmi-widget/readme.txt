=== Tableau HARMONIE KNMI ===
Contributors: alertesmeteo-hub
Tags: meteo, harmonie, arome, knmi, previsions
Requires at least: 5.8
Requires PHP: 7.4
Stable tag: 2.10.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Recherche nationale et tableau horaire du modèle HARMONIE-AROME officiel du KNMI.

== Description ==

L'extension permet de rechercher les 34 746 communes de France métropolitaine
et de Corse par nom ou par code postal. Elle charge ensuite uniquement le
fichier du département choisi. Les prévisions proviennent directement du
modèle HARMONIE-AROME Cy43 du KNMI ; Open-Meteo n'est pas utilisé.

== Installation ==

1. Installer et activer l'extension.
2. Ajouter le shortcode `[harmonie_table]` dans une page WordPress.
3. Le visiteur saisit le nom d'une commune ou un code postal.
4. Si nécessaire, modifier l'adresse du dossier national dans Réglages > HARMONIE KNMI.

Exemple avec Paris comme commune affichée au chargement :
`[harmonie_table code="75056" departement="75" ville="Paris" heures="48"]`

Exemple limité à une seule ville, sans champ de recherche :
`[harmonie_table code="66136" departement="66" ville="Perpignan" heures="48" selecteur="non"]`

== Changelog ==

= 2.10.0 =
* Nouvel onglet « Carte » : cartes météo HARMONIE interactives (température, précipitations, neige, vent, rafales, pression, nébulosité, humidité) avec zoom/pan, diagramme au clic et capture PNG — même moteur que le module AROME.
* Le pipeline national produit désormais un manifeste `maps/index.json` en plus des tableaux par département.

= 2.9.0 =
* Migration vers le nouveau dépôt dédié `alertesmeteo-hub/harmonie` (données publiées sur sa branche `data`).
* Ajout d'un lien « Shortcodes / Aide » sur la page Extensions, séparé des Réglages.
* La date de version est désormais affichée en plus du numéro dans le pied du widget.

= 2.8.7 =
* Diagramme précipitations : l'échelle est désormais pilotée par le cumul pour que la courbe ne dépasse jamais et pour obtenir une graduation unique cohérente (ex. 0, 5, 10, 15, 20, 25 mm).
* Diagrammes : plus d'air en haut du tracé pour éviter toute impression de valeurs hors échelle.
* Libellés de journée encore agrandis.


= 2.8.6 =
* Précipitations : échelle Y arrondie sur des pas météorologiques lisibles (ex. 0, 5, 10, 15 mm au lieu de 0, 3,5, 7, 10,5, 14 mm).
* Cumul : échelle indépendante arrondie (ex. 0 à 25 mm par pas de 5 pour un cumul de 20,3 mm).
* Marge automatique au-dessus des maxima pour éviter qu'une barre ou une courbe touche le bord supérieur.


= 2.8.5 =
* Graphiques : suppression des points visibles sur les courbes température, pression, vent, rafales et cumul.
* Température : suppression des chiffres écrits sur la courbe.
* Diagrammes : échelle plus aérée, avec marge haute et basse pour éviter les tracés collés au bord.
* Jours (ex. mer. 19/08) encore agrandis et plus gras dans le bandeau supérieur.


= 2.8.4 =
* Diagramme pression : suppression des valeurs mini/maxi écrites directement sur la courbe.
* Libellés de journée (ex. mer. 19/08) nettement agrandis et bandeau supérieur renforcé.
* Précipitations : courbe du cumul sans points visibles, tout en conservant les infobulles via zones de survol invisibles.

= 2.8.3 =
* Journées plus visibles sur les diagrammes : fond pastel renforcé, bandeau coloré supérieur, libellé centré et séparateur vertical à chaque changement de jour.
* Les courbes restent en traits uniquement, sans remplissage.

= 2.8.2 =
* Correctif définitif : toutes les courbes SVG sont forcées sans remplissage.
* Cumul des précipitations centré.
* Version du plugin affichée dans le pied du module.

= 2.8.1 =
* Courbes affichées en traits uniquement, sans remplissage sous température ou pression.
* Suppression de la zone remplie entre vent moyen et rafales.
* Points plus petits et creux pour une lecture plus nette.
* Fonds journaliers rendus plus discrets.


= 2.7.0 =
* Diagrammes entièrement modernisés sans dépendance externe.
* Courbes lissées avec points interactifs et infobulles.
* Fonds journaliers colorés pour séparer visuellement les journées.
* Cartes en grille 2 colonnes sur grand écran et 1 colonne sur tablette/mobile.
* Température et pression : mini/maxi et zone sous la courbe.
* Précipitations : barres colorées selon l’intensité + courbe de cumul.
* Vent : zone entre vent moyen et rafales, valeurs maximales en tête de graphique.
* Axes et échelles rendus plus lisibles, notamment pour la pression.


= 2.1.0 =
* Ajout de l'option `selecteur="non"` pour verrouiller le tableau sur une seule commune.

= 2.0.0 =
* Recherche avec autocomplétion par commune ou code postal.
* Couverture des 34 746 communes de France métropolitaine et de Corse.
* Chargement rapide par département et partage des points de grille identiques.
* Sélection d'une nouvelle commune sans rechargement de la page.

= 1.0.0 =
* Première version : tableau responsive, cache et alerte de données anciennes.


== Version 2.6 ==

* Vent moyen et rafales affichés au palier supérieur de 5 km/h.
* Couleur différente de la cellule Date pour chaque jour de la semaine.
* Tableau Orages allégé : Iso 0 °C, Iso −20 °C et ω 500 déplacés dans Détails.
* Date et Heure restent visibles lors du défilement horizontal du tableau Orages.
* Détails affichés verticalement directement sous le bouton de l’échéance.

== Version 2.4 ==
- Perpignan devient la commune affichée par défaut.
- Altitude du point de grille HARMONIE affichée à côté de la ville.
- Dates regroupées verticalement par jour, au format « mer. / 19/08 ».
- Vents et rafales arrondis au km/h, direction matérialisée par une flèche colorée selon la force.
- Pluie colorée selon l’intensité.
- Quatre diagrammes ajoutés sous les prévisions générales : température, pression MSL, précipitations + cumul, vent moyen + rafales.
- CAPE/CIN quasi nuls affichés « — » au lieu d’un faux 0.
- Barre de défilement horizontale également au-dessus du tableau Orages.
- Détails cisaillement/SRH présentés verticalement.

== Version 2.3 ==
- Troisième onglet Risque de neige.
- Tableau général compact et températures/vents arrondis.
- CAPE/CIN estimés sur le profil P3 au lieu de faux zéros.
- Cisaillements et SRH affichés uniquement à la demande.

== Version 2.2 ==
Deux onglets au choix : prévisions générales et diagnostics orageux HARMONIE P3.


= 2.8.0 =
* Diagrammes pleine largeur et nettement plus hauts.
* Infobulles HTML instantanées au survol et au clavier.
* Bouton « Détecter ma ville » via géolocalisation du navigateur et API geo.api.gouv.fr.
