# Composants

- **Tuile d'élément** : 88 px de haut, emoji + nom. États : normal, sélectionné (bordure accent), récent (bordure verte). Vrai `<button>`, `aria-pressed`, `aria-label` = nom.
- **Emplacement de fusion (A/B)** : 84 px. États : vide (pointillés), rempli (bordure accent). Toucher = retirer.
- **Bouton Indice** : affiche « Indice » ou le temps restant (m:ss).
- **Onglet de groupe** : pastille défilante, `aria-pressed`, compteur trouvés/total ; masqué tant que le groupe est vide.
- **Message** : zone `aria-live`, variantes neutre / succès / échec.
- **Scène Planète** : SVG, vue ronde ou paysage, bouton de bascule 44 px.
- **Barre du bas** : 4 boutons 52 px, `aria-current` sur l'écran actif.
- **Livre** : `<details>` par élément ; inconnu = « ??? » atténué.
- **Interrupteur** : `role="switch"`, `aria-checked`.
- **Modale** : confirmation de réinitialisation, groupe complet, victoire.
- Focus visible partout (anneau accent 2 px). Mouvement réduit respecté (`prefers-reduced-motion`).
