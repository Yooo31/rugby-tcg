import { createRateLimiter } from "./rate-limit";

describe("limiteur de débit", () => {
  it("accepte jusqu'à la limite, puis refuse jusqu'à la fin de la fenêtre", async () => {
    let now = 0;
    const limiter = createRateLimiter({
      limit: 2,
      windowMs: 1000,
      now: () => now,
    });
    expect(await limiter.take("a")).toBe(true);
    expect(await limiter.take("a")).toBe(true);
    expect(await limiter.take("a")).toBe(false);
    expect(await limiter.take("b")).toBe(true);

    now = 999;
    expect(await limiter.take("a")).toBe(false);
    now = 1000;
    expect(await limiter.take("a")).toBe(true);
  });

  it("purge les clés expirées quand elles deviennent trop nombreuses", async () => {
    let now = 0;
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 10,
      now: () => now,
    });
    for (let index = 0; index <= 10_001; index += 1)
      await limiter.take(`k${index}`);
    now = 100;
    expect(await limiter.take("k0")).toBe(true);
  });
});
