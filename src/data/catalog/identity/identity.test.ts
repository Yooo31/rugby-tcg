import { clubSchema } from "@/domain";
import { CLUB_CATALOG, FULL_CLUB_CATALOG } from "../index";
import { CLUB_PALETTE } from "../palette";
import { CLUB_IDENTITIES, withIdentity } from "./index";

describe("identité des clubs", () => {
  it("ne vise que des clubs du catalogue, avec un sigle et une source", () => {
    const ids = new Set(FULL_CLUB_CATALOG.map((club) => club.id));
    for (const [id, identity] of Object.entries(CLUB_IDENTITIES)) {
      expect(ids, id).toContain(id);
      expect(
        clubSchema.shape.initials.safeParse(identity.initials).success,
        `${id} : sigle « ${identity.initials} »`,
      ).toBe(true);
      expect(identity.source.trim(), id).not.toBe("");
    }
    for (const club of FULL_CLUB_CATALOG)
      expect(clubSchema.safeParse(club).success, club.id).toBe(true);
  });

  it("donne une fiche relue à chaque club du jeu : rien n'est deviné", () => {
    const missing = CLUB_CATALOG.filter(
      (club) => !(club.id in CLUB_IDENTITIES),
    ).map((club) => club.id);
    expect(missing).toEqual([]);
  });

  it("applique couleurs, sigle et blason de la fiche", () => {
    const perpignan = CLUB_CATALOG.find((club) => club.id === "usa-perpignan");
    expect(perpignan).toMatchObject({
      colors: { primary: CLUB_PALETTE.or, secondary: CLUB_PALETTE.rouge },
      initials: "USAP",
      crest: { pattern: "stripes" },
    });
    const nice = CLUB_CATALOG.find((club) => club.id === "nissa-rugby");
    expect(nice?.colors.tertiary).toBe(CLUB_PALETTE.blanc);
  });

  it("complète une tenue d'une seule couleur par du blanc", () => {
    const bressane = CLUB_CATALOG.find((club) => club.id === "us-bressane");
    expect(bressane?.colors).toEqual({
      primary: CLUB_PALETTE.violet,
      secondary: CLUB_PALETTE.blanc,
    });
  });

  it("laisse intact un club sans fiche", () => {
    const club = FULL_CLUB_CATALOG.find(
      (candidate) => !(candidate.id in CLUB_IDENTITIES),
    );
    expect(club && withIdentity(club)).toBe(club);
  });
});
