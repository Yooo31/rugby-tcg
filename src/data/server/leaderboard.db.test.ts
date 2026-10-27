import { CLUB_CATALOG } from "@/data/catalog";
import { clubRegion } from "@/domain";
import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { createPrismaLeaderboard } from "./leaderboard";

const prisma = createTestPrisma();

const occitanie = CLUB_CATALOG.filter((club) => clubRegion(club) === "occ");
const elsewhere = CLUB_CATALOG.filter((club) => clubRegion(club) !== "occ");

/** Joueur avec pseudo, possédant les clubs donnés (en double pour l'un). */
async function playerWith(username: string | null, clubIds: string[]) {
  const id = await createAuthUser(prisma);
  await prisma.player.create({ data: { id, username } });
  await prisma.ownedCard.createMany({
    data: clubIds.map((clubId) => ({ playerId: id, clubId, rarity: "common" })),
  });
  if (clubIds[0])
    await prisma.ownedCard.create({
      data: { playerId: id, clubId: clubIds[0], rarity: "rare" },
    });
  return id;
}

beforeAll(async () => {
  await seedClubs(prisma);
  // Base partagée avec les autres fichiers : on repart d'un classement vide.
  await prisma.ownedCard.deleteMany();
});
afterAll(() => prisma.$disconnect());

describe("classement en base", () => {
  it("classe par clubs différents, ex æquo compris, et filtre par région", async () => {
    const ids = (clubs: typeof CLUB_CATALOG, count: number) =>
      clubs.slice(0, count).map((club) => club.id);

    const alice = await playerWith("Alice", ids(occitanie, 3));
    await playerWith("Bruno", [...ids(occitanie, 1), ...ids(elsewhere, 3)]);
    await playerWith("Chloé", ids(elsewhere, 3));
    await playerWith(null, ids(elsewhere, 10));

    const france = await createPrismaLeaderboard(prisma, alice).get(null);
    expect(france.entries.map((e) => [e.username, e.rank, e.clubs])).toEqual([
      ["Bruno", 1, 4],
      ["Alice", 2, 3],
      ["Chloé", 2, 3],
    ]);
    expect(france.me).toMatchObject({ username: "Alice", rank: 2, isMe: true });

    // Une carte d'une division masquée ne compte pas au classement.
    const hidden = await prisma.club.upsert({
      where: { id: "club-masque-test" },
      create: {
        id: "club-masque-test",
        name: "Club masqué",
        city: "Albi",
        department: "81",
        division: "regionale3",
        colorPrimary: "#000000",
        colorSecondary: "#ffffff",
        recentResults: [],
      },
      update: {},
    });
    await prisma.ownedCard.create({
      data: { playerId: alice, clubId: hidden.id, rarity: "common" },
    });
    expect(
      (await createPrismaLeaderboard(prisma, alice).get(null)).me?.clubs,
    ).toBe(3);

    // Les doublons ne comptent pas : 9 exemplaires d'un club restent 1 club.
    await prisma.ownedCard.updateMany({
      where: {
        playerId: alice,
        clubId: ids(occitanie, 1)[0],
        rarity: "common",
      },
      data: { count: 9 },
    });
    expect(
      (await createPrismaLeaderboard(prisma, alice).get(null)).me,
    ).toMatchObject({ rank: 2, clubs: 3 });

    const region = await createPrismaLeaderboard(prisma, alice).get("occ");
    expect(region.entries.map((e) => [e.username, e.clubs])).toEqual([
      ["Alice", 3],
      ["Bruno", 1],
    ]);
  });
});
