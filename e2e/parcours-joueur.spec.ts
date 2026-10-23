import { expect, test } from "@playwright/test";
import { signUp, uniquePlayer } from "./helpers";

test("un nouveau joueur s'inscrit, ouvre un booster et entre au classement", async ({
  page,
}) => {
  const player = uniquePlayer();
  await signUp(page, player);

  // Série de connexion : la récompense du premier jour.
  const streak = page.getByRole("region", { name: "Jour 1" });
  await streak.getByRole("button", { name: "Récupérer" }).click();
  await expect(streak.getByText("Récupéré")).toBeVisible();

  // Ouverture d'un booster gratuit.
  await page.goto("/boosters");
  await page.getByRole("button", { name: "Ouvrir le booster" }).click();
  await page.getByRole("button", { name: "Tout révéler" }).click();
  await expect(
    page.getByRole("heading", { name: "Essai transformé" }),
  ).toBeVisible();

  // Les cartes sont rangées dans la collection.
  await page.goto("/collection");
  await expect(
    page.getByRole("button", { name: /, carte / }).first(),
  ).toBeVisible();

  // Le joueur apparaît au classement, sous son pseudo.
  await page.goto("/classement");
  const board = page.getByRole("list", { name: "Classement" });
  await expect(board.getByText(`${player.username} (vous)`)).toBeVisible();

  // Ses données se téléchargent (RGPD), sans rien d'un autre joueur.
  const response = await page.request.get("/compte/donnees");
  expect(response.status()).toBe(200);
  const data = (await response.json()) as {
    account: { email: string };
    player: { username: string; boosterOpenings: unknown[] };
  };
  expect(data.account.email).toBe(player.email);
  expect(data.player.username).toBe(player.username);
  expect(data.player.boosterOpenings).toHaveLength(1);
});

test("un visiteur sans compte est renvoyé vers la connexion", async ({
  page,
}) => {
  await page.goto("/collection");
  await expect(page).toHaveURL(/\/connexion\?next=%2Fcollection/);
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
});
