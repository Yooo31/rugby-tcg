import { BOOSTER_REFILL_MS } from "./booster";
import {
  dueNotifications,
  notificationMessage,
  reserveFullAt,
  type NotificationState,
} from "./notification";

const since = Date.parse("2026-10-23T06:00:00Z"); // 8 h à Paris
const base: NotificationState = {
  reserve: { count: 0, since },
  maxFreeBoosters: 3,
  streak: { count: 0, lastDay: null },
  notifiedFullAt: null,
  notifiedStreakDay: null,
};
const at = (iso: string) => new Date(iso);

describe("notifications", () => {
  it("calcule quand la réserve sera pleine", () => {
    expect(reserveFullAt(null, 3)).toBeNull();
    expect(reserveFullAt({ count: 1, since }, 3)).toBe(
      since + 2 * BOOSTER_REFILL_MS,
    );
  });

  it("prévient une fois la réserve pleine, puis plus avant le prochain remplissage", () => {
    const fullAt = since + 3 * BOOSTER_REFILL_MS; // 24/10, 8 h à Paris
    expect(dueNotifications(base, new Date(fullAt - 1))).toEqual([]);
    expect(dueNotifications(base, new Date(fullAt))).toEqual(["reserve-full"]);
    expect(
      dueNotifications(
        { ...base, notifiedFullAt: fullAt },
        new Date(fullAt + 1000),
      ),
    ).toEqual([]);
  });

  it("ne prévient jamais la nuit, et rattrape le matin", () => {
    const full = { ...base, reserve: { count: 3, since } };
    expect(dueNotifications(full, at("2026-10-23T21:30:00Z"))).toEqual([]); // 23 h 30
    expect(dueNotifications(full, at("2026-10-24T05:59:00Z"))).toEqual([]); // 7 h 59
    expect(dueNotifications(full, at("2026-10-24T06:00:00Z"))).toEqual([
      "reserve-full",
    ]);
  });

  it("rappelle le soir une série qui va se perdre, une fois par jour", () => {
    const streak = {
      ...base,
      reserve: null,
      streak: { count: 4, lastDay: "2026-10-22" },
    };
    expect(dueNotifications(streak, at("2026-10-23T16:59:00Z"))).toEqual([]); // 18 h 59
    expect(dueNotifications(streak, at("2026-10-23T17:00:00Z"))).toEqual([
      "streak-reminder",
    ]);
    expect(
      dueNotifications(
        { ...streak, notifiedStreakDay: "2026-10-23" },
        at("2026-10-23T18:00:00Z"),
      ),
    ).toEqual([]);
    // Déjà récupérée aujourd'hui, ou série déjà perdue : rien.
    expect(
      dueNotifications(
        { ...streak, streak: { count: 5, lastDay: "2026-10-23" } },
        at("2026-10-23T18:00:00Z"),
      ),
    ).toEqual([]);
    expect(
      dueNotifications(
        { ...streak, streak: { count: 4, lastDay: "2026-10-20" } },
        at("2026-10-23T18:00:00Z"),
      ),
    ).toEqual([]);
  });

  it("rédige des messages clairs", () => {
    expect(notificationMessage("reserve-full", base).title).toBe(
      "Vos 3 boosters sont prêts",
    );
    expect(
      notificationMessage("streak-reminder", {
        ...base,
        streak: { count: 4, lastDay: "x" },
      }),
    ).toMatchObject({ title: "Votre série de 4 jours est en jeu", url: "/" });
  });
});
