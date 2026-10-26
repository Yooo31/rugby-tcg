import { BOOSTER_REFILL_MS, MAX_FREE_BOOSTERS } from "@/domain";
import { notificationStateOf, notifiedFields } from "./notification-state";

const since = new Date("2026-10-23T06:00:00Z");
const row = {
  reserveCount: 1,
  reserveSince: since,
  streakCount: 4,
  streakLastDay: "2026-10-22",
  notifiedFullAt: null,
  notifiedStreakDay: null,
};

describe("état de notification d'un joueur", () => {
  it("traduit la ligne de la base", () => {
    expect(notificationStateOf(row)).toEqual({
      reserve: { count: 1, since: since.getTime() },
      maxFreeBoosters: MAX_FREE_BOOSTERS,
      streak: { count: 4, lastDay: "2026-10-22" },
      notifiedFullAt: null,
      notifiedStreakDay: null,
    });
    expect(
      notificationStateOf({ ...row, reserveCount: null, reserveSince: null })
        .reserve,
    ).toBeNull();
  });

  it("note l'heure du remplissage et le jour du rappel envoyés", () => {
    const state = notificationStateOf(row);
    const now = new Date("2026-10-23T18:00:00Z");
    expect(
      notifiedFields(["reserve-full", "streak-reminder"], state, now),
    ).toEqual({
      notifiedFullAt: new Date(since.getTime() + 2 * BOOSTER_REFILL_MS),
      notifiedStreakDay: "2026-10-23",
    });
    expect(notifiedFields([], state, now)).toEqual({});
  });
});
