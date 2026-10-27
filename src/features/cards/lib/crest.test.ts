import { CLUB_CATALOG } from "@/data/catalog";
import { makeClub } from "@/test/fixtures";
import { CREST_SYMBOLS } from "@/domain";
import { crestDesign, crestSvgMarkup, starPath, symbolLayers } from "./crest";

describe("blason généré", () => {
  it("donne toujours le même blason à un club", () => {
    const club = makeClub({ id: "stade-toulousain", name: "Stade Toulousain" });
    expect(crestDesign(club)).toEqual(crestDesign(club));
    expect(crestDesign(club).initials).toBe("ST");
  });

  it("varie formes et motifs d'un club à l'autre", () => {
    const designs = CLUB_CATALOG.map(crestDesign);
    expect(new Set(designs.map((design) => design.shield)).size).toBe(3);
    // Sept motifs tirés au hasard, plus les bandes catalanes choisies à la main.
    expect(new Set(designs.map((design) => design.pattern)).size).toBe(8);
  });

  it("ne tire jamais les bandes catalanes au hasard", () => {
    const stripes = crestDesign(
      makeClub({ id: "usap", crest: { pattern: "stripes" } }),
    ).pattern;
    for (const index of Array.from({ length: 200 }, (_, i) => i))
      expect(crestDesign(makeClub({ id: `club-${index}` })).pattern).not.toBe(
        stripes,
      );
  });

  it("applique la forme, le motif et le symbole choisis pour un club", () => {
    const chosen = makeClub({
      id: "x",
      crest: { shape: "rounded", pattern: "halves", symbol: "anchor" },
    });
    const random = makeClub({ id: "x" });
    expect(crestDesign(chosen).symbol).not.toBeNull();
    expect(crestDesign(random).symbol).toBeNull();
    expect(crestDesign(chosen).pattern).toBe("M50 0H100V116H50Z");
    expect(crestDesign(chosen).shield).toMatch(/^M8 6H92/);
  });

  it("descend le sigle dans la pointe quand un symbole occupe le centre", () => {
    const plain = crestDesign(makeClub({ id: "a", name: "Stade Toulousain" }));
    const withSymbol = crestDesign(
      makeClub({ id: "a", name: "Stade Toulousain", crest: { symbol: "sun" } }),
    );
    expect(withSymbol.initialsLayout.y).toBeGreaterThan(plain.initialsLayout.y);
    expect(withSymbol.initialsLayout.size).toBeLessThan(
      plain.initialsLayout.size,
    );
    const long = crestDesign(
      makeClub({
        id: "a",
        name: "Rugby Club Toulonnais",
        crest: { symbol: "sun" },
      }),
    );
    expect(long.initialsLayout.size).toBeLessThan(
      withSymbol.initialsLayout.size,
    );
  });

  it("dessine chaque symbole : contour, encre, puis détails", () => {
    for (const symbol of CREST_SYMBOLS) {
      const design = crestDesign(makeClub({ id: "s", crest: { symbol } }));
      const layers = symbolLayers(design);
      expect(layers.length).toBeGreaterThanOrEqual(2);
      expect(layers[0].stroke).toBe(design.field);
      expect([layers[1].fill, layers[1].stroke]).toContain(design.ink);
      for (const { d } of layers) expect(d).toMatch(/^M/);
    }
    expect(symbolLayers(crestDesign(makeClub({ id: "n" })))).toEqual([]);
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
    const paths = (svg: string) => svg.match(/<path/g)?.length ?? 0;
    const withSymbol = crestSvgMarkup(
      crestDesign({ ...club, crest: { symbol: "ball" } }),
    );
    // Contour, encre et coutures du ballon.
    expect(paths(withSymbol)).toBe(paths(markup) + 3);
  });
});
