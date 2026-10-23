# Design system — « Stade de nuit »

## L'idée

Un match en nocturne : la nuit autour, la pelouse éclairée, la craie des lignes, l'or du trophée. L'écran s'efface pour laisser la vedette à l'objet de collection, la carte.

## Tokens (`src/app/globals.css`)

| Rôle       | Token                                           | Valeur                          |
| ---------- | ----------------------------------------------- | ------------------------------- |
| Fond       | `night`                                         | `#05090d`                       |
| Surfaces   | `surface`, `surface-raised`, `surface-hover`    | `#0b131a` → `#1a2834`           |
| Traits     | `line`, `line-strong`                           | blanc à 8 % et 16 %             |
| Texte      | `chalk`, `chalk-muted`, `chalk-faint`           | `#eef4f0`, `#93a4ad`, `#5f707a` |
| Action     | `pitch`, `pitch-strong`, `pitch-deep`           | `#37d67f`…                      |
| Récompense | `gold`, `gold-deep`                             | `#f2c14e`…                      |
| Raretés    | `rarity-common`, `-rare`, `-epic`, `-legendary` | gris, bleu, violet, or          |

- **Vert pelouse** : l'action principale et la progression. **Or** : ce qui se gagne (nouveauté, album terminé, légendaire). Ne pas les intervertir.
- Typographie : **Barlow Condensed** (titres, chiffres, boutons ; capitales) et **Geist** (texte courant).
- Utilitaires maison : `panel` (bloc de contenu), `eyebrow` (sur-titre), `skeleton`, `pb-safe-nav`, `scrollbar-none`.

## La carte

Format 5:7. De haut en bas : division et puissance, blason, nom, ville et département, forme récente et rareté. Le fond porte un halo à la couleur principale du club et les anneaux de maillot à sa couleur secondaire.

| Rareté     | Finition                                                           |
| ---------- | ------------------------------------------------------------------ |
| Commune    | cadre acier mat                                                    |
| Rare       | cadre bleu brillant, reflet qui suit le pointeur                   |
| Épique     | cadre violet, feuille holographique                                |
| Légendaire | cadre or en rotation, holographie animée, scintillements, nom doré |

La carte s'incline vers le doigt ou la souris, avec un reflet de lumière. Détails dans le skill `card-rarity`.

## Mise en page

- Mobile d'abord. Contenu centré, 72 rem au plus.
- Navigation : barre d'onglets flottante en bas sur mobile, liens dans l'en-tête à partir de `md`.
- Un écran = un `ScreenHeader` (sur-titre vert + grand titre), puis des blocs `panel`.
- Cibles tactiles de 44 px au moins ; action principale en bas, à portée de pouce.

## Mouvement

Courbe `ease-out-expo`, durées courtes (200 à 700 ms). Le mouvement sert un événement : le sachet qui s'ouvre, la carte qui se retourne, la jauge qui avance. Tout s'éteint sous `prefers-reduced-motion`.

## Ton

Français, vouvoiement, clins d'œil au rugby dans les titres (« Coup d'envoi », « Essai transformé », « Vestiaire vide »), consignes claires dans les boutons (« Ouvrir le booster »).
