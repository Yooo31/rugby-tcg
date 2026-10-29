import { z } from "zod";
import { InsufficientIngotsError, type Wallet } from "./wallet";

/**
 * Cosmétiques : de quoi se distinguer sans rien changer au jeu (voir
 * docs/economie.md, section 3.3). Ils ne touchent ni à la rareté, ni à la
 * puissance, ni au tirage. Aucun n'imite un logo de club ou de la FFR : ce
 * sont des ambiances de rugby (pelouse, craie, cuir, projecteurs).
 */

/** Sortes de cosmétiques, et ce qu'elles habillent. */
export const COSMETIC_KINDS = [
  /** Dos de carte, vu à la révélation des boosters. */
  "card-back",
  /** Cadre de carte : un liseré intérieur, la couleur de rareté reste intacte. */
  "card-frame",
  /** Fond et en-tête des pages d'album. */
  "album-theme",
] as const;

export type CosmeticKind = (typeof COSMETIC_KINDS)[number];

/** Façon de gagner un cosmétique sans le payer. */
export type CosmeticUnlock =
  /** Série de connexion d'au moins `days` jours. */
  | { readonly type: "streak"; readonly days: number }
  /** Au moins `count` récompenses d'album récupérées (album terminé). */
  | { readonly type: "albums"; readonly count: number };

interface CosmeticDefinition {
  readonly id: string;
  readonly kind: CosmeticKind;
  readonly name: string;
  readonly description: string;
  /** Prix en lingots ; 0 pour le cosmétique de départ. */
  readonly ingots: number;
  /** Condition pour le gagner gratuitement ; `null` s'il ne se gagne pas. */
  readonly unlock: CosmeticUnlock | null;
}

/** Série de connexion qui offre le dos « Tableau noir ». */
const STREAK_DAYS_FOR_CHALK_BACK = 30;
/** Albums terminés (récompense récupérée) qui offrent le cadre « Ligne de touche ». */
const ALBUMS_FOR_TOUCHLINE_FRAME = 1;

/** Prix en lingots : les cosmétiques ne se vendent qu'en lingots. */
const BACK_SMALL_INGOTS = 150;
const BACK_MEDIUM_INGOTS = 200;
const BACK_LARGE_INGOTS = 250;
const FRAME_INGOTS = 250;
const THEME_INGOTS = 250;

export const COSMETICS = [
  // ——— Dos de carte ———
  {
    id: "back-pitch",
    kind: "card-back",
    name: "Pelouse",
    description: "Le dos d'origine : la pelouse tondue sous les projecteurs.",
    ingots: 0,
    unlock: null,
  },
  {
    id: "back-night",
    kind: "card-back",
    name: "Nuit au stade",
    description: "Bleu nuit et halo des projecteurs, un soir de phase finale.",
    ingots: BACK_SMALL_INGOTS,
    unlock: null,
  },
  {
    id: "back-chalk",
    kind: "card-back",
    name: "Tableau noir",
    description: "Les flèches de la combinaison, tracées à la craie.",
    ingots: BACK_MEDIUM_INGOTS,
    unlock: { type: "streak", days: STREAK_DAYS_FOR_CHALK_BACK },
  },
  {
    id: "back-leather",
    kind: "card-back",
    name: "Ballon de cuir",
    description: "Le cuir patiné et les coutures des ballons d'antan.",
    ingots: BACK_LARGE_INGOTS,
    unlock: null,
  },
  // ——— Cadres de carte ———
  {
    id: "frame-plain",
    kind: "card-frame",
    name: "Sobre",
    description: "Le cadre d'origine, sans liseré.",
    ingots: 0,
    unlock: null,
  },
  {
    id: "frame-touchline",
    kind: "card-frame",
    name: "Ligne de touche",
    description: "Un trait de craie blanche tout autour de la carte.",
    ingots: FRAME_INGOTS,
    unlock: { type: "albums", count: ALBUMS_FOR_TOUCHLINE_FRAME },
  },
  {
    id: "frame-stitch",
    kind: "card-frame",
    name: "Couture",
    description: "Le point sellier d'un ballon de cuir.",
    ingots: FRAME_INGOTS,
    unlock: null,
  },
  {
    id: "frame-in-goal",
    kind: "card-frame",
    name: "En-but",
    description: "La double ligne de l'en-but, là où l'on marque.",
    ingots: FRAME_INGOTS,
    unlock: null,
  },
  // ——— Thèmes d'album ———
  {
    id: "theme-night",
    kind: "album-theme",
    name: "Stade de nuit",
    description: "Le thème d'origine.",
    ingots: 0,
    unlock: null,
  },
  {
    id: "theme-pitch",
    kind: "album-theme",
    name: "Pelouse",
    description: "Les bandes de tonte d'une pelouse fraîchement coupée.",
    ingots: THEME_INGOTS,
    unlock: null,
  },
  {
    id: "theme-chalk",
    kind: "album-theme",
    name: "Vestiaire",
    description: "Le tableau noir du vestiaire, avant d'entrer sur le terrain.",
    ingots: THEME_INGOTS,
    unlock: null,
  },
  {
    id: "theme-sunset",
    kind: "album-theme",
    name: "Fin de match",
    description: "La lumière dorée d'un dimanche, au coup de sifflet final.",
    ingots: THEME_INGOTS,
    unlock: null,
  },
] as const satisfies readonly CosmeticDefinition[];

