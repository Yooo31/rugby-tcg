import { makeClub } from "@/test/fixtures";
import { departmentsOfRegion } from "./geo";
import { rarityLabel, rarityRank, cardKey } from "./card";
import {
  clubInitials,
  clubRegion,
  clubSchema,
  DIVISIONS,
  getDivision,
} from "./club";
import { departmentName, regionName } from "./geo";
import { computePower, formBonus, MAX_POWER } from "./power";

describe("divisions", () => {
  it("vont du Top 14 à la Régionale 3, dans l'ordre hiérarchique", () => {
    expect(DIVISIONS.map((division) => division.tier)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(getDivision("federale1").label).toBe("Fédérale 1");
  });
});

describe("clubInitials", () => {
  it.each([
    ["Stade Toulousain", "ST"],
    ["RC Toulonnais", "RCT"],
    ["Union Bordeaux-Bègles", "UBB"],
    ["USA Perpignan", "USA"],
    ["US L'Isle-Jourdain", "USI"],
    ["Saint-Jean-de-Luz Olympique", "SJL"],
  ])("%s → %s", (name, initials) => {
    expect(clubInitials(name)).toBe(initials);
  });
});

describe("géographie", () => {
  it("déduit la région du département", () => {
    expect(clubRegion(makeClub({ id: "a", department: "31" }))).toBe("occ");
    expect(regionName("occ")).toBe("Occitanie");
    expect(departmentName("2B")).toBe("Haute-Corse");
  });
});

describe("clubSchema", () => {
  it("rejette un département inconnu et une couleur invalide", () => {
    const club = makeClub({ id: "a" });
    expect(clubSchema.safeParse({ ...club, department: "99" }).success).toBe(
      false,
    );
    expect(
      clubSchema.safeParse({
        ...club,
        colors: { primary: "rouge", secondary: "#000000" },
      }).success,
    ).toBe(false);
    expect(clubSchema.safeParse(club).success).toBe(true);
  });
});

describe("puissance", () => {
  it("croît avec le niveau de la division", () => {
    const powers = DIVISIONS.map((division) =>
      computePower({ division: division.id, recentResults: [] }),
    );
    expect(powers).toEqual([...powers].sort((a, b) => b - a));
    expect(new Set(powers).size).toBe(DIVISIONS.length);
  });

  it("suit la forme du moment", () => {
    expect(formBonus(["W", "W", "D", "L", "W"])).toBe(2);
    const base = computePower({ division: "federale2", recentResults: [] });
    expect(
      computePower({ division: "federale2", recentResults: ["W", "W", "W"] }),
    ).toBe(base + 3);
    expect(
      computePower({ division: "federale2", recentResults: ["L", "L"] }),
    ).toBe(base - 2);
  });

  it("reste bornée", () => {
    const power = computePower({
      division: "top14",
      recentResults: ["W", "W", "W", "W", "W"],
    });
    expect(power).toBeLessThanOrEqual(MAX_POWER);
  });
});

describe("cartes", () => {
  it("ordonne les raretés et les libelle", () => {
    expect(rarityRank("common")).toBeLessThan(rarityRank("legendary"));
    expect(rarityLabel("epic")).toBe("Épique");
  });

  it("identifie une carte par club et rareté", () => {
    expect(cardKey({ clubId: "stade-toulousain", rarity: "rare" })).toBe(
      "stade-toulousain:rare",
    );
  });
});

describe("départements d'une région", () => {
  it("liste les départements de l'Occitanie", () => {
    const departments = departmentsOfRegion("occ");
    expect(departments).toContain("31");
    expect(departments).not.toContain("33");
  });
});
