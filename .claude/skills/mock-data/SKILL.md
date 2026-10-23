---
name: mock-data
description: Ajouter ou corriger des clubs, réimporter une saison, toucher au catalogue (src/data/catalog), au script d'import (scripts/import-clubs), aux dépôts fictifs ou au remplissage de la base. À utiliser pour tout travail sur les données de clubs.
---

# Données de clubs

Lire d'abord `docs/data-sources.md` : sources, licences, limites.

## Où vit quoi

| Sujet                             | Fichier                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------- |
| Clubs du Top 14 à la Fédérale 3   | `src/data/catalog/clubs.wikipedia.json` — **généré, ne pas éditer à la main** |
| Clubs régionaux (indicatifs)      | `src/data/catalog/clubs.regional.ts`                                          |
| Assemblage du catalogue           | `src/data/catalog/index.ts` (`CLUB_CATALOG`)                                  |
| Import Wikipédia + Wikidata       | `scripts/import-clubs/`                                                       |
| Corrections manuelles de l'import | `scripts/import-clubs/overrides.ts`                                           |
| Remplissage de la base            | `prisma/seed.ts`                                                              |

## Corriger un club importé

Ne pas modifier le JSON : il serait écrasé au prochain import.

- Commune ou département faux ou manquant : `LOCATION_OVERRIDES` dans `overrides.ts`, par code Wikipédia (« ru Mâcon »).
- Club à écarter : `EXCLUDED_CLUBS`, avec la raison.
- Couleur mal lue : compléter `NAMED_COLORS` dans `colors.ts` et ajouter le cas à `colors.test.ts`.

Puis `pnpm clubs:import`, `pnpm test`, `pnpm db:seed`.

## Ajouter un club régional

Une ligne dans `clubs.regional.ts`, sous sa division :

```ts
["identifiant-stable", "Nom du club", "Ville", "31", "#c8102e", "#111111"],
```

L'identifiant est en kebab-case, unique, et ne change jamais : les cartes des joueurs y font référence.

## Règles

- Passer uniquement par des sources ouvertes et leurs API officielles, à rythme lent. Ne jamais aspirer les sites de la FFR.
- Toute fonction qui transforme du texte en donnée va dans `parse.ts` ou `colors.ts`, pure et testée ; le réseau reste dans `http.ts`, `wikipedia.ts`, `wikidata.ts`.
- Un club dont l'identifiant change est un autre club pour la base : `pnpm db:seed` retire l'ancien seulement si personne ne le possède.
- Une mission ne doit jamais porter sur une division trop peu fournie pour être réalisable en une journée (`MISSION_POOL`).

## Dépôts fictifs et bascule

Les dépôts fictifs (`src/data/mock`) gardent l'état du joueur en `localStorage` et servent aux tests (`createInMemoryRepositories`). La bascule vers la base se fait dans `createRepositories()` (`src/data/index.ts`) ; voir `CLAUDE.md`, section Données.
