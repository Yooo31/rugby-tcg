import { z } from "zod";
import {
  buildPermanentAlbums,
  clubSchema,
  matchResultSchema,
  RECENT_RESULTS_WINDOW,
  type Album,
  type Club,
  type MatchResult,
} from "@/domain";
import { createSeededRng, hashString } from "@/lib/rng";
import { REGIONAL_CLUB_SEEDS, type ClubSeed } from "./clubs.regional";
import wikipediaImport from "./clubs.wikipedia.json";

/**
 * Catalogue des clubs du jeu :
 *   - du Top 14 à la Fédérale 3, l'import Wikipédia de la saison
 *     (`pnpm clubs:import`, fichier `clubs.wikipedia.json`) ;
 *   - les divisions régionales, saisies à la main et indicatives.
 *
 * C'est la source du mock comme du remplissage de la base (`pnpm db:seed`).
 */

// Le fichier importé porte quelques champs en plus (identifiant Wikidata…) :
// le schéma ne garde que ceux du domaine et rejette toute entrée invalide.
const importedClubs: Club[] = z.array(clubSchema).parse(wikipediaImport.clubs);

export const CATALOG_SEASON: string = wikipediaImport.season;

const RESULTS = matchResultSchema.options;

/** Résultats fictifs mais stables, pour les clubs dont on ne connaît pas le bilan. */
function placeholderResults(clubId: string): MatchResult[] {
  const rng = createSeededRng(hashString(clubId));
  return Array.from(
    { length: RECENT_RESULTS_WINDOW },
    () => RESULTS[Math.floor(rng() * RESULTS.length)],
  );
}

const townKey = (club: Pick<Club, "city" | "department">) =>
  `${club.department}:${club.city.toLowerCase()}`;

const importedTowns = new Set(importedClubs.map(townKey));

const regionalClubs: Club[] = Object.entries(REGIONAL_CLUB_SEEDS).flatMap(
  ([division, seeds]) =>
    seeds
      .map(([id, name, city, department, primary, secondary]: ClubSeed) =>
        clubSchema.parse({
          id,
          name,
          city,
          department,
          division,
          category: "senior-men",
          colors: { primary, secondary },
          recentResults: placeholderResults(id),
        }),
      )
      // La ville a déjà son club dans l'import : la saisie indicative s'efface.
      .filter((club) => !importedTowns.has(townKey(club))),
);

export const CLUB_CATALOG: readonly Club[] = [
  ...importedClubs,
  ...regionalClubs,
];

/** Albums permanents du catalogue : des règles, calculées une fois pour toutes. */
export const CATALOG_ALBUMS: readonly Album[] =
  buildPermanentAlbums(CLUB_CATALOG);
