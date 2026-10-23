import { expect, test } from "@playwright/test";
import { E2E_ADMIN_EMAIL } from "../scripts/e2e/env.mjs";
import { signInOrSignUp, signUp, uniquePlayer } from "./helpers";

test("l'administration est introuvable pour un joueur", async ({ page }) => {
  await signUp(page, uniquePlayer());
  await page.goto("/admin");
  await expect(
    page.getByText(/introuvable|could not be found|404/i).first(),
  ).toBeVisible();
  await expect(page.getByText("Joueurs et ouvertures")).toHaveCount(0);
});

test("un administrateur voit le tableau de bord", async ({
  page,
}, testInfo) => {
  // Un seul compte administrateur possible : un seul projet l'utilise.
  test.skip(testInfo.project.name !== "bureau", "compte administrateur unique");
  await signInOrSignUp(page, {
    username: "Arbitre_e2e",
    email: E2E_ADMIN_EMAIL,
  });
  await page.goto("/admin");
  await expect(page.getByText("Joueurs et ouvertures")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rétention" })).toBeVisible();
});
