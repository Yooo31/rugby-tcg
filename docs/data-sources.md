# Sources de données

## Clubs, du Top 14 à la Fédérale 3

Import automatique de la saison en cours (`pnpm clubs:import`, code dans `scripts/import-clubs`).

| Donnée                                                   | Source                                                                                       | Licence      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------ |
| Composition des divisions, bilan victoires-nuls-défaites | Wikipédia en français, pages de saison (« Championnat de France de rugby à XV … 2026-2027 ») | CC BY-SA 4.0 |
| Nom d'usage du club                                      | Wikipédia, modèle « chemin équipes rugby à XV »                                              | CC BY-SA 4.0 |
| Couleurs                                                 | Wikipédia, infobox de l'article du club                                                      | CC BY-SA 4.0 |
| Commune et département                                   | Wikidata (siège du club, code INSEE)                                                         | CC0          |

Les deux sont interrogées par leur API officielle, lentement, avec un cache local (`.cache/import-clubs`).

### Mention à faire figurer

Le contenu de Wikipédia est réutilisable à condition de citer la source et la licence. Avant toute mise en ligne publique, le jeu doit afficher une mention du type : « Données des clubs : Wikipédia (CC BY-SA 4.0) et Wikidata ». Elle n'existe pas encore dans l'interface.

### Limites connues

- **Couleurs** : seuls les clubs qui ont leur propre article ont leurs vraies couleurs (164 sur 371 à l'import d'octobre 2026). Les autres reçoivent une paire attribuée d'office, stable d'une fois sur l'autre.
- **Forme** : Wikipédia donne le bilan de la saison, pas l'ordre des matchs. Les cinq résultats affichés reprennent les proportions du bilan ; leur ordre est conventionnel.
- **Fraîcheur** : les pages sont tenues par des bénévoles. Relancer l'import (après avoir vidé le cache) pour rafraîchir bilans et compositions.
- **Communes saisies à la main** : huit clubs sans commune dans Wikidata sont complétés dans `scripts/import-clubs/overrides.ts`. À revoir chaque saison.
- **Club écarté** : le Servette RC (Genève), hors des départements français du modèle.

### Changer de saison

1. Mettre à jour `SEASON` dans `scripts/import-clubs/sources.ts` et vérifier que les sept pages existent.
2. Supprimer `.cache/import-clubs`, puis `pnpm clubs:import`.
3. Traiter les clubs ignorés que le script liste (ajouts dans `overrides.ts`).
4. `pnpm test`, puis `pnpm db:seed` pour mettre la base à jour.

## Divisions régionales

Aucune source ouverte ne donne leur composition. `src/data/catalog/clubs.regional.ts` contient une poignée de clubs saisis à la main : ils existent, mais leur division n'est pas vérifiée. Ils disparaissent d'eux-mêmes si l'import apporte un club de la même ville.

## FFR

Il n'existe pas d'API publique. Le portail `monclubhouse.ffr.fr` charge ses données depuis un serveur interne dont le `robots.txt` interdit tout accès automatisé : on ne l'aspire pas. La liste complète des clubs (environ 1 900) et les résultats officiels passent par une demande à la FFR ou aux ligues régionales.
