import type { Club, CrestPattern, CrestShape, CrestSymbol } from "@/domain";
import { CLUB_PALETTE, type ClubColorName } from "../palette";
import { ELITE_IDENTITIES } from "./elite";
import { FEDERALE_1_IDENTITIES } from "./federale1";
import { FEDERALE_2_IDENTITIES } from "./federale2";
import { FEDERALE_3_IDENTITIES } from "./federale3";
import { NATIONALE_2_IDENTITIES } from "./nationale2";

/**
 * Identité de chaque club, **relue à la main**, club par club : couleurs du
 * maillot (la dominante d'abord), sigle et blason. Pour un joueur, son club
 * c'est toute sa vie : rien ici n'est deviné. Chaque fiche dit d'où viennent
 * ses informations (FFR, Wikipédia, site ou réseaux du club).
 *
 * Le blason **évoque** le club (couleurs, sigle, symbole du lieu) sans jamais
 * reprendre son logo, marque protégée tant que les droits ne sont pas acquis.
 */
export interface ClubIdentity {
  /** Une à trois couleurs, la dominante d'abord (champ, motif, liseré). */
  readonly colors:
    | readonly [ClubColorName]
    | readonly [ClubColorName, ClubColorName]
    | readonly [ClubColorName, ClubColorName, ClubColorName];
  /** Sigle officiel ou usuel, jusqu'à quatre signes. */
  readonly initials: string;
  readonly crest?: {
    readonly shape?: CrestShape;
    readonly pattern?: CrestPattern;
    readonly symbol?: CrestSymbol;
  };
  /** D'où viennent couleurs et sigle. */
  readonly source: string;
  /** Commune corrigée, quand Wikidata se trompe de lieu. */
  readonly place?: Pick<Club, "city" | "department">;
  /**
   * Ce qui reste à faire confirmer par quelqu'un qui connaît le club (une
   * seule couleur connue, ordre incertain…). Repris dans la planche de revue.
   */
  readonly toConfirm?: string;
}

export const CLUB_IDENTITIES: Readonly<Record<string, ClubIdentity>> = {
  ...ELITE_IDENTITIES,
  ...NATIONALE_2_IDENTITIES,
  ...FEDERALE_1_IDENTITIES,
  ...FEDERALE_2_IDENTITIES,
  ...FEDERALE_3_IDENTITIES,
};

/** Une couleur seule reçoit du blanc en seconde (du noir si elle est blanche). */
function identityColors(colors: ClubIdentity["colors"]): Club["colors"] {
  const [primary, secondary, tertiary] = colors;
  return {
    primary: CLUB_PALETTE[primary],
    secondary:
      CLUB_PALETTE[secondary ?? (primary === "blanc" ? "noir" : "blanc")],
    ...(tertiary ? { tertiary: CLUB_PALETTE[tertiary] } : {}),
  };
}

/** Applique l'identité relue par-dessus le club importé. */
export function withIdentity(club: Club): Club {
  const identity = CLUB_IDENTITIES[club.id];
  if (!identity) return club;
  return {
    ...club,
    colors: identityColors(identity.colors),
    initials: identity.initials,
    ...(identity.place ?? {}),
    ...(identity.crest ? { crest: identity.crest } : {}),
  };
}
