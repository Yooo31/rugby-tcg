import { assembleClubs, type Entry, type Sources } from "./assemble";
import * as http from "./http";
import { bestPlace, fetchPlaces } from "./wikidata";

vi.mock("./http", () => ({
  getJson: vi.fn(),
  chunk: <T>(items: readonly T[]) => [items],
}));

const entry = (code: string, division: Entry["division"] = "top14"): Entry => ({
  division,
  code,
  form: ["W", "W", "L"],
});

function sources(overrides: Partial<Sources> = {}): Sources {
  return {
    links: new Map([
      ["ru Toulouse", { title: "Stade toulousain", label: "Stade toulousain" }],
      ["ru Pau", { title: "Section paloise", label: "Section paloise" }],
    ]),
    wikidataIds: new Map([
      ["Stade toulousain", "Q1"],
      ["Section paloise", "Q2"],
    ]),
    places: new Map([
      ["Q1", { city: "Toulouse", insee: "31555", isCommune: false }],
      ["Q2", { city: "Pau", insee: "64445", isCommune: true }],
    ]),
    infoboxColors: new Map([["Stade toulousain", "rouge et noir"]]),
    locationOverrides: {},
    ...overrides,
  };
}

describe("assemblage des clubs importés", () => {
  it("assemble un club valide avec sa commune, son département et ses couleurs", () => {
    const { clubs, skipped, realColors } = assembleClubs(
      [entry("ru Toulouse")],
      sources(),
    );
    expect(skipped).toEqual([]);
    expect(realColors).toBe(1);
    expect(clubs).toMatchObject([
      {
        id: "stade-toulousain",
        city: "Toulouse",
        department: "31",
        division: "top14",
        wikidata: "Q1",
      },
    ]);
  });

  it("n'attribue pas d'identifiant Wikidata à un club qui partage celui de sa commune", () => {
    const [club] = assembleClubs([entry("ru Pau")], sources()).clubs;
    expect(club).not.toHaveProperty("wikidata");
    expect(club.department).toBe("64");
  });

  it("préfère la commune saisie à la main, et distingue deux homonymes par leur département", () => {
    const homonyms = sources({
      links: new Map([
        ["ru A", { title: "A", label: "US Ville" }],
        ["ru B", { title: "B", label: "US Ville" }],
      ]),
      locationOverrides: {
        "ru A": { city: "Albi", department: "81" },
        "ru B": { city: "Agen", department: "47" },
      },
    });
    const { clubs } = assembleClubs([entry("ru A"), entry("ru B")], homonyms);
    expect(clubs.map((club) => [club.id, club.city])).toEqual([
      ["us-ville", "Albi"],
      ["us-ville-47", "Agen"],
    ]);
  });

  it("écarte en le signalant un club sans lien, sans commune ou invalide", () => {
    const { clubs, skipped } = assembleClubs(
      [entry("ru Inconnu"), entry("ru Pau")],
      sources({ places: new Map() }),
    );
    expect(clubs).toEqual([]);
    expect(skipped).toEqual([
      "ru Inconnu : lien introuvable",
      "ru Pau (Section paloise) : commune inconnue",
    ]);

    const invalid = sources({
      locationOverrides: { "ru Pau": { city: "Pau", department: "00" } },
    });
    expect(assembleClubs([entry("ru Pau")], invalid).skipped[0]).toMatch(
      /^ru Pau \(Section paloise\) : /,
    );
  });

  it("attribue des couleurs de repli sans infobox", () => {
    const { clubs, realColors } = assembleClubs([entry("ru Pau")], sources());
    expect(realColors).toBe(0);
    expect(clubs[0].colors.primary).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("commune d'un élément Wikidata", () => {
  const value = (text: string) => ({ value: text });

  it("préfère l'élément lui-même, puis le siège, puis la localisation", () => {
    expect(bestPlace({ itemLabel: value("Pau"), own: value("64445") })).toEqual(
      {
        city: "Pau",
        insee: "64445",
        isCommune: true,
      },
    );
    expect(
      bestPlace({
        seatLabel: value("Toulouse"),
        seatInsee: value("31555"),
        areaLabel: value("Occitanie"),
        areaInsee: value("76"),
      }),
    ).toEqual({ city: "Toulouse", insee: "31555", isCommune: false });
    expect(
      bestPlace({ areaLabel: value("Albi"), areaInsee: value("81004") }),
    ).toEqual({
      city: "Albi",
      insee: "81004",
      isCommune: false,
    });
  });

  it("ne renvoie rien sans commune complète", () => {
    expect(bestPlace({ itemLabel: value("Club") })).toBeUndefined();
  });
});

describe("communes depuis Wikidata", () => {
  it("interroge par lots et garde la première ligne de chaque élément", async () => {
    const getJson = vi.mocked(http.getJson);
    getJson.mockResolvedValueOnce({
      results: {
        bindings: [
          {
            item: { value: "http://www.wikidata.org/entity/Q1" },
            seatLabel: { value: "Pau" },
            seatInsee: { value: "64445" },
          },
          {
            item: { value: "http://www.wikidata.org/entity/Q1" },
            itemLabel: { value: "Autre" },
            own: { value: "00000" },
          },
          { item: { value: "http://www.wikidata.org/entity/Q2" } },
          { itemLabel: { value: "Sans élément" } },
        ],
      },
    });
    const places = await fetchPlaces(["Q1", "Q2"]);
    expect(places).toEqual(
      new Map([["Q1", { city: "Pau", insee: "64445", isCommune: false }]]),
    );
    expect(getJson).toHaveBeenCalledTimes(1);
    expect(getJson.mock.calls[0][0]).toContain("wd%3AQ1+wd%3AQ2");
  });
});
