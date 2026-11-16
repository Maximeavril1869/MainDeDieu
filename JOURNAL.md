# Carnet de bord

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
