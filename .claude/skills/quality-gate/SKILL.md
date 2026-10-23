---
name: quality-gate
description: Vérifier qu'un changement de Rugby TCG est prêt à être livré. À utiliser avant d'annoncer qu'une tâche est terminée, avant un commit ou une pull request.
---

# Contrôle avant livraison

1. `pnpm check` : typecheck, lint, tests, build. Tout doit passer ; ne jamais désactiver une règle pour y arriver.
2. `pnpm test:cov` si `src/domain`, `src/data` ou `src/lib` a changé : le seuil est bloquant.
3. Pour tout changement visible, lancer `pnpm dev` et parcourir dans un navigateur, en 390 px puis en grand écran :
   - accueil → ouvrir un booster → révélation → résumé → collection → un album ;
   - recharger : les cartes sont toujours là ;
   - pas de défilement horizontal, pas d'erreur dans la console ;
   - « réduire les animations » activé : rien ne bouge, tout reste utilisable.
4. Relire le diff avec les règles non négociables de `CLAUDE.md` en tête.
5. Rendre compte honnêtement : ce qui a été vérifié, ce qui ne l'a pas été, ce qui échoue.
