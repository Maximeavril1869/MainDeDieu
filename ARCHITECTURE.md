# Architecture de MainDeDieu

Application web statique (HTML, CSS, JavaScript sans dépendance ni étape de compilation), publiée par GitHub Pages et installable comme PWA.

## Fichiers

```
index.html              page unique, charge les scripts dans cet ordre
manifest.webmanifest    installation sur l'écran d'accueil
sw.js                   service worker : fonctionnement hors ligne (incrémenter VERSION à chaque publication)
css/tokens.css          jetons de design (couleurs, espacements, rayons, polices)
css/style.css           styles, uniquement via les jetons
js/data.js              contenu : groupes, éléments, recettes, phrases de récompense
js/game.js              logique pure (combiner, indice, progression), testable avec Node
js/planet.js            génère la scène Planète en SVG (vue ronde et vue paysage)
js/app.js               interface : écrans, événements, sauvegarde, sons
icons/                  icônes de l'application
tests/data.test.js      tests de données et de logique (Node)
tests/e2e.py            parcours complet dans un navigateur (Playwright)
replica/                documents de la démarche Replica (recon, architecture, design, captures)
```

## Flux de données

`data.js` (contenu) → `game.js` (règles) → `app.js` (état d'écran + rendu) → `planet.js` (scène).
Chaque mode (Genèse, Planète) a sa propre sauvegarde.

## Stockage local (localStorage)

| clé | contenu |
| --- | --- |
| `mdd.v1.classique` | `{ found: [ids], tried: ["a+b"], hintAt: timestamp, hints: n }` |
| `mdd.v1.planete` | même format, progression indépendante |
| `mdd.v1.settings` | `{ sound: bool, view: "round" \| "land" }` |

Un état corrompu est réparé au chargement (`sanitize`).

## Écrans

Accueil (choix du mode), Atelier (fusion), Planète (scène + atelier), Livre des éléments, Réglages.

## Règles de contenu

- Un élément = `id|Nom|emoji|groupe|zone` ; zone `s` (ciel), `g` (sol), `w` (mer) ou vide.
- Une recette = `a+b=résultat[,résultat2]`, commutative, sans doublon.
- `tests/data.test.js` vérifie que tout est atteignable depuis les quatre éléments de départ : à relancer après toute modification de `data.js`.

## Ajouter un élément

1. Ajouter sa ligne dans `ELEMENTS_TXT` et sa recette dans `RECIPES_TXT` (`js/data.js`).
2. `node tests/data.test.js`.
3. Mettre à jour le nombre dans `README.md` et `tests/e2e.py` (livre), incrémenter `VERSION` dans `sw.js`.
