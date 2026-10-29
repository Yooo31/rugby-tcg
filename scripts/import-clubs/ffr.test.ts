import {
  candidateSlugs,
  clubSlugsFromSitemap,
  departmentOfPostalCode,
  nameSimilarity,
  officialInitials,
  parseClubPage,
  pickClubPage,
  type FfrClubPage,
} from "./ffr";

/** Extrait réduit d'une vraie page de club (flux aux guillemets échappés). */
const PAGE = String.raw`self.__next_f.push([1,"13:[\"$\",\"article\",null,{\"children\":[[\"$\",\"$L2d\",null,{\"clubSlug\":\"racing-club-salvetat-plaisance\",\"headerData\":{\"id\":642,\"embleme\":\"https://exemple/logo\",\"nom\":\"Racing Club Salvetat Plaisance\"}}]]}]\n"])</script><script>self.__next_f.push([1,"[\"$\",\"div\",null,{\"className\":\"flex\",\"children\":[[[\"$\",\"div\",\"0\",{\"className\":\"flex\",\"children\":[\"$\",\"div\",null,{\"className\":\"rounded-full\",\"style\":{\"backgroundColor\":\"blue\",\"marginLeft\":0}}]}],[\"$\",\"div\",\"1\",{\"className\":\"flex\",\"children\":[\"$\",\"div\",null,{\"className\":\"rounded-full\",\"style\":{\"backgroundColor\":\"yellow\",\"marginLeft\":-18}}]}]],[\"$\",\"p\",null,{\"className\":\"font-primary\",\"children\":\"Bleu, Jaune\"}]]}],[[\"$\",\"h3\",null,{\"children\":\"Contacts\"}],[\"$\",\"$L34\",\"address\",{\"id\":\"address\",\"title\":\"Place Du 19 Mars 1962, 31880 La Salvetat-saint-gilles\",\"variant\":\"primary-link\"}]]"])`;

describe("pages des clubs de la FFR", () => {
  it("lit le nom officiel, les couleurs de la tenue et la commune", () => {
    expect(parseClubPage("racing-club-salvetat-plaisance", PAGE)).toEqual({
      slug: "racing-club-salvetat-plaisance",
      name: "Racing Club Salvetat Plaisance",
      colors: ["Bleu", "Jaune"],
      postalCode: "31880",
      city: "La Salvetat-saint-gilles",
    });
  });

  it("reconnaît une page vide (club inconnu)", () => {
    expect(parseClubPage("inconnu", "<title>static club</title>")).toBeNull();
  });

  it("tolère une page sans couleurs ni adresse", () => {
    const page = PAGE.replace(/backgroundColor[\s\S]*Contacts/, "").replace(
      /"id\\":\\"address[\s\S]*$/,
      "",
    );
    expect(parseClubPage("x", page)).toMatchObject({
      colors: [],
      postalCode: null,
      city: null,
    });
  });

  it("liste les clubs d'un plan de site, sans doublon", () => {
    const xml = `<urlset><url><loc>https://ligueoccitanie.ffr.fr/clubs/stade-toulousain</loc></url><url><loc>https://ligueoccitanie.ffr.fr/clubs/stade-toulousain/</loc></url><url><loc>https://ligueoccitanie.ffr.fr/actualites/x</loc></url><url><loc>https://ligueoccitanie.ffr.fr/clubs/rc-auch</loc></url></urlset>`;
    expect(clubSlugsFromSitemap(xml)).toEqual(["stade-toulousain", "rc-auch"]);
  });

  it("déduit le département du code postal, Corse et outre-mer compris", () => {
    expect(departmentOfPostalCode("31880")).toBe("31");
    expect(departmentOfPostalCode("20000")).toBe("2A");
    expect(departmentOfPostalCode("20200")).toBe("2B");
    expect(departmentOfPostalCode("97400")).toBe("974");
  });
});

describe("rapprochement d'un club avec sa page FFR", () => {
  const club = {
    name: "RC Salvetat Plaisance",
    city: "La Salvetat-Saint-Gilles",
    department: "31",
  };
  const page = (overrides: Partial<FfrClubPage>): FfrClubPage => ({
    slug: "racing-club-salvetat-plaisance",
    name: "Racing Club Salvetat Plaisance",
    colors: ["Bleu", "Jaune"],
    postalCode: "31880",
    city: "La Salvetat-saint-gilles",
    ...overrides,
  });

  it("compare les noms sur leurs mots significatifs", () => {
    expect(
      nameSimilarity("RC Salvetat Plaisance", "racing-club-salvetat-plaisance"),
    ).toBe(1);
    expect(nameSimilarity("Stade Toulousain", "rc-auch")).toBe(0);
    expect(nameSimilarity("Rugby Club", "XV")).toBe(0);
  });

  it("classe les identifiants par ressemblance du nom, puis de la commune", () => {
    expect(
      candidateSlugs(
        club,
        [
          "rc-auch",
          "us-plaisance-du-touch",
          "racing-club-salvetat-plaisance",
          "stade-saint-gilles",
        ],
        2,
      ),
    ).toEqual(["racing-club-salvetat-plaisance", "us-plaisance-du-touch"]);
  });

  it("retient la page du même département au nom proche", () => {
    expect(pickClubPage(club, [page({})])).toEqual({
      page: page({}),
      isSure: true,
    });
  });

  it("préfère le club dont le sigle concorde, dans la même ville", () => {
    const asm = {
      name: "ASM Clermont",
      city: "Clermont-Ferrand",
      department: "63",
    };
    const university = page({
      slug: "clermont-u-c-aubiere-rugby",
      name: "Clermont Universite Club Aubiere Rugby",
      postalCode: "63170",
    });
    const montferrandaise = page({
      slug: "association-sportive-montferrandaise-clermont-auvergne",
      name: "Association Sportive Montferrandaise Clermont Auvergne",
      postalCode: "63100",
    });
    expect(pickClubPage(asm, [university, montferrandaise])).toEqual({
      page: montferrandaise,
      isSure: true,
    });
    // Seul candidat lu, au sigle différent : retenu, mais à vérifier.
    expect(pickClubPage(asm, [university])?.isSure).toBe(false);
    expect(
      candidateSlugs(asm, [university.slug, montferrandaise.slug], 1),
    ).toEqual([montferrandaise.slug]);
  });

  it("refuse un homonyme d'un autre département, ou un nom trop différent", () => {
    expect(pickClubPage(club, [page({ postalCode: "33000" })])).toBeNull();
    expect(
      pickClubPage(club, [page({ name: "Union Sportive Colomiers" })]),
    ).toBeNull();
    expect(pickClubPage(club, [page({ postalCode: null })])).toBeNull();
  });
});

describe("sigle tiré du nom officiel", () => {
  it.each([
    ["Racing Club Salvetat Plaisance", "RCSP"],
    ["Football Club de Grenoble Rugby", "FCG"],
    ["Rugby Club Toulonnais", "RCT"],
    ["Union Sportive Arlequins Perpignanais", "USAP"],
    ["Stade Toulousain Rugby", "ST"],
    ["Union Sportive de l'Isle-Jourdain", "USIJ"],
    ["Étoile Sportive Catalane XV", "ESC"],
    ["USA Perpignan", "USAP"],
  ])("%s → %s", (name, initials) => {
    expect(officialInitials(name)).toBe(initials);
  });
});
