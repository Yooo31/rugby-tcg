import { expect, test } from "@playwright/test";
import { PASSWORD, signIn, signUp, uniquePlayer } from "./helpers";

test("un second compte sur le même navigateur ne voit rien du premier", async ({
  page,
}) => {
  // Compte A : récupère la série (10 lingots) et ouvre un booster.
  const first = uniquePlayer("Premier");
  await signUp(page, first);
  await page
    .getByRole("region", { name: "Jour 1" })
    .getByRole("button", { name: "Récupérer" })
    .click();
  await expect(page.getByRole("link", { name: /^10 lingots/ })).toBeVisible();
  await page.goto("/boosters");
  await page.getByRole("button", { name: "Ouvrir le booster" }).click();
  await page.getByRole("button", { name: "Tout révéler" }).click();
  await expect(
    page.getByRole("heading", { name: "Essai transformé" }),
  ).toBeVisible();

  // Déconnexion depuis le compte.
  await page.goto("/compte");
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();

  // Compte B : tout doit repartir de zéro.
  const second = uniquePlayer("Second");
  await signUp(page, second);
  await expect(page.getByRole("link", { name: /^0 lingots/ })).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Jour 1" })
      .getByRole("button", { name: "Récupérer" }),
  ).toBeVisible();
  await page.goto("/collection");
  await expect(page.getByRole("button", { name: /, carte / })).toHaveCount(0);
  await page.goto("/compte");
  await expect(page.getByText(second.username)).toBeVisible();
  await expect(page.getByText(first.username)).toHaveCount(0);
});

test("se connecter à un compte existant après un autre ne montre que le sien", async ({
  page,
  browser,
}) => {
  // Compte B créé ailleurs (autre navigateur), sans jouer.
  const second = uniquePlayer("Existant");
  const elsewhere = await browser.newContext();
  await signUp(await elsewhere.newPage(), second);
  await elsewhere.close();

  // Compte A joue sur ce navigateur.
  const first = uniquePlayer("Joueur");
  await signUp(page, first);
  await page
    .getByRole("region", { name: "Jour 1" })
    .getByRole("button", { name: "Récupérer" })
    .click();
  await expect(page.getByRole("link", { name: /^10 lingots/ })).toBeVisible();

  await page.goto("/compte");
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();

  // Connexion à B : son solde et sa série, pas ceux de A.
  await signIn(page, second);
  await expect(page.getByRole("link", { name: /^0 lingots/ })).toBeVisible();
  await page.goto("/compte");
  await expect(page.getByText(second.username)).toBeVisible();
});

test("changer de compte sans recharger la page ne montre que le second", async ({
  page,
  browser,
}) => {
  const second = uniquePlayer("Sans");
  const elsewhere = await browser.newContext();
  await signUp(await elsewhere.newPage(), second);
  await elsewhere.close();

  const first = uniquePlayer("Avec");
  await signUp(page, first);
  await page
    .getByRole("region", { name: "Jour 1" })
    .getByRole("button", { name: "Récupérer" })
    .click();
  await expect(page.getByRole("link", { name: /^10 lingots/ })).toBeVisible();

  // Tout en navigation interne, comme un joueur : aucun rechargement.
  await page.getByRole("link", { name: "Mon compte" }).click();
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await page.getByLabel("Adresse e-mail").fill(second.email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(
    page.getByRole("heading", { name: "Jour de match" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^0 lingots/ })).toBeVisible();
  await page.getByRole("link", { name: "Mon compte" }).click();
  await expect(page.getByText(second.username)).toBeVisible();
  await expect(page.getByText(first.username)).toHaveCount(0);
});
