import { makeClub } from "@/test/fixtures";
import type { PulledCard } from "./collection";
import {
  claimMission,
  DAILY_MISSION_COUNT,
  dailyMissions,
  vipMissions,
  VIP_MISSION_COUNT,
  missionGain,
  missionLogFor,
  missionProgress,
  recordOpening,
  type Mission,
  type MissionLog,
} from "./mission";
import { RewardNotClaimableError } from "./reward";

const clubs = [
  makeClub({ id: "toulouse", division: "top14" }),
  makeClub({ id: "castanet", division: "federale1" }),
  makeClub({ id: "cugnaux", division: "regionale3" }),
];
const clubsById = new Map(clubs.map((club) => [club.id, club]));

const pulled = (
  clubId: string,
  overrides: Partial<PulledCard> = {},
): PulledCard => ({
  clubId,
  rarity: "common",
  isNewClub: false,
  isNewCard: false,
  ...overrides,
});

const cards = [
  pulled("toulouse", { rarity: "epic", isNewClub: true }),
  pulled("castanet", { isNewClub: true }),
  pulled("cugnaux", { rarity: "rare" }),
  pulled("fantome"),
];

/** Un jour dont on connaît les missions, pour écrire des attentes lisibles. */
const day = "2026-10-13";
const [first] = dailyMissions(day);
const logWith = (progress: number, claimed: string[] = []): MissionLog => ({
  day,
  progress: { [first.id]: progress },
  claimed,
});

describe("vipMissions", () => {
  it("ajoute deux missions du jour, toujours les mêmes, jamais une commune", () => {
    for (let dayOfMonth = 1; dayOfMonth <= 28; dayOfMonth += 1) {
      const date = `2026-11-${String(dayOfMonth).padStart(2, "0")}`;
      const daily = new Set(dailyMissions(date).map(({ id }) => id));
      const vip = vipMissions(date);
      expect(vip).toHaveLength(VIP_MISSION_COUNT);
      expect(vip).toEqual(vipMissions(date));
      expect(vip.some(({ id }) => daily.has(id))).toBe(false);
    }
  });

  it("fait avancer et récupérer une mission VIP, seulement pour un VIP", () => {
    const [mission] = vipMissions(day);
    const log = { day, progress: { [mission.id]: mission.goal }, claimed: [] };
    expect(missionProgress(log).some(({ isVip }) => isVip)).toBe(false);
    expect(
      missionProgress(log, true).find(
        (entry) => entry.mission.id === mission.id,
      ),
    ).toMatchObject({ isVip: true, status: "claimable" });
    expect(() => claimMission(log, mission.id)).toThrow(
      RewardNotClaimableError,
    );
    expect(claimMission(log, mission.id, true).reward).toEqual(mission.reward);
  });
});

describe("dailyMissions", () => {
  it("propose toujours les mêmes missions pour un jour donné", () => {
    expect(dailyMissions(day)).toEqual(dailyMissions(day));
    expect(dailyMissions(day)).toHaveLength(DAILY_MISSION_COUNT);
  });

  it("ne propose jamais deux missions du même type", () => {
    for (let dayOfMonth = 1; dayOfMonth <= 28; dayOfMonth += 1) {
      const types = dailyMissions(`2026-11-${dayOfMonth}`).map(
        (mission) => mission.metric.type,
      );
      expect(new Set(types).size).toBe(DAILY_MISSION_COUNT);
    }
  });

  it("varie d'un jour à l'autre", () => {
    const signatures = new Set(
      Array.from({ length: 14 }, (_, index) =>
        dailyMissions(`2026-12-${index + 1}`)
          .map((mission) => mission.id)
          .join(),
      ),
    );
    expect(signatures.size).toBeGreaterThan(1);
  });

  it("s'arrête quand le vivier ne permet plus de varier les types", () => {
    const pool: Mission[] = [
      {
        id: "a",
        title: "A",
        goal: 1,
        reward: { ingots: 1, boosters: 0 },
        metric: { type: "new-clubs" },
      },
      {
        id: "b",
        title: "B",
        goal: 2,
        reward: { ingots: 1, boosters: 0 },
        metric: { type: "new-clubs" },
      },
    ];
    expect(dailyMissions(day, pool)).toHaveLength(1);
  });
});

describe("missionGain", () => {
  it("compte une ouverture, quelles que soient les cartes", () => {
    expect(missionGain({ type: "boosters-opened" }, cards, clubsById)).toBe(1);
  });

  it("compte les nouveaux clubs", () => {
    expect(missionGain({ type: "new-clubs" }, cards, clubsById)).toBe(2);
  });

  it("compte les cartes d'une rareté au moins égale", () => {
    expect(
      missionGain({ type: "min-rarity", rarity: "rare" }, cards, clubsById),
    ).toBe(2);
    expect(
      missionGain(
        { type: "min-rarity", rarity: "legendary" },
        cards,
        clubsById,
      ),
    ).toBe(0);
  });

  it("compte les clubs d'une tranche de divisions et ignore les clubs inconnus", () => {
    expect(
      missionGain(
        { type: "division-tier", fromTier: 1, toTier: 2 },
        cards,
        clubsById,
      ),
    ).toBe(1);
    expect(
      missionGain(
        { type: "division-tier", fromTier: 5, toTier: 10 },
        cards,
        clubsById,
      ),
    ).toBe(2);
  });
});

describe("journal des missions", () => {
  it("repart de zéro un nouveau jour et garde celui du jour", () => {
    const log = logWith(1);
    expect(missionLogFor(log, day)).toBe(log);
    expect(missionLogFor(log, "2026-10-14")).toEqual({
      day: "2026-10-14",
      progress: {},
      claimed: [],
    });
    expect(missionLogFor(null, day)).toEqual({
      day,
      progress: {},
      claimed: [],
    });
  });

  it("fait avancer les missions du jour sans dépasser l'objectif", () => {
    let log = missionLogFor(null, day);
    for (let opening = 0; opening < 10; opening += 1)
      log = recordOpening(log, cards, clubsById);

    for (const { mission, progress, status } of missionProgress(log)) {
      expect(progress).toBeLessThanOrEqual(mission.goal);
      if (mission.metric.type === "boosters-opened")
        expect(status).toBe("claimable");
    }
  });

  it("passe de verrouillée à récupérable puis récupérée", () => {
    const statusOf = (log: MissionLog) => missionProgress(log)[0].status;
    expect(statusOf(logWith(first.goal - 1))).toBe("locked");
    expect(statusOf(logWith(first.goal))).toBe("claimable");
    expect(statusOf(logWith(first.goal, [first.id]))).toBe("claimed");
  });
});

describe("claimMission", () => {
  it("donne la récompense et marque la mission", () => {
    const { log, reward } = claimMission(logWith(first.goal), first.id);
    expect(reward).toEqual(first.reward);
    expect(log.claimed).toEqual([first.id]);
  });

  it("refuse une mission inachevée, déjà récupérée ou inconnue", () => {
    expect(() => claimMission(logWith(first.goal - 1), first.id)).toThrow(
      RewardNotClaimableError,
    );
    expect(() =>
      claimMission(logWith(first.goal, [first.id]), first.id),
    ).toThrow(RewardNotClaimableError);
    expect(() => claimMission(logWith(first.goal), "inconnue")).toThrow(
      RewardNotClaimableError,
    );
  });
});
