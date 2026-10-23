import { formatDateTime, formatDay, formatPercent } from "./format";
import { isAdminEmail, parseAdminEmails } from "./admins";
import {
  adjustmentFormSchema,
  fieldErrors,
  giveawayFormSchema,
} from "./schemas";

describe("administrateurs", () => {
  it("lit la liste sans tenir compte des espaces ni de la casse", () => {
    const admins = parseAdminEmails(" Yoan@Club.fr , ,autre@club.fr");
    expect(isAdminEmail("yoan@club.fr", admins)).toBe(true);
    expect(isAdminEmail("AUTRE@club.fr ", admins)).toBe(true);
    expect(isAdminEmail("intrus@club.fr", admins)).toBe(false);
    expect(isAdminEmail(null, admins)).toBe(false);
  });

  it("n'accepte personne sans variable", () => {
    expect(parseAdminEmails(undefined).size).toBe(0);
    expect(isAdminEmail("", parseAdminEmails(""))).toBe(false);
  });
});

describe("formulaire de correction", () => {
  it("lit des nombres saisis, vide valant 0", () => {
    expect(
      adjustmentFormSchema.parse({
        ingotsDelta: "-50",
        boostersDelta: "",
        reason: "Bug",
      }),
    ).toEqual({ ingotsDelta: -50, boostersDelta: 0, reason: "Bug" });
  });

  it("refuse un nombre décimal ou une correction vide", () => {
    const decimal = adjustmentFormSchema.safeParse({
      ingotsDelta: "1.5",
      boostersDelta: "0",
      reason: "Bug",
    });
    expect(decimal.success).toBe(false);
    if (!decimal.success)
      expect(fieldErrors(decimal.error)).toHaveProperty("ingotsDelta");
    expect(
      adjustmentFormSchema.safeParse({
        ingotsDelta: "0",
        boostersDelta: "0",
        reason: "Bug",
      }).success,
    ).toBe(false);
  });
});

describe("formulaire de cadeau", () => {
  const form = {
    title: "Un booster offert",
    ingots: "",
    boosters: "1",
    startDay: "2026-10-23",
    endDay: "2026-10-23",
  };

  it("couvre des jours entiers, heure de Paris", () => {
    expect(giveawayFormSchema.parse(form)).toEqual({
      title: "Un booster offert",
      ingots: 0,
      boosters: 1,
      startsAt: Date.UTC(2026, 9, 22, 22),
      endsAt: Date.UTC(2026, 9, 23, 22),
    });
  });

  it("refuse un cadeau vide, négatif ou à l'envers", () => {
    for (const invalid of [
      { ...form, boosters: "0" },
      { ...form, boosters: "-1" },
      { ...form, endDay: "2026-10-22" },
      { ...form, startDay: "2026-02-30", endDay: "2026-03-01" },
      { ...form, title: "" },
    ])
      expect(
        giveawayFormSchema.safeParse(invalid).success,
        JSON.stringify(invalid),
      ).toBe(false);
  });
});

describe("mise en forme", () => {
  it("affiche l'heure de Paris et des pourcentages à la française", () => {
    expect(formatDateTime(Date.UTC(2026, 9, 22, 22))).toMatch(
      /23 oct\. 2026.*00:00/,
    );
    expect(formatPercent(1, 3)).toBe("33,3 %");
    expect(formatPercent(1, 0)).toBe("–");
    expect(formatDay("2026-10-22")).toBe("jeu. 22 oct.");
  });
});
