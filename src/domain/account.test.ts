import { inactiveSince, INACTIVE_ACCOUNT_YEARS, MINIMUM_AGE } from "./account";

describe("compte joueur", () => {
  it("supprime un compte après deux ans sans activité, dès 15 ans", () => {
    expect(INACTIVE_ACCOUNT_YEARS).toBe(2);
    expect(MINIMUM_AGE).toBe(15);
    expect(inactiveSince(new Date("2026-10-29T12:00:00Z")).toISOString()).toBe(
      "2024-10-29T12:00:00.000Z",
    );
  });
});
