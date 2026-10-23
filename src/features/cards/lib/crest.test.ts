import { CLUB_CATALOG } from "@/data/catalog";
import { makeClub } from "@/test/fixtures";
import { crestDesign, crestSvgMarkup, starPath } from "./crest";

describe("blason généré", () => {
  it("donne toujours le même blason à un club", () => {
    const club = makeClub({ id: "stade-toulousain", name: "Stade Toulousain" });
    expect(crestDesign(club)).toEqual(crestDesign(club));
    expect(crestDesign(club).initials).toBe("ST");
  });

  it("varie formes et motifs d'un club à l'autre", () => {
    const designs = CLUB_CATALOG.map(crestDesign);
    expect(new Set(designs.map((design) => design.shield)).size).toBe(3);
    expect(new Set(designs.map((design) => design.pattern)).size).toBe(7);
  });

  it("met des étoiles selon la division, et seulement en haut de l'échelle", () => {
    expect(
      crestDesign(makeClub({ id: "a", division: "top14" })).stars,
    ).toHaveLength(3);
    expect(
      crestDesign(makeClub({ id: "b", division: "prod2" })).stars,
    ).toHaveLength(2);
    expect(
      crestDesign(makeClub({ id: "c", division: "nationale" })).stars,
    ).toHaveLength(1);
    expect(
      crestDesign(makeClub({ id: "d", division: "federale1" })).stars,
    ).toHaveLength(0);
  });

  it("trace une étoile fermée à dix sommets", () => {
    const path = starPath(50, 20, 6);
    expect(path.startsWith("M50.00 14.00")).toBe(true);
    expect(path.split("L")).toHaveLength(10);
  });

  it("produit un SVG autonome aux couleurs du club", () => {
    const club = makeClub({
      id: "x",
      colors: { primary: "#c8102e", secondary: "#111111" },
    });
    const markup = crestSvgMarkup(crestDesign(club));
    expect(markup).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(markup).toContain('fill="#c8102e"');
    expect(markup).toContain('fill="#111111"');
  });
});
