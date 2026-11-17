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
js/planet.js            scène Planète 2D en SVG : repli si WebGL est indisponible
src/planet3d.js         planète 3D stylisée (Three.js) : terrain low-poly généré, objets, nuages, orbites, rotation au doigt
vendor/planet3d.js      bundle de src/planet3d.js + Three.js (généré par `npm run build`, versionné pour GitHub Pages)
package.json            dépendances de build uniquement (three, esbuild)
js/app.js               interface : écrans, événements, sauvegarde, sons
icons/                  icônes de l'application
tests/data.test.js      tests de données et de logique (Node)
tests/e2e.py            parcours complet dans un navigateur (Playwright)
replica/                documents de la démarche Replica (recon, architecture, design, captures)
```

## Flux de données

`data.js` (contenu) → `game.js` (règles) → `app.js` (état d'écran + rendu) → `planet3d` (scène 3D) ou `planet.js` (repli 2D).
Chaque mode (Genèse, Planète) a sa propre sauvegarde.

## Stockage local (localStorage)

| clé | contenu |
| --- | --- |
| `mdd.v1.classique` | `{ found: [ids], tried: ["a+b"], hintAt: timestamp, hints: n }` |
| `mdd.v1.planete` | même format, progression indépendante |
| `mdd.v1.settings` | `{ sound: bool }` |

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

## Planète 3D

- Terrain : icosphère (détail 5) déformée par un bruit fractal ; couleurs par face (océan, plage, herbe, roche, neige, désert, glace). Le relief évolue selon les éléments trouvés (mer, plante, montagne, glace, désert).
- Objets : modèles low-poly pour arbre, forêt, jungle, cactus, cabane, maison, village, ville, château, usine, volcan, bateau ; les autres éléments sont des sprites emoji (sol, mer) ou en orbite (ciel).
- Un élément nouveau apparaît avec une animation et la planète se tourne vers lui.
- Mise à jour : `scene3d.update(trouvés, nouveaux)` depuis `app.js`. La scène est détruite et recréée au changement de mode ou à la réinitialisation.
- Si WebGL n'est pas disponible, `app.js` affiche la scène 2D (`planet.js`).
- Après modification de `src/planet3d.js` : `npm run build`, puis incrémenter `VERSION` dans `sw.js`.
