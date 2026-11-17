# Carnet de bord

## 2026-11-17 : planète 3D

- Retour : la planète 2D était trop petite et peu lisible.
- Remplacement par une planète 3D stylisée (Three.js, low-poly), à faire tourner au doigt, pincer pour zoomer ; scène agrandie (46 % de l'écran) et bouton plein écran.
- La planète évolue : océans, continents, herbe, montagnes, glace, désert, nuages, arc-en-ciel, soleil, lune, étoiles, objets 3D (arbres, maisons, villes, châteaux, volcan, bateau) et éléments en orbite.
- Un nouvel élément apparaît avec une animation et la planète se tourne vers lui.
- Vue paysage supprimée (choix : une seule vue 3D). Repli sur la planète 2D si WebGL est indisponible.
- Bundle `vendor/planet3d.js` (≈500 Ko) construit avec esbuild ; service worker en version 2.
- Tests de bout en bout mis à jour (3D, rotation au doigt, plein écran, repli 2D), tous verts.
- Non vérifié : rendu et fluidité sur l'iPad Pro 2018 et l'iPhone 16e réels (testé seulement en émulation logicielle).

## 2026-11-16 : version 1 (cœur du jeu)

- Cadrage : jeu séparé de BacASable, PWA locale iPad Pro + iPhone, modes Genèse et Planète, sélection en deux touches, Planète avec choix de vue (ronde ou paysage).
- Recon Replica à partir de sources publiques (`replica/recon.md`, `replica/features.csv`).
- Architecture, design (jetons, contraste AA vérifié) et build : 122 éléments, 118 recettes originales, 12 groupes.
- Fonctionnalités : fusion, livre des éléments, indice avec attente de 3 minutes, sauvegarde par mode, réinitialisation confirmée, sons, hors ligne.
- Tests : 11 tests de données/logique (Node) et un parcours complet navigateur (Playwright), tous verts.
- Captures dans `replica/clone-screens/`.

### À faire / idées

- Vérifier le rendu réel sur l'iPad Pro et l'iPhone 16e.
- Modes Quêtes, Mission, Artefacts et univers sombre (hors première version).
- Plus d'éléments et de recettes.
