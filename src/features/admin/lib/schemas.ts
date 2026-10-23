import { z } from "zod";
import { adjustmentSchema, MAX_ADJUSTMENT } from "@/domain";
import { nextDayKey, parisMidnight } from "@/lib/dates";

/** Un nombre saisi dans un formulaire ; vide vaut 0. */
const formInteger = (max: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? 0 : Number(value)))
    .pipe(
      z
        .number({ error: "Saisissez un nombre entier." })
        .int("Saisissez un nombre entier.")
        .min(-max, `Au plus ${max} à la fois.`)
        .max(max, `Au plus ${max} à la fois.`),
    );

/** Formulaire de correction d'un joueur. */
export const adjustmentFormSchema = z
  .object({
    ingotsDelta: formInteger(MAX_ADJUSTMENT),
    boostersDelta: formInteger(MAX_ADJUSTMENT),
    reason: z.string(),
  })
  .pipe(adjustmentSchema);

/** Plus grand cadeau admis : garde-fou contre une faute de frappe. */
const MAX_GIVEAWAY_INGOTS = 10_000;
const MAX_GIVEAWAY_BOOSTERS = 50;

const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date.");

/**
 * Formulaire de cadeau. Les dates sont des jours entiers à l'heure de Paris :
 * du premier jour à minuit jusqu'au lendemain du dernier jour à minuit.
 */
export const giveawayFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Donnez un titre au cadeau.")
      .max(80, "Titre trop long (80 caractères au plus)."),
    ingots: formInteger(MAX_GIVEAWAY_INGOTS).pipe(
      z.number().min(0, "Pas de cadeau négatif."),
    ),
    boosters: formInteger(MAX_GIVEAWAY_BOOSTERS).pipe(
      z.number().min(0, "Pas de cadeau négatif."),
    ),
    startDay: dayKey,
    endDay: dayKey,
  })
  .refine(({ ingots, boosters }) => ingots + boosters > 0, {
    message: "Offrez des lingots ou des boosters.",
    path: ["ingots"],
  })
  .refine(({ startDay, endDay }) => endDay >= startDay, {
    message: "Le dernier jour doit suivre le premier.",
    path: ["endDay"],
  })
  .transform((form, context) => {
    const startsAt = parisMidnight(form.startDay);
    const endsAt = parisMidnight(nextDayKey(form.endDay));
    if (startsAt === null || endsAt === null) {
      context.addIssue({
        code: "custom",
        message: "Date invalide.",
        path: ["startDay"],
      });
      return z.NEVER;
    }
    return {
      title: form.title,
      ingots: form.ingots,
      boosters: form.boosters,
      startsAt,
      endsAt,
    };
  });

/** État d'un formulaire d'administration, renvoyé par son action serveur. */
export interface AdminFormState {
  readonly error?: string;
  readonly fieldErrors?: Readonly<Record<string, string>>;
  readonly success?: string;
}

export const INITIAL_ADMIN_FORM_STATE: AdminFormState = {};

/** Première erreur de chaque champ, pour l'afficher sous le champ. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    if (!(field in errors)) errors[field] = issue.message;
  }
  return errors;
}
