import { clubSchema, DIVISIONS } from "@/domain";
import { CATALOG_SEASON, CLUB_CATALOG } from "./index";

const inDivision = (division: string) =>
  CLUB_CATALOG.filter((club) => club.division === division);

describe("catalogue des clubs", () => {
  it("ne contient que des clubs valides, aux identifiants uniques", () => {
    for (const club of CLUB_CATALOG)
      expect(clubSchema.safeParse(club).success).toBe(true);
    expect(new Set(CLUB_CATALOG.map((club) => club.id)).size).toBe(
      CLUB_CATALOG.length,
    );
  });

  it("couvre toutes les divisions", () => {
    expect(new Set(CLUB_CATALOG.map((club) => club.division)).size).toBe(
      DIVISIONS.length,
    );
  });

  it("a les effectifs réglementaires des divisions professionnelles", () => {
    expect(inDivision("top14")).toHaveLength(14);
    expect(inDivision("prod2")).toHaveLength(16);
  });

  it("n'a jamais deux clubs du catalogue dans la même ville pour une saisie régionale", () => {
    const importedTowns = new Set(
      CLUB_CATALOG.filter((club) => !club.division.startsWith("regionale")).map(
        (club) => `${club.department}:${club.city.toLowerCase()}`,
      ),
    );
    const regional = CLUB_CATALOG.filter((club) =>
      club.division.startsWith("regionale"),
    );
    expect(regional.length).toBeGreaterThan(0);
    for (const club of regional) {
      expect(
        importedTowns.has(`${club.department}:${club.city.toLowerCase()}`),
      ).toBe(false);
    }
  });

  it("indique la saison importée", () => {
    expect(CATALOG_SEASON).toMatch(/^\d{4}-\d{4}$/);
  });
});
