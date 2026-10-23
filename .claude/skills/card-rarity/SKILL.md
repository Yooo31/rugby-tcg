---
name: card-rarity
description: Modifier l'apparence des cartes de club, ajouter ou ajuster une rareté, un effet holographique, le blason généré ou l'animation de révélation. À utiliser pour tout travail sur src/features/cards ou sur les raretés du domaine.
---

# Cartes et raretés

## Principe à ne jamais casser

La **rareté** décrit l'objet (finition de la carte). La **puissance** décrit le club. Elles sont indépendantes : un club de Régionale 3 peut être légendaire. L'effet visuel dépend de la rareté seule ; le chiffre affiché dépend du club seul.

## Où vit quoi

| Sujet                                 | Fichier                                             |
| ------------------------------------- | --------------------------------------------------- |
| Liste, ordre et libellés des raretés  | `src/domain/card.ts` (`RARITIES`)                   |
| Probabilités de tirage                | `src/domain/booster.ts` (`RARITY_ODDS`, somme = 1)  |
| Couleur de chaque rareté              | `src/app/globals.css` (`--color-rarity-*`)          |
| Cadre, feuille métallisée, animations | `src/features/cards/components/ClubCard.module.css` |
| Inclinaison et reflets au pointeur    | `src/features/cards/hooks/useCardTilt.ts`           |
| Blason généré                         | `src/features/cards/components/ClubCrest.tsx`       |

## Règles de la feuille de style

- Dimensions internes en `cqw` uniquement : la carte doit rester identique de 90 px à 400 px de large.
- Une rareté = un bloc `.card[data-rarity="…"]` qui définit `--rarity`, `--frame`, `--frame-glow`, puis ses effets.
- Les effets au pointeur lisent `--pointer-x`, `--pointer-y`, `--active` ; ne jamais les piloter par un état React.
- Le texte de la carte repose toujours sur le fond sombre, jamais directement sur une couleur de club : c'est ce qui garantit le contraste quelles que soient les couleurs.
- Toute animation doit s'éteindre sous `prefers-reduced-motion`.
- Garder les règles dans `@layer components`.

## Ajouter une rareté

1. L'ajouter à `RARITIES` (à sa place dans l'ordre) et à `RARITY_ODDS` en gardant une somme de 1.
2. Ajouter le token `--color-rarity-<id>` et son bloc dans `ClubCard.module.css`.
3. Compléter les tables indexées par `Rarity` : TypeScript signale chacune (`RARITY_HALO`, `RARITY_TEXT` dans `BoosterReveal.tsx`).
4. Mettre à jour les cas de `rollRarity` dans `booster.test.ts`.

## Vérifier

Ouvrir `/collection` avec une carte de chaque rareté, en 390 px et en grand écran, survoler, ouvrir la carte en grand, puis activer « réduire les animations ».
