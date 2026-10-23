import { isGuestOnlyPath, isPublicPath, safeNextPath } from "./routes";

describe("routes d'authentification", () => {
  it("laisse les visiteurs accéder aux pages de connexion et aux retours d'e-mail", () => {
    expect(isPublicPath("/connexion")).toBe(true);
    expect(isPublicPath("/inscription")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
  });

  it("laisse lire les pages légales avec ou sans session", () => {
    expect(isPublicPath("/confidentialite")).toBe(true);
    expect(isPublicPath("/mentions-legales")).toBe(true);
    expect(isGuestOnlyPath("/confidentialite")).toBe(false);
    expect(isPublicPath("/api/cron/notifications")).toBe(true);
  });

  it("protège le jeu et le compte", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/boosters")).toBe(false);
    expect(isPublicPath("/compte/mot-de-passe")).toBe(false);
  });

  it("réserve aux visiteurs les seules pages de connexion", () => {
    expect(isGuestOnlyPath("/connexion")).toBe(true);
    expect(isGuestOnlyPath("/auth/confirm")).toBe(false);
    expect(isGuestOnlyPath("/albums")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("garde un chemin interne", () => {
    expect(safeNextPath("/albums/france")).toBe("/albums/france");
  });

  it.each([
    null,
    undefined,
    "",
    "https://exemple.com",
    "//exemple.com",
    "albums",
    "/\\exemple.com",
  ])("refuse %s et renvoie à l'accueil", (next) => {
    expect(safeNextPath(next)).toBe("/");
  });
});
