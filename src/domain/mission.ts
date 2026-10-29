import { z } from "zod";
import { createSeededRng, hashString } from "@/lib/rng";
import { rarityRank, type Rarity } from "./card";
import { getDivision, type Club } from "./club";
import type { PulledCard } from "./collection";
import {
  RewardNotClaimableError,
  type Reward,
  type RewardStatus,
} from "./reward";

/** Ce qu'une mission compte. Chaque ouverture de booster fait avancer les compteurs. */
export type MissionMetric =
  | { readonly type: "boosters-opened" }
  | { readonly type: "new-clubs" }
  | { readonly type: "min-rarity"; readonly rarity: Rarity }
  /** Clubs dont la division est comprise entre deux niveaux (1 = Top 14). */
  | {
      readonly type: "division-tier";
      readonly fromTier: number;
      readonly toTier: number;
    };

export interface Mission {
  readonly id: string;
  readonly title: string;
  readonly goal: number;
  readonly reward: Reward;
  readonly metric: MissionMetric;
}

const ingots = (amount: number): Reward => ({ ingots: amount, boosters: 0 });

/**
 * Toutes les missions possibles. Chacune doit rester atteignable en une journée
 * de boosters gratuits : pas de mission sur les divisions régionales tant que
 * le catalogue n'en contient qu'une poignée de clubs.
 */
export const MISSION_POOL: readonly Mission[] = [
  {
    id: "open-2",
    title: "Ouvrir 2 boosters",
    goal: 2,
    reward: ingots(30),
    metric: { type: "boosters-opened" },
  },
  {
    id: "open-3",
    title: "Ouvrir 3 boosters",
    goal: 3,
    reward: ingots(50),
    metric: { type: "boosters-opened" },
  },
  {
    id: "new-clubs-3",
    title: "Découvrir 3 nouveaux clubs",
    goal: 3,
    reward: ingots(40),
    metric: { type: "new-clubs" },
  },
  {
    id: "rare-1",
    title: "Obtenir une carte Rare ou mieux",
    goal: 1,
    reward: ingots(40),
    metric: { type: "min-rarity", rarity: "rare" },
  },
  {
    id: "pro-2",
    title: "Obtenir 2 clubs professionnels",
    goal: 2,
    reward: ingots(40),
    metric: { type: "division-tier", fromTier: 1, toTier: 2 },
  },
  {
    id: "federal-3",
    title: "Obtenir 3 clubs de Fédérale",
    goal: 3,
    reward: ingots(40),
    metric: { type: "division-tier", fromTier: 5, toTier: 7 },
  },
];

export const DAILY_MISSION_COUNT = 2;
/** Missions de plus chaque jour pour un VIP. */
export const VIP_MISSION_COUNT = 2;

/**
 * Missions du jour : les mêmes pour tous les joueurs, tirées du vivier à partir
 * de la date. Deux missions du même type ne sortent jamais ensemble.
 */
export function dailyMissions(
  day: string,
  pool: readonly Mission[] = MISSION_POOL,
): Mission[] {
  const rng = createSeededRng(hashString(day));
  const candidates = [...pool];
  const picked: Mission[] = [];
  while (picked.length < DAILY_MISSION_COUNT && candidates.length > 0) {
    const [mission] = candidates.splice(
      Math.floor(rng() * candidates.length),
      1,
    );
    if (!picked.some((other) => other.metric.type === mission.metric.type)) {
      picked.push(mission);
    }
  }
  return picked;
}

/**
 * Missions VIP du jour : deux de plus, les mêmes pour tous les VIP, tirées
 * du vivier parmi celles qui ne sont pas déjà des missions communes.
 */
export function vipMissions(
  day: string,
  pool: readonly Mission[] = MISSION_POOL,
): Mission[] {
  const daily = new Set(dailyMissions(day, pool).map(({ id }) => id));
  const rng = createSeededRng(hashString(`vip:${day}`));
  const candidates = pool.filter(({ id }) => !daily.has(id));
  const picked: Mission[] = [];
  while (picked.length < VIP_MISSION_COUNT && candidates.length > 0) {
    const [mission] = candidates.splice(
      Math.floor(rng() * candidates.length),
      1,
    );
    picked.push(mission);
  }
  return picked;
}

