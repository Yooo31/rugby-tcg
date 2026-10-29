import { fallbackColors, ffrColors, namedColor, parseColors } from "./colors";

describe("parseColors", () => {
  it.each([
    ["[[Rouge]] et [[noir]]", "#c8102e", "#111111"],
    ["[[Bleu ciel]] et [[Grenat (couleur)|grenat]]", "#6cace4", "#7a1f3d"],
    ["[[bleu ciel|Ciel]] et [[blanc]]", "#6cace4", "#f5f5f5"],
    ["[[Bleu marine]] et [[bleu ciel]]", "#0b2a5b", "#6cace4"],
    ["Sang et or", "#c8102e", "#f2c14e"],
    ["[[Bleu ciel]], [[blanc]], [[rouge]] et [[jaune]]", "#6cace4", "#f5f5f5"],
  ])("%s", (text, primary, secondary) => {
    expect(parseColors(text)).toEqual({ primary, secondary });
  });

  it("complète un club d'une seule couleur", () => {
    expect(parseColors("[[Vert]]")).toEqual({
      primary: "#00843d",
      secondary: "#f5f5f5",
    });
    expect(parseColors("Blanc")).toEqual({
      primary: "#f5f5f5",
      secondary: "#111111",
    });
  });

  it("ne confond pas « or » avec un mot qui le contient", () => {
    expect(parseColors("Bordeaux et noir")).toEqual({
      primary: "#7a1f3d",
      secondary: "#111111",
    });
  });

  it("renvoie null quand aucune couleur n'est reconnue", () => {
    expect(parseColors("{{Lien web|url=x}} selon la saison")).toBeNull();
  });
});

describe("fallbackColors", () => {
  it("attribue toujours les mêmes couleurs à un club", () => {
    expect(fallbackColors("us-vendome")).toEqual(fallbackColors("us-vendome"));
    expect(fallbackColors("us-vendome").primary).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("couleurs de la tenue nommées par la FFR", () => {
  it("garde l'ordre de la FFR, jusqu'à trois couleurs", () => {
    expect(ffrColors(["Bleu", "Jaune"])).toEqual({
      colors: { primary: "#0055a4", secondary: "#ffd100" },
      unknown: [],
    });
    expect(ffrColors(["Noir", "Rouge", "Blanc"]).colors).toEqual({
      primary: "#111111",
      secondary: "#c8102e",
      tertiary: "#f5f5f5",
    });
  });

  it("complète une tenue d'une seule couleur, et signale l'inconnu", () => {
    expect(ffrColors(["Vert"]).colors).toEqual({
      primary: "#00843d",
      secondary: "#f5f5f5",
    });
    expect(ffrColors(["Turquoise fluo"])).toEqual({
      colors: null,
      unknown: ["Turquoise fluo"],
    });
    expect(namedColor(" Bleu  Ciel ")).toBe("#6cace4");
  });
});
