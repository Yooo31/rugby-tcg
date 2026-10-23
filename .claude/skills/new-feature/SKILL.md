---
name: new-feature
description: Créer une nouvelle feature ou un nouvel écran de Rugby TCG en respectant l'architecture du projet. À utiliser dès qu'on ajoute un dossier sous src/features ou une route sous src/app (missions, classements, administration, profil…).
---

# Créer une feature

1. **Règles du jeu d'abord.** Toute règle nouvelle (calcul, validation, tri métier) va dans `src/domain/<sujet>.ts`, pure, avec son test, et s'exporte par `src/domain/index.ts`. Aléa et date sont des paramètres.
2. **Données ensuite.** Si la feature lit ou écrit des données : ajouter la méthode au contrat dans `src/data/repositories.ts`, l'implémenter dans `src/data/mock/repositories.ts`, la tester dans `repositories.test.ts`.
3. **État partagé.** Si plusieurs écrans en ont besoin, l'exposer par `GameProvider` (`src/features/game`). Sinon, état local à l'écran.
4. **La feature.**
   ```
   src/features/<feature>/
     components/<Feature>Screen.tsx   "use client", enveloppé dans <GameGate>
     components/…                     sous-composants
     lib/…                            fonctions pures propres à la feature (+ tests)
     index.ts                         exports publics uniquement
   ```
5. **La route.** `src/app/(game)/<route>/page.tsx` : exporte `metadata` et rend l'écran, rien d'autre. Un paramètre d'URL se lit sous `<Suspense>` (voir `albums/[albumId]/page.tsx`).
6. **La navigation.** Si l'écran mérite un onglet, l'ajouter à `NAV_ITEMS` dans `src/components/layout/AppShell.tsx` (4 à 5 onglets au plus).
7. **Vérifier.** Largeur 390 px dans un navigateur, puis `pnpm check`.

## À ne pas faire

- Importer `@/features/<autre>/components/...` : passer par `@/features/<autre>`.
- Importer `@/data/mock/...` depuis une feature : passer par `@/data`.
- Mettre de la logique dans `src/app`.
- Écrire une couleur ou une durée en dur : utiliser les tokens de `globals.css`.
