# Architecture (Replica) : MainDeDieu

Version détaillée et à jour : `../ARCHITECTURE.md`.

- Stack : HTML/CSS/JS sans dépendance, PWA, hébergement GitHub Pages. Pas de base de données ni de compte : tout est local (aucune donnée réelle, aucun serveur).
- Modèle de données : Element, Group, Recipe (statiques, dans `js/data.js`) ; Progress par mode (localStorage).
- Accès : aucun contrôle d'accès nécessaire (jeu solo local).
- Routes/API : aucune. Écrans : S01 accueil, S02 atelier, S04 livre, S06 planète, S07 réglages (S03 inventaire par groupes = onglets de S02 ; S05 indice = bouton de S02 ; S08 fin de groupe/victoire = modale).
- Points sensibles : cohérence du graphe de recettes (testée), scène SVG fluide, fusion tactile en deux touches, sauvegarde corrompue (réparée).
- Ordre de build : coque + atelier (tranche verticale) → livre, indice, sauvegarde → Planète → réglages → tests.
