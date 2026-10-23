import { expect, type Page } from "@playwright/test";

/** Mot de passe des comptes de test (base locale jetable uniquement). */
const PASSWORD = "MotDePasseDeTest-2026";

/** Pseudo et adresse uniques, pour que les tests ne se gênent pas entre eux. */
export function uniquePlayer(prefix = "Joueur") {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return {
    username: `${prefix}_${id}`.slice(0, 20),
    email: `${prefix.toLowerCase()}-${id}@rugby-tcg.test`,
  };
}

/**
 * Se connecte avec ce compte, ou le crée s'il n'existe pas encore (la base
 * locale garde les comptes d'une exécution à l'autre).
 */
export async function signInOrSignUp(
  page: Page,
  player: { readonly username: string; readonly email: string },
) {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(player.email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const home = page.getByRole("heading", { name: "Jour de match" });
  const refused = page.getByRole("alert").filter({ hasText: /incorrect/ });
  await expect(home.or(refused)).toBeVisible();
  if (await refused.isVisible()) await signUp(page, player);
}

/** Crée un compte depuis l'écran d'inscription et arrive sur l'accueil. */
export async function signUp(
  page: Page,
  player: { readonly username: string; readonly email: string },
) {
  await page.goto("/inscription");
  await page.getByLabel("Pseudo").fill(player.username);
  await page.getByLabel("Adresse e-mail").fill(player.email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(
    page.getByRole("heading", { name: "Jour de match" }),
  ).toBeVisible();
}