export type Cosmetic = (typeof COSMETICS)[number];
export type CosmeticId = Cosmetic["id"];

/** Identifiants des cosmétiques d'une sorte. */
export type CosmeticIdOf<K extends CosmeticKind> = Extract<
  Cosmetic,
  { kind: K }
>["id"];

export const cosmeticIdSchema = z.enum(
  COSMETICS.map(({ id }) => id) as [CosmeticId, ...CosmeticId[]],
);

/** Cosmétique de départ de chaque sorte : toujours possédé, équipé par défaut. */
export const DEFAULT_COSMETICS = {
  "card-back": "back-pitch",
  "card-frame": "frame-plain",
  "album-theme": "theme-night",
} as const satisfies { readonly [K in CosmeticKind]: CosmeticIdOf<K> };

/** Cosmétique équipé de chaque sorte. */
export type EquippedCosmetics = {
  readonly [K in CosmeticKind]: CosmeticIdOf<K>;
};

export const DEFAULT_EQUIPPED: EquippedCosmetics = DEFAULT_COSMETICS;

const DEFAULT_IDS: ReadonlySet<CosmeticId> = new Set(
  Object.values(DEFAULT_COSMETICS),
);

function isDefaultCosmetic(id: CosmeticId): boolean {
  return DEFAULT_IDS.has(id);
}

export function getCosmetic(id: CosmeticId): Cosmetic {
  const cosmetic = COSMETICS.find((candidate) => candidate.id === id);
  if (!cosmetic) throw new Error(`Cosmétique inconnu : ${id}`);
  return cosmetic;
}

export function cosmeticsOfKind<K extends CosmeticKind>(
  kind: K,
): readonly Extract<Cosmetic, { kind: K }>[] {
  return COSMETICS.filter(
    (cosmetic): cosmetic is Extract<Cosmetic, { kind: K }> =>
      cosmetic.kind === kind,
  );
}

/** Ce que le joueur a accompli, pour les cosmétiques à gagner. */
export interface CosmeticAchievements {
  /** Jours de la série de connexion en cours. */
  readonly streakDays: number;
  /** Albums dont la récompense a été récupérée. */
  readonly completedAlbums: number;
}

function isUnlocked(
  unlock: CosmeticUnlock,
  achievements: CosmeticAchievements,
): boolean {
  switch (unlock.type) {
    case "streak":
      return achievements.streakDays >= unlock.days;
    case "albums":
      return achievements.completedAlbums >= unlock.count;
  }
}

