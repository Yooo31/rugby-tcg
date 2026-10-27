import { clubSchema } from "@/domain";
import { CLUB_IDENTITIES, withIdentity } from "./identity";
import { CLUB_CATALOG, FULL_CLUB_CATALOG } from "./index";

describe("identité des clubs", () => {
  it("ne vise que des clubs du catalogue, avec des choix valides", () => {
    const ids = new Set(FULL_CLUB_CATALOG.map((club) => club.id));
    for (const id of Object.keys(CLUB_IDENTITIES)) expect(ids).toContain(id);
    for (const club of FULL_CLUB_CATALOG)
      expect(clubSchema.safeParse(club).success).toBe(true);
  });

  it("donne un blason choisi à chaque club du Top 14 et de la Pro D2", () => {
    const elite = CLUB_CATALOG.filter((club) =>
      ["top14", "prod2"].includes(club.division),
    );
    expect(elite.length).toBeGreaterThan(0);
    for (const club of elite) expect(club.crest).toBeDefined();
  });

  it("corrige les couleurs que l'infobox donne mal", () => {
    const perpignan = CLUB_CATALOG.find((club) => club.id === "usa-perpignan");
    expect(perpignan?.colors).toEqual({
      primary: "#f2c14e",
      secondary: "#c8102e",
    });
  });

  it("laisse intact un club sans identité saisie", () => {
    const club = CLUB_CATALOG.find((candidate) => !candidate.crest);
    expect(club && withIdentity(club)).toBe(club);
  });
});
