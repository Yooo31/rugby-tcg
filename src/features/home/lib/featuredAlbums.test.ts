import { buildPermanentAlbums } from "@/domain";
import { makeClub } from "@/test/fixtures";
import { featuredAlbums } from "./featuredAlbums";

const clubs = [
  makeClub({ id: "a", division: "top14", department: "31" }),
  makeClub({ id: "b", division: "top14", department: "81" }),
  makeClub({ id: "c", division: "prod2", department: "81" }),
  makeClub({ id: "d", division: "prod2", department: "64" }),
];
const albums = buildPermanentAlbums(clubs);

describe("featuredAlbums", () => {
  it("ne propose rien à un joueur sans carte", () => {
    expect(featuredAlbums(albums, clubs, new Set(), 3)).toEqual([]);
  });

  it("classe les albums entamés du plus avancé au moins avancé, sans les terminés", () => {
    const featured = featuredAlbums(albums, clubs, new Set(["a", "b"]), 10);
    // Top 14 et Haute-Garonne sont terminés ; il reste Occitanie (2/3), Tarn (1/2), France (2/4).
    expect(featured.map(({ album }) => album.id)).toEqual([
      "region-occ",
      "departement-81",
      "france",
    ]);
  });

  it("respecte la limite", () => {
    expect(featuredAlbums(albums, clubs, new Set(["a", "b"]), 1)).toHaveLength(
      1,
    );
  });
});