/** Cosmétiques gagnés par ce que le joueur a accompli. */
export function earnedCosmetics(
  achievements: CosmeticAchievements,
): readonly CosmeticId[] {
  return COSMETICS.filter(
    ({ unlock }) => unlock !== null && isUnlocked(unlock, achievements),
  ).map(({ id }) => id);
}

/**
 * Ajoute à la liste des cosmétiques possédés ceux qui viennent d'être gagnés.
 * Une fois gagné, un cosmétique reste acquis, même si la série retombe.
 */
export function withEarnedCosmetics(
  owned: readonly CosmeticId[],
  achievements: CosmeticAchievements,
): readonly CosmeticId[] {
  const known = new Set(owned);
  const added = earnedCosmetics(achievements).filter((id) => !known.has(id));
  return added.length > 0 ? [...owned, ...added] : owned;
}

/** Cosmétiques possédés, ceux de départ compris, dans l'ordre du catalogue. */
export function ownedCosmeticIds(
  owned: readonly CosmeticId[],
): readonly CosmeticId[] {
  const known = new Set(owned);
  return COSMETICS.filter(
    ({ id }) => isDefaultCosmetic(id) || known.has(id),
  ).map(({ id }) => id);
}

function ownsCosmetic(owned: readonly CosmeticId[], id: CosmeticId): boolean {
  return isDefaultCosmetic(id) || owned.includes(id);
}

/** Cosmétique déjà possédé (à l'achat) ou pas encore (à l'équipement). */
export class CosmeticUnavailableError extends Error {
  constructor() {
    super("Ce cosmétique n'est pas disponible.");
    this.name = "CosmeticUnavailableError";
  }
}

/** Achète un cosmétique en lingots ; refusé s'il est déjà possédé. */
export function buyCosmetic(
  wallet: Wallet,
  owned: readonly CosmeticId[],
  id: CosmeticId,
): { readonly wallet: Wallet; readonly owned: readonly CosmeticId[] } {
  if (ownsCosmetic(owned, id)) throw new CosmeticUnavailableError();
  const { ingots } = getCosmetic(id);
  if (wallet.ingots < ingots) throw new InsufficientIngotsError();
  return {
    wallet: { ...wallet, ingots: wallet.ingots - ingots },
    owned: [...owned, id],
  };
}

/** Équipe un cosmétique possédé à la place de celui de sa sorte. */
export function equipCosmetic(
  equipped: EquippedCosmetics,
  owned: readonly CosmeticId[],
  id: CosmeticId,
): EquippedCosmetics {
  if (!ownsCosmetic(owned, id)) throw new CosmeticUnavailableError();
  return { ...equipped, [getCosmetic(id).kind]: id };
}

/**
 * Équipement lu d'un stockage : un identifiant inconnu (cosmétique retiré du
 * catalogue) ou d'une autre sorte revient au cosmétique de départ.
 */
export function parseEquipped(stored: {
  readonly [K in CosmeticKind]?: string | null;
}): EquippedCosmetics {
  const pick = <K extends CosmeticKind>(kind: K): CosmeticIdOf<K> => {
    const match = COSMETICS.find(
      (cosmetic) => cosmetic.id === stored[kind] && cosmetic.kind === kind,
    );
    return (match?.id ?? DEFAULT_COSMETICS[kind]) as CosmeticIdOf<K>;
  };
  return {
    "card-back": pick("card-back"),
    "card-frame": pick("card-frame"),
    "album-theme": pick("album-theme"),
  };
}

/** Cosmétiques possédés lus d'un stockage : les identifiants inconnus sont ignorés. */
export function parseOwnedCosmetics(
  stored: readonly string[],
): readonly CosmeticId[] {
  return stored.flatMap((id) => {
    const parsed = cosmeticIdSchema.safeParse(id);
    return parsed.success && !isDefaultCosmetic(parsed.data)
      ? [parsed.data]
      : [];
  });
}

/** État des cosmétiques du joueur, tel que l'interface le voit. */
export interface CosmeticState {
  /** Cosmétiques possédés, ceux de départ compris. */
  readonly owned: readonly CosmeticId[];
  readonly equipped: EquippedCosmetics;
}
