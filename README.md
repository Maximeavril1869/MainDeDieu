# MainDeDieu

Jeu de fusion d'éléments : tu pars de quatre éléments (feu, eau, terre, air) et tu en mélanges deux à la fois pour créer tout un monde. 122 éléments, 118 recettes, tout en français.

Application web installable (PWA) pour iPad Pro et iPhone. Tout est local : aucune donnée n'est envoyée, la progression est enregistrée sur l'appareil.

## Modes

- **Genèse** : le mode classique, sans limite de temps.
- **Planète** : le même jeu, avec une planète 3D stylisée qui prend vie à chaque élément créé. Tu la fais tourner au doigt (et pince pour zoomer), et le bouton en haut à droite de la scène l'agrandit en plein écran.

La progression de chaque mode est indépendante.

## Jouer

Adresse (GitHub Pages) : https://maximeavril1869.github.io/MainDeDieu/

Sur iPhone/iPad : ouvrir l'adresse dans Safari, puis Partager, puis « Sur l'écran d'accueil ».

## Tester

```
npm install && npm run build   # reconstruit vendor/planet3d.js (uniquement si src/planet3d.js change)
node tests/data.test.js     # cohérence de l'arbre de recettes et logique du jeu
python3 tests/e2e.py        # parcours complet dans un navigateur (playwright)
```

## Documentation

- `ARCHITECTURE.md` : organisation du code et des données
- `JOURNAL.md` : carnet de bord du projet
- `replica/` : recon, architecture, design et suivi des fonctionnalités

## Licence

Tous droits réservés. Voir `LICENSE`. Le jeu s'inspire du principe des jeux d'alchimie ; le contenu (éléments, recettes, textes, visuels, code) est original.
