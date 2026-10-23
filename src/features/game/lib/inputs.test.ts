import { createCatalogRepositories } from "@/data";
import { MISSION_POOL } from "@/domain";
import { offerIdSchema, rewardIdSchema } from "./inputs";

describe("validation des paramètres d'action", () => {
  it("accepte tous les identifiants d'album et de mission du jeu", async () => {
    const albums = await createCatalogRepositories().albums.list();
    for (const { id } of [...albums, ...MISSION_POOL])
      expect(rewardIdSchema.safeParse(id).success, id).toBe(true);
  });

  it("refuse ce qui ne ressemble pas à un identifiant", () => {
    for (const value of [42, "", "x".repeat(101), "DROP TABLE", "../a"])
      expect(rewardIdSchema.safeParse(value).success).toBe(false);
  });

  it("n'accepte que les offres de la boutique", () => {
    expect(offerIdSchema.safeParse("pack").success).toBe(true);
    expect(offerIdSchema.safeParse("gratuit").success).toBe(false);
  });
});
