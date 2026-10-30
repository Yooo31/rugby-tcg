import {
  BOOSTER_REFILL_MS,
  MAX_FREE_BOOSTERS,
  VIP_MAX_FREE_BOOSTERS,
} from "@/domain";
import { notificationStateOf, notifiedFields } from "./notification-state";

const since = new Date("2026-10-23T06:00:00Z");
const now = new Date("2026-10-23T18:00:00Z");
const row = {
  reserveCount: 1,
  reserveSince: since,
  bonusBoosters: 2,
  streakCount: 4,
  streakLastDay: "2026-10-22",
  notifiedBoosterAt: null,
  notifiedEveningDay: null,
  notifiedStreakDay: null,
  vipMemberships: [],
};

describe("état de notification d'un joueur", () => {
  it("traduit la ligne de la base", () => {
    expect(notificationStateOf(row, now)).toEqual({
      reserve: { count: 1, since: since.getTime() },
      maxFreeBoosters: MAX_FREE_BOOSTERS,
      bonusBoosters: 2,
      streak: { count: 4, lastDay: "2026-10-22" },
      notifiedBoosterAt: null,
      notifiedEveningDay: null,
      notifiedStreakDay: null,
    });
    expect(
      notificationStateOf(
        { ...row, reserveCount: null, reserveSince: null },
        now,
      ).reserve,
    ).toBeNull();
  });

  it("agrandit la réserve d'un VIP", () => {
    const vip = {
      ...row,
      vipMemberships: [
        {
          startsAt: new Date(now.getTime() - BOOSTER_REFILL_MS),
          endsAt: new Date(now.getTime() + BOOSTER_REFILL_MS),
        },
      ],
    };
    expect(notificationStateOf(vip, now).maxFreeBoosters).toBe(
      VIP_MAX_FREE_BOOSTERS,
    );
  });

  it("note le dernier booster annoncé et les jours des rappels", () => {
    const state = notificationStateOf(row, now);
    // Réserve de 1 à 6 h UTC : pleine (3) à 14 h UTC, deux boosters regagnés.
    const lastRefill = new Date(since.getTime() + 2 * BOOSTER_REFILL_MS);
    expect(
      notifiedFields(["booster-ready", "streak-reminder"], state, now),
    ).toEqual({
      notifiedBoosterAt: lastRefill,
      notifiedStreakDay: "2026-10-23",
    });
    expect(notifiedFields(["evening-boosters"], state, now)).toEqual({
      notifiedBoosterAt: lastRefill,
      notifiedEveningDay: "2026-10-23",
    });
    expect(notifiedFields([], state, now)).toEqual({});
  });

  it("ne fait jamais reculer le dernier booster annoncé", () => {
    const later = new Date(now.getTime() + BOOSTER_REFILL_MS);
    const state = notificationStateOf(
      { ...row, notifiedBoosterAt: later },
      now,
    );
    expect(notifiedFields(["evening-boosters"], state, now)).toEqual({
      notifiedEveningDay: "2026-10-23",
    });
  });
});