/** Missions du jour d'un joueur : les communes, plus celles des VIP. */
function missionsOf(day: string, isVip: boolean): Mission[] {
  return isVip
    ? [...dailyMissions(day), ...vipMissions(day)]
    : dailyMissions(day);
}

/** De combien une ouverture de booster fait avancer une mission. */
export function missionGain(
  metric: MissionMetric,
  cards: readonly PulledCard[],
  clubsById: ReadonlyMap<string, Club>,
): number {
  switch (metric.type) {
    case "boosters-opened":
      return 1;
    case "new-clubs":
      return cards.filter((card) => card.isNewClub).length;
    case "min-rarity":
      return cards.filter(
        (card) => rarityRank(card.rarity) >= rarityRank(metric.rarity),
      ).length;
    case "division-tier":
      return cards.filter((card) => {
        const club = clubsById.get(card.clubId);
        if (!club) return false;
        const { tier } = getDivision(club.division);
        return tier >= metric.fromTier && tier <= metric.toTier;
      }).length;
  }
}

/** Avancement du joueur sur les missions du jour `day`. */
export const missionLogSchema = z.object({
  day: z.string(),
  progress: z.record(z.string(), z.number().int().min(0)),
  claimed: z.array(z.string()),
});

export type MissionLog = z.infer<typeof missionLogSchema>;

/** Le journal ne vaut que pour son jour : passé minuit, on repart de zéro. */
export function missionLogFor(
  log: MissionLog | null,
  today: string,
): MissionLog {
  return log?.day === today ? log : { day: today, progress: {}, claimed: [] };
}

export function recordOpening(
  log: MissionLog,
  cards: readonly PulledCard[],
  clubsById: ReadonlyMap<string, Club>,
  isVip = false,
): MissionLog {
  const progress = { ...log.progress };
  for (const mission of missionsOf(log.day, isVip)) {
    const current = progress[mission.id] ?? 0;
    const gain = missionGain(mission.metric, cards, clubsById);
    progress[mission.id] = Math.min(mission.goal, current + gain);
  }
  return { ...log, progress };
}

/** Une mission du jour, vue par le joueur. */
export interface MissionProgress {
  readonly mission: Mission;
  readonly progress: number;
  readonly status: RewardStatus;
  /** Mission réservée aux VIP. */
  readonly isVip: boolean;
}

export function missionProgress(
  log: MissionLog,
  isVip = false,
): MissionProgress[] {
  const vipIds = new Set(isVip ? vipMissions(log.day).map(({ id }) => id) : []);
  return missionsOf(log.day, isVip).map((mission) => {
    const progress = log.progress[mission.id] ?? 0;
    return {
      mission,
      progress,
      status: missionStatus(mission, log),
      isVip: vipIds.has(mission.id),
    };
  });
}

function missionStatus(mission: Mission, log: MissionLog): RewardStatus {
  if (log.claimed.includes(mission.id)) return "claimed";
  return (log.progress[mission.id] ?? 0) >= mission.goal
    ? "claimable"
    : "locked";
}

interface MissionClaim {
  readonly log: MissionLog;
  readonly reward: Reward;
}

/** Marque une mission comme récupérée ; lève une erreur si elle n'est pas terminée ou déjà prise. */
export function claimMission(
  log: MissionLog,
  missionId: string,
  isVip = false,
): MissionClaim {
  const entry = missionProgress(log, isVip).find(
    ({ mission }) => mission.id === missionId,
  );
  if (entry?.status !== "claimable") throw new RewardNotClaimableError();
  return {
    log: { ...log, claimed: [...log.claimed, missionId] },
    reward: entry.mission.reward,
  };
}
