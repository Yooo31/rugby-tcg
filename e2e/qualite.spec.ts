import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { signUp, uniquePlayer } from "./helpers";

const GAME_PAGES = [
  "/",
  "/boosters",
  "/collection",
  "/albums",
  "/missions",
  "/classement",
  "/boutique",
  "/saison",
  "/vip",
  "/compte",
];
const PUBLIC_PAGES = [
  "/connexion",
  "/inscription",
  "/confidentialite",
  "/mentions-legales",
  "/cgu",
  "/cgv",
  "/probabilites",
];

/** Erreurs de console et violations de la politique de sécurité du contenu. */
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** Violations d'accessibilité graves ou critiques (WCAG A et AA). */
async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations
    .filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    )
    .map(
      (violation) =>
        `${violation.id} : ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
    );
}

test("les pages publiques sont accessibles et sans erreur", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await seriousViolations(page), path).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("les pages du jeu sont accessibles et sans erreur", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await signUp(page, uniquePlayer());
  for (const path of GAME_PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await seriousViolations(page), path).toEqual([]);
  }
  expect(errors).toEqual([]);
});
