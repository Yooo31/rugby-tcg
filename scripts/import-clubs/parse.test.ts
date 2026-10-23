import {
  cityName,
  departmentOfInsee,
  formFromRecord,
  parseStandings,
  parseWikiLink,
  slugify,
} from "./parse";

describe("parseStandings", () => {
  const wikitext = `
{{Cls_Rugby|p=1 |club=ru Toulouse |v=4|n=0|d=1|bo=2|bd=1|pp=150|pc=90|bon=0}}
{{Cls_Rugby |p=2|club=ru Pau|v=3|n=1|d=1|bo=1{{bonus}}|bd=0}}
{{Cls_Rugby|p=3|club=ru Épernay            |v=|n=|d=}}
{{Cls_Rugby|p=1|club=ru Toulouse|v=9|n=9|d=9}}
{{Rugbyc|relégué}}`;

  it("lit le code et le bilan de chaque club, même avec un modèle imbriqué", () => {
    expect(parseStandings(wikitext)).toEqual([
      { code: "ru Toulouse", wins: 4, draws: 0, losses: 1 },
      { code: "ru Pau", wins: 3, draws: 1, losses: 1 },
      { code: "ru Épernay", wins: 0, draws: 0, losses: 0 },
    ]);
  });

  it("ne garde que la première apparition d'un club", () => {
    const toulouse = parseStandings(wikitext).filter(
      (row) => row.code === "ru Toulouse",
    );
    expect(toulouse).toHaveLength(1);
  });

  it("renvoie une liste vide sans tableau de classement", () => {
    expect(parseStandings("Aucun classement ici.")).toEqual([]);
  });
});

describe("parseWikiLink", () => {
  it.each([
    ["[[Stade toulousain]]", "Stade toulousain", "Stade toulousain"],
    [
      "[[Section paloise (rugby à XV)|Section paloise]]",
      "Section paloise (rugby à XV)",
      "Section paloise",
    ],
    [
      "le [[Union_Sportive_Vendômoise|US Vendôme]] promu",
      "Union Sportive Vendômoise",
      "US Vendôme",
    ],
    [
      "[[Section paloise (rugby à XV)]]",
      "Section paloise (rugby à XV)",
      "Section paloise",
    ],
  ])("%s", (wikitext, title, label) => {
    expect(parseWikiLink(wikitext)).toEqual({ title, label });
  });

  it("renvoie null sans lien", () => {
    expect(parseWikiLink("texte brut")).toBeNull();
  });
});

describe("géographie", () => {
  it("déduit le département du code INSEE, Corse et outre-mer compris", () => {
    expect(departmentOfInsee("31555")).toBe("31");
    expect(departmentOfInsee("2B033")).toBe("2B");
    expect(departmentOfInsee("97411")).toBe("974");
  });

  it("ramène un arrondissement à sa ville", () => {
    expect(cityName("16e arrondissement de Paris")).toBe("Paris");
    expect(cityName("1er arrondissement de Lyon")).toBe("Lyon");
    expect(cityName("Castelnau-Magnoac")).toBe("Castelnau-Magnoac");
  });
});

describe("slugify", () => {
  it("donne un identifiant sans accent ni ponctuation", () => {
    expect(slugify("Union Bordeaux Bègles")).toBe("union-bordeaux-begles");
    expect(slugify("C' Chartres Rugby")).toBe("c-chartres-rugby");
    expect(slugify("AS Saint-Marcel-Isle d'Abeau")).toBe(
      "as-saint-marcel-isle-d-abeau",
    );
  });
});

describe("formFromRecord", () => {
  it("reprend le bilan tel quel jusqu'à cinq matchs", () => {
    expect(formFromRecord(2, 1, 1)).toEqual(["W", "W", "D", "L"]);
    expect(formFromRecord(0, 0, 0)).toEqual([]);
  });

  it("garde les proportions du bilan au-delà de cinq matchs", () => {
    expect(formFromRecord(10, 0, 0)).toEqual(["W", "W", "W", "W", "W"]);
    expect(formFromRecord(6, 0, 4)).toEqual(["W", "W", "W", "L", "L"]);
    expect(formFromRecord(4, 2, 4)).toHaveLength(5);
  });
});
