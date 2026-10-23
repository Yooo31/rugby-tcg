import { createTestPrisma } from "@/test/db";
import { createPostgresRateLimiter } from "./rate-limit";

const prisma = createTestPrisma();
afterAll(() => prisma.$disconnect());

describe("limite de débit en base", () => {
  it("compte par clé et par fenêtre, même en rafale", async () => {
    let now = Date.UTC(2026, 9, 23, 10, 0, 0);
    const limiter = createPostgresRateLimiter(prisma, {
      limit: 3,
      windowMs: 10_000,
      now: () => now,
      shouldPurge: () => false,
    });
    const key = `test:${Math.random()}`;
    const burst = await Promise.all(
      Array.from({ length: 5 }, () => limiter.take(key)),
    );
    expect(burst.filter(Boolean)).toHaveLength(3);
    expect(await limiter.take(`${key}:autre`)).toBe(true);

    now += 10_000;
    expect(await limiter.take(key)).toBe(true);
  });

  it("purge les fenêtres périmées", async () => {
    const key = `purge:${Math.random()}`;
    await prisma.rateLimit.create({
      data: { key, windowStart: new Date(Date.UTC(2020, 0, 1)) },
    });
    const limiter = createPostgresRateLimiter(prisma, {
      limit: 1,
      windowMs: 10_000,
      shouldPurge: () => true,
    });
    await limiter.take(`${key}:déclencheur`);
    expect(await prisma.rateLimit.count({ where: { key } })).toBe(0);
  });
});
