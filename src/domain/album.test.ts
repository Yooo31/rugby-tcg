import { makeClub } from "@/test/fixtures";
import {
  albumClubs,
  albumProgress,
  buildPermanentAlbums,
  clubMatchesRule,
  FRANCE_ALBUM_ID,
  type Album,
} from "./album";

const toulouse = makeClub({
  id: "toulouse",
  division: "top14",
  department: "31",
});
const castres = makeClub({
  id: "castres",
  division: "top14",
  department: "81",
});
const cugnaux = makeClub({
  id: "cugnaux",
  division: "regionale3",
  department: "31",
});
const bayonne = makeClub({
  id: "bayonne",
  division: "top14",
  department: "64",
});
const clubs = [toulouse, castres, cugnaux, bayonne];

const albums = buildPermanentAlbums(clubs);
const albumById = (id: string) =>
  albums.find((album) => album.id === id) as Album;

describe("clubMatchesRule", () => {
  it("applique chaque type de règle", () => {
    expect(clubMatchesRule(cugnaux, { type: "all" })).toBe(true);
    expect(
      clubMatchesRule(cugnaux, { type: "division", division: "top14" }),
    ).toBe(false);
    expect(
      clubMatchesRule(cugnaux, { type: "department", department: "31" }),
    ).toBe(true);
    expect(clubMatchesRule(castres, { type: "region", region: "occ" })).toBe(
      true,
    );
    expect(clubMatchesRule(bayonne, { type: "region", region: "occ" })).toBe(
      false,
    );
  });
});

describe("buildPermanentAlbums", () => {
  it("ne crée que les albums pour lesquels des clubs existent", () => {
    expect(albums.map((album) => album.id)).toEqual([
      FRANCE_ALBUM_ID,
      "division-top14",
      "division-regionale3",
      "region-naq",
      "region-occ",
      "departement-31",
      "departement-64",
      "departement-81",
    ]);
  });

  it("range un même club dans plusieurs albums", () => {
    const containingToulouse = albums.filter((album) =>
      albumClubs(album, clubs).includes(toulouse),
    );
    expect(containingToulouse.map((album) => album.id)).toEqual([
      FRANCE_ALBUM_ID,
      "division-top14",
      "region-occ",
      "departement-31",
    ]);
  });
});

describe("albumProgress", () => {
  it("compte les clubs possédés parmi ceux de l'album", () => {
    const progress = albumProgress(
      albumById("region-occ"),
      clubs,
      new Set(["toulouse", "bayonne"]),
    );
    expect(progress).toEqual({
      owned: 1,
      total: 3,
      ratio: 1 / 3,
      isComplete: false,
    });
  });

  it("signale un album terminé", () => {
    const progress = albumProgress(
      albumById("departement-31"),
      clubs,
      new Set(["toulouse", "cugnaux"]),
    );
    expect(progress.isComplete).toBe(true);
    expect(progress.ratio).toBe(1);
  });

  it("ne considère jamais un album vide comme terminé", () => {
    const empty: Album = {
      ...albumById(FRANCE_ALBUM_ID),
      rule: { type: "department", department: "75" },
    };
    expect(albumProgress(empty, clubs, new Set())).toEqual({
      owned: 0,
      total: 0,
      ratio: 0,
      isComplete: false,
    });
  });
});
