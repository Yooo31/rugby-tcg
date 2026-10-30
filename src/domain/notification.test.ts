import { BOOSTER_REFILL_MS } from "./booster";
import {
  boostersToOpen,
  dueNotifications,
  lastRefillAt,
  notificationMessage,
  type NotificationState,
} from "./notification";

/** 2026-10-23 : Paris est à UTC+2 (heure d'été). */
const at = (parisTime: string) => new Date(`2026-10-23T${parisTime}:00+02:00`);

const base: NotificationState = {
  // Dernier booster ouvert à 9 h, réserve vide.
  reserve: { count: 0, since: at("09:00").getTime() },
  maxFreeBoosters: 3,
  bonusBoosters: 0,
  streak: { count: 4, lastDay: "2026-10-23" },
  notifiedBoosterAt: null,
  notifiedEveningDay: null,
  notifiedStreakDay: null,
};

describe("notifications", () => {
  it("annonce chaque booster regagné, une seule fois", () => {
    expect(dueNotifications(base, at("12:59"))).toEqual([]);
    expect(dueNotifications(base, at("13:05"))).toEqual(["booster-ready"]);
    const notified = {
      ...base,
      notifiedBoosterAt: lastRefillAt(base, at("13:05")),
    };
    expect(dueNotifications(notified, at("16:30"))).toEqual([]);
    expect(dueNotifications(notified, at("17:01"))).toEqual(["booster-ready"]);
  });

  it("regroupe les boosters de la nuit dans un message le matin", () => {
    const evening = {
      ...base,
      reserve: { count: 0, since: at("21:00").getTime() },
    };
    const nextMorning = new Date(at("08:15").getTime() + 24 * 3_600_000);
    expect(
      dueNotifications(
        evening,
        new Date(at("21:00").getTime() + 5 * 3_600_000),
      ),
    ).toEqual([]);
    expect(dueNotifications(evening, nextMorning)).toEqual(["booster-ready"]);
    expect(
      notificationMessage("booster-ready", evening, nextMorning).title,
    ).toBe("2 boosters sont prêts");
    // Réserve vidée à 21 h : pleine le lendemain à 9 h.
    const full = new Date(at("09:30").getTime() + 24 * 3_600_000);
    expect(notificationMessage("booster-ready", evening, full).title).toBe(
      "Vos 3 boosters sont prêts",
    );
  });

  it("dit combien de boosters gratuits attendent", () => {
    expect(notificationMessage("booster-ready", base, at("13:05"))).toEqual({
      title: "Un booster est prêt",
      body: "Réserve : 1 sur 3. Ouvrez-les avant qu'elle soit pleine.",
      url: "/boosters",
    });
    expect(lastRefillAt({ ...base, reserve: null }, at("13:05"))).toBeNull();
  });

  it("rappelle à 20 h les boosters non ouverts, bonus compris, une fois par jour", () => {
    const withBonus = {
      ...base,
      bonusBoosters: 2,
      notifiedBoosterAt: lastRefillAt(base, at("19:30")),
    };
    expect(dueNotifications(withBonus, at("19:59"))).toEqual([]);
    expect(dueNotifications(withBonus, at("20:00"))).toEqual([
      "evening-boosters",
    ]);
    expect(boostersToOpen(withBonus, at("20:00"))).toBe(4);
    expect(
      notificationMessage("evening-boosters", withBonus, at("20:00")).title,
    ).toBe("Il vous reste 4 boosters à ouvrir");
    expect(
      dueNotifications(
        { ...withBonus, notifiedEveningDay: "2026-10-23" },
        at("20:30"),
      ),
    ).toEqual([]);
    // Rien à ouvrir : pas de rappel.
    const empty = {
      ...base,
      reserve: { count: 0, since: at("19:00").getTime() },
    };
    expect(dueNotifications(empty, at("20:00"))).toEqual([]);
  });

  it("préfère le rappel du soir à l'annonce d'un booster à la même heure", () => {
    expect(dueNotifications(base, at("20:05"))).toEqual(["evening-boosters"]);
  });

  it("rappelle la série dès 19 h, une fois, si elle se perd à minuit", () => {
    const atRisk = {
      ...base,
      reserve: { count: 0, since: at("18:00").getTime() },
      streak: { count: 4, lastDay: "2026-10-22" },
    };
    expect(dueNotifications(atRisk, at("18:59"))).toEqual([]);
    expect(dueNotifications(atRisk, at("19:00"))).toEqual(["streak-reminder"]);
    expect(
      dueNotifications(
        { ...atRisk, notifiedStreakDay: "2026-10-23" },
        at("19:30"),
      ),
    ).toEqual([]);
    expect(notificationMessage("streak-reminder", atRisk, at("19:00"))).toEqual(
      {
        title: "Votre série de 4 jours est en jeu",
        body: "Récupérez la récompense du jour avant minuit pour la garder.",
        url: "/",
      },
    );
  });

  it("se tait la nuit", () => {
    expect(dueNotifications(base, at("23:00"))).toEqual([]);
    expect(
      dueNotifications(base, new Date(at("07:59").getTime() + 24 * 3_600_000)),
    ).toEqual([]);
    expect(BOOSTER_REFILL_MS).toBe(4 * 3_600_000);
  });

  it("plafonne les boosters gratuits à la réserve, après un pass VIP", () => {
    const formerVip = {
      ...base,
      reserve: { count: 5, since: at("09:00").getTime() },
    };
    expect(boostersToOpen(formerVip, at("20:00"))).toBe(3);
  });
});
