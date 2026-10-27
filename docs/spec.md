# Rugby TCG — cahier des charges

**Concept.** Un jeu de cartes à collectionner numérique, inspiré du TCG Wikipédia, consacré aux clubs de rugby français, du Top 14 aux divisions régionales (aujourd'hui jusqu'à la Fédérale 3 : les régionales sont masquées en attendant une source officielle).

**Objectif.** Un jeu gratuit, addictif et communautaire, avec une monétisation progressive.

**Technologie.** Next.js et TypeScript, PostgreSQL (Supabase), application web optimisée pour mobile (PWA), installable sur l'écran d'accueil.

## 1. Les cartes et les clubs

Chaque club de rugby français possède une carte de base, avec :

- nom et logo du club ;
- ville et département ;
- région ;
- division actuelle ;
- score de puissance ;
- statistiques et résultats récents.

Toutes les divisions du rugby français sont prévues. Les Régionales 1 à 3 sont masquées tant que leurs données ne viennent pas d'une source officielle.

### Raretés

| Rareté     | Apparence           |
| ---------- | ------------------- |
| Commune    | Carte classique     |
| Rare       | Bordure brillante   |
| Épique     | Effet holographique |
| Légendaire | Animation spéciale  |

**La puissance et la rareté sont indépendantes.** Un club de Fédérale 3 peut avoir une carte légendaire, même si sa puissance reste inférieure à celle d'un club de Top 14. La puissance évolue selon les résultats sportifs ; la rareté d'une carte reste fixe.

Les données sportives seraient récupérées via l'API FFR Compétitions, sous réserve de vérifier les accès et les droits d'utilisation.

## 2. Les boosters

- Une réserve de 3 boosters gratuits, qui en regagne 1 toutes les 4 heures (6 par jour au plus).
- 5 cartes par booster.
- Des boosters supplémentaires achetables.
- Des boosters spéciaux pendant les événements.
- Des probabilités différentes selon les raretés.

Les doublons pourront servir à améliorer l'apparence des cartes ou être proposés sur le marché.

## 3. Les collections

Plusieurs albums à compléter. Une carte peut appartenir à plusieurs collections à la fois.

**Permanentes.** Tous les clubs d'un département (Haute-Garonne…), d'une région (Occitanie…), d'une division (Fédérale 3, Fédérale 1, Top 14…), tous les clubs de France.

**Saisonnières.** Top 14 — Saison 2026-2027, clubs promus en Fédérale 1, champions régionaux, clubs qualifiés pour les phases finales. Renouvelées chaque saison ; les joueurs gardent leurs anciennes cartes.

**Événementielles.** Quelques jours ou semaines : Champion de France, Derby de Haute-Garonne, Finales du Top 14, Clubs historiques. Peuvent proposer boosters spéciaux, missions et cartes collector.

**Récompenses.** Terminer une collection rapporte des boosters, des lingots, des éléments cosmétiques ou des cartes spéciales.

## V1 — Lancement gratuit

Objectif : vérifier que les passionnés de rugby aiment collectionner les clubs.

- Inscription et connexion
- Importation des clubs français
- Cartes et raretés
- Ouverture de boosters gratuits
- Collection personnelle
- Albums par département, région et division
- Missions quotidiennes
- Classements
- Administration

## Décisions prises

- Première étape : socle et boucle jouable sur données fictives ; Supabase ensuite.
- Divisions seniors masculines pour commencer (Top 14, Pro D2, Nationale, Nationale 2, Fédérale 1 à 3) ; le modèle prévoit féminines et jeunes. Les Régionales 1 à 3 sont prévues mais masquées tant qu'il n'y a pas de source officielle.
- Direction visuelle « Stade de nuit » (`docs/design-system.md`).
- Probabilités de départ : Commune 70 %, Rare 22 %, Épique 7 %, Légendaire 1 %.
- Blasons générés à la place des logos officiels, faute de droits.
- Lingots : monnaie gagnée en jouant (missions, albums), échangée contre des boosters : 1 pour 100 lingots, 10 pour 900. Aucun paiement réel.
- Missions : 3 par jour, identiques pour tous les joueurs, remises à zéro à minuit.
- Récompense d'album : 5 lingots par club (20 au minimum), plus un booster à partir de 10 clubs.
- Boosters gratuits : une réserve de 3 au maximum, qui regagne 1 booster toutes les 4 heures, avec un chrono jusqu'au prochain : 6 boosters gratuits par jour au plus. L'offre premium (hors V1) portera la réserve à 5.
- Clubs : il n'existe pas d'API publique de la FFR. Du Top 14 à la Fédérale 3, les clubs de la saison viennent de Wikipédia et Wikidata (`docs/data-sources.md`) ; les divisions régionales attendent une source officielle.
