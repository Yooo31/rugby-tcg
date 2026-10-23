import {
  daysBetween,
  nextDayKey,
  parisHour,
  parisMidnight,
  toDayKey,
} from "./dates";
import { formatCountdown } from "./duration";
import { createSeededRng, hashString, secureRng } from "./rng";
import { cn } from "./utils";

describe("createSeededRng", () => {
  it("produit la même suite pour une même graine, dans [0, 1[", () => {
    const a = createSeededRng(123);
    const b = createSeededRng(123);
    for (let index = 0; index < 100; index += 1) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("diffère d'une graine à l'autre", () => {
    expect(createSeededRng(1)()).not.toBe(createSeededRng(2)());
  });
});

describe("hashString", () => {
  it("est stable et discrimine les chaînes", () => {
    expect(hashString("stade-toulousain")).toBe(hashString("stade-toulousain"));
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});

describe("secureRng", () => {
  it("tire dans [0, 1[ sans se répéter", () => {
    const draws = Array.from({ length: 50 }, () => secureRng());
    for (const value of draws) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(new Set(draws).size).toBeGreaterThan(45);
  });
});

describe("toDayKey", () => {
  it("formate la date de Paris avec des zéros", () => {
    expect(toDayKey(new Date("2026-01-05T12:00:00Z"))).toBe("2026-01-05");
  });

  it("change de jour à minuit, heure de Paris, et non à minuit UTC", () => {
    // 23 h 30 UTC en hiver = 0 h 30 à Paris.
    expect(toDayKey(new Date("2026-01-05T23:30:00Z"))).toBe("2026-01-06");
    // 21 h 59 UTC en été = 23 h 59 à Paris.
    expect(toDayKey(new Date("2026-07-05T21:59:00Z"))).toBe("2026-07-05");
  });
});

describe("parisMidnight", () => {
  it("donne minuit à Paris, en hiver comme en été", () => {
    expect(parisMidnight("2026-01-15")).toBe(Date.UTC(2026, 0, 14, 23));
    expect(parisMidnight("2026-10-23")).toBe(Date.UTC(2026, 9, 22, 22));
  });

  it("gère les jours de changement d'heure", () => {
    // Passage à l'heure d'été le 29 mars 2026, à l'heure d'hiver le 25 octobre.
    expect(parisMidnight("2026-03-29")).toBe(Date.UTC(2026, 2, 28, 23));
    expect(parisMidnight("2026-10-25")).toBe(Date.UTC(2026, 9, 24, 22));
    expect(parisMidnight("2026-10-26")).toBe(Date.UTC(2026, 9, 25, 23));
  });

  it("refuse une date invalide", () => {
    expect(parisMidnight("2026-02-30")).toBeNull();
    expect(parisMidnight("23/10/2026")).toBeNull();
  });

  it("revient au même jour par toDayKey", () => {
    const midnight = parisMidnight("2026-10-23");
    expect(midnight && toDayKey(new Date(midnight))).toBe("2026-10-23");
  });
});

describe("nextDayKey", () => {
  it("passe au lendemain, même en fin de mois", () => {
    expect(nextDayKey("2026-10-23")).toBe("2026-10-24");
    expect(nextDayKey("2026-12-31")).toBe("2027-01-01");
  });

  it("refuse une clé invalide", () => {
    expect(() => nextDayKey("hier")).toThrow();
  });
});

describe("daysBetween", () => {
  it("compte les jours, changement d'heure compris", () => {
    expect(daysBetween("2026-10-22", "2026-10-29")).toBe(7);
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
    expect(daysBetween("2026-10-23", "2026-10-22")).toBe(-1);
  });

  it("refuse une date invalide", () => {
    expect(() => daysBetween("2026-02-30", "2026-03-01")).toThrow();
  });
});

describe("parisHour", () => {
  it("donne l'heure de Paris, en hiver comme en été", () => {
    expect(parisHour(new Date("2026-01-15T21:30:00Z"))).toBe(22);
    expect(parisHour(new Date("2026-07-15T21:30:00Z"))).toBe(23);
    expect(parisHour(new Date("2026-07-15T22:30:00Z"))).toBe(0);
  });
});

describe("cn", () => {
  it("fusionne les classes et résout les conflits Tailwind", () => {
    expect(cn("p-2", false && "hidden", "p-4")).toBe("p-4");
  });
});

describe("formatCountdown", () => {
  it("affiche heures, minutes et secondes", () => {
    expect(formatCountdown(2 * 3_600_000 + 14 * 60_000 + 5_000)).toBe(
      "2:14:05",
    );
  });

  it("omet les heures sous une heure et ne descend jamais sous zéro", () => {
    expect(formatCountdown(14 * 60_000 + 5_999)).toBe("14:05");
    expect(formatCountdown(-500)).toBe("00:00");
  });
});
