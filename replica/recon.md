# Recon : MainDeDieu (inspiré de Doodle God)

Recon clean-room : fonctionnalités et schémas d'UX uniquement. Aucun asset, texte, nom d'élément signature, ni arbre de recettes copié. Tout le contenu de MainDeDieu sera original.

## 1. Périmètre

- App de référence : Doodle God / Doodle God Blitz (JoyBits), mobile et console.
- Plateforme visée : PWA, iPad Pro 11" et iPhone 16e, 100 % local, gratuit.
- Tranche retenue : cœur du jeu, modes **Classique (Genèse)** et **Planète**.
- Public : usage perso (pas de publication sur les stores).

## 2. Sources publiques

| source | ce qu'elle apporte |
| --- | --- |
| App Store Doodle God Blitz (apps.apple.com/app/id938302806) | liste des modes (Planète, Mission, Artefacts), langues, pubs désactivables |
| App Store Doodle God: Alchemy & Sandbox (apps.apple.com/app/id427157971) | 300+ éléments, encyclopédie, Planète, Mission |
| Wikipedia / miroir (Doodle God) | 4 éléments de départ, 14 catégories, indice toutes les quelques minutes |
| Giant Bomb (Doodle God) | groupes d'éléments, liste des combinaisons découvertes, indices toutes les 3 min |
| Kill Screen (review) | boucle : combiner des éléments de groupes différents, citations à chaque création |
| TrueAchievements (walkthrough, hints) | succès, indices qui annulent certains succès, économie « Divine Glow » |

## 3. Boucle centrale

Partir de 4 éléments primordiaux, en combiner deux pour en créer un nouveau, ce qui élargit l'inventaire, jusqu'à avoir tout découvert. Chaque création déclenche une petite récompense (citation) et, en mode Planète, une animation sur la planète.

## 4. Inventaire des écrans

| ID | écran | accès | but | composants clés | états |
| --- | --- | --- | --- | --- | --- |
| S01 | Accueil / choix du mode | lancement | choisir Classique ou Planète, reprendre | boutons de mode, progression globale | première fois, partie en cours |
| S02 | Atelier (Classique) | S01 | combiner les éléments | zone de travail (2 emplacements), inventaire par groupes, compteur | vide, plein, combinaison réussie, combinaison ratée, déjà connue |
| S03 | Inventaire par groupes | onglets dans S02 | parcourir les éléments découverts | onglets de groupes, grille d'éléments | groupe verrouillé, groupe complet |
| S04 | Livre des éléments | menu | encyclopédie : éléments connus, recettes découvertes, éléments restant | liste, détail d'un élément | élément inconnu masqué |
| S05 | Indice | bouton dans S02 | suggérer une combinaison possible | bouton, minuteur de recharge | disponible, en recharge |
| S06 | Planète | S01 ou onglet | voir le monde évoluer selon les éléments créés | scène animée, pastille de nouveautés | planète nue, planète riche |
| S07 | Réglages | menu | son, langue, réinitialiser | interrupteurs, bouton de remise à zéro avec confirmation | confirmation |
| S08 | Fin de groupe / victoire | événement | célébrer un groupe ou le jeu complet | modale | groupe, jeu complet |

## 5. Flux

- **F01 Première création** : S01 → S02 → choisir 2 éléments → nouvel élément (1 combinaison, ~3 clics) → toast + citation.
- **F02 Combinaison ratée** : S02 → 2 éléments sans recette → retour doux, rien ne se perd.
- **F03 Demander un indice** : S02 → S05 → suggestion → si le minuteur n'est pas écoulé, attente affichée.
- **F04 Consulter le livre** : S02 → S04 → détail d'un élément.
- **F05 Voir la planète évoluer** : créer un élément → S06 → animation correspondante.
- **F06 Reprendre une partie** : S01 → S02 avec la progression sauvegardée.
- **F07 Réinitialiser** : S07 → confirmation → retour à 4 éléments.

## 6. Composants

Bouton, onglet de groupe, vignette d'élément (4 états : normal, sélectionné, nouveau, verrouillé), emplacement de fusion, toast de création, modale de confirmation, barre de progression, liste du livre, interrupteur.

## 7. Modèle de données inféré

- **Element** : id, nom, groupe_id, description, apparition_planète (optionnel). Preuve : catégories et encyclopédie. Confiance : haute.
- **Group** : id, nom, ordre. Confiance : haute (14 catégories dans l'original).
- **Recipe** : a_id, b_id, résultats[] (une recette peut donner plusieurs éléments), commutative. Confiance : haute.
- **Progress** : éléments découverts, recettes découvertes, date du dernier indice, compteur d'essais. Confiance : moyenne.
- **PlanetFeature** : élément_id, visuel/animation, position. Confiance : moyenne (l'original montre le monde qui s'anime).

## 8. Ce qui ne sera pas cloné (skip)

- Monnaie « Divine Glow » et achats intégrés : modèle économique, hors sujet pour un jeu perso gratuit.
- Publicités.
- Contenu sous licence : citations, noms de personnages, illustrations, musique de l'original.
- Modes Mission, Quêtes, Puzzle, Artefacts, Devil : prévus plus tard, hors première version.
- 13 langues : français seulement au départ.

## 9. Taille et difficultés

- Taille : **M** pour le cœur, car le gros du travail est de concevoir un arbre de recettes original et cohérent (centaines d'éléments possibles, première version visée : ~120).
- 3 points durs :
  1. Équilibre et cohérence de l'arbre de recettes (graphe sans impasse, tout atteignable).
  2. Mode Planète : scène animée lisible et fluide sur iPhone 16e.
  3. Interaction tactile de fusion (glisser-déposer ou sélection en deux touches).
