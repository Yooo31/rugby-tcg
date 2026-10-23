import { MAX_REWARDED_REFERRALS } from "@/domain";
import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { ensurePlayerRow } from "./prisma-store";
import {
  applyReferral,
  getOrCreateReferralCode,
  referralSummary,
  settleReferral,
} from "./referral";

const prisma = createTestPrisma();
beforeAll(() => seedClubs(prisma));
afterAll(() => prisma.$disconnect());

async function newPlayer() {
  const id = await createAuthUser(prisma);
  await ensurePlayerRow(prisma, id);
  return id;
}

/** Ouvertures factices, une par jour donné (heure de Paris, midi). */
async function playOn(playerId: string, days: string[]) {
  await prisma.boosterOpening.createMany({
    data: days.map((day) => ({
      playerId,
      source: "free",
      cards: [],
      openedAt: new Date(`${day}T10:00:00Z`),
    })),
  });
}

const bonus = async (id: string) =>
  (await prisma.player.findUniqueOrThrow({ where: { id } })).bonusBoosters;

describe("parrainage en base", () => {
  it("crée un code stable et rattache le filleul avec son booster de bienvenue", async () => {
    const referrer = await newPlayer();
    const code = await getOrCreateReferralCode(prisma, referrer);
    expect(await getOrCreateReferralCode(prisma, referrer)).toBe(code);

    const referee = await newPlayer();
    await applyReferral(prisma, referee, code);
    await applyReferral(prisma, referee, code);
    expect(await bonus(referee)).toBe(1);
    await applyReferral(prisma, referrer, code);
    expect(await bonus(referrer)).toBe(0);
  });

  it("paie le parrain une seule fois, au troisième jour actif, même en rafale", async () => {
    const referrer = await newPlayer();
    const referee = await newPlayer();
    await applyReferral(
      prisma,
      referee,
      await getOrCreateReferralCode(prisma, referrer),
    );

    await playOn(referee, ["2026-10-20", "2026-10-21"]);
    await settleReferral(prisma, referee);
    expect(await bonus(referrer)).toBe(0);

    await playOn(referee, ["2026-10-22"]);
    await Promise.all([
      settleReferral(prisma, referee),
      settleReferral(prisma, referee),
    ]);
    expect(await bonus(referrer)).toBe(2);
    expect(await referralSummary(prisma, referrer)).toMatchObject({
      referred: 1,
      active: 1,
    });
  });

  it("ne paie plus au-delà du plafond de filleuls", async () => {
    const referrer = await newPlayer();
    const code = await getOrCreateReferralCode(prisma, referrer);
    for (let index = 0; index <= MAX_REWARDED_REFERRALS; index += 1) {
      const referee = await newPlayer();
      await applyReferral(prisma, referee, code);
      await playOn(referee, ["2026-10-20", "2026-10-21", "2026-10-22"]);
      await settleReferral(prisma, referee);
    }
    expect(await bonus(referrer)).toBe(2 * MAX_REWARDED_REFERRALS);
  });
});
