import { z } from "zod";
import {
  adjustmentSchema,
  MAX_ADJUSTMENT,
  MAX_PROMOTION_PERCENT,
} from "@/domain";
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

/** Titre d'un cadeau ou d'une saison. */
const titleField = (missing: string) =>
  z
    .string()
    .trim()
    .min(3, missing)
    .max(80, "Titre trop long (80 caractères au plus).");

const period = { startDay: dayKey, endDay: dayKey };

/** Le dernier jour suit le premier. */
const endsAfterStart = ({
  startDay,
  endDay,
}: {
  readonly startDay: string;
  readonly endDay: string;
}) => endDay >= startDay;
const ENDS_AFTER_START = {
  message: "Le dernier jour doit suivre le premier.",
  path: ["endDay"],
};

/**
 * Jours entiers à l'heure de Paris : du premier jour à minuit jusqu'au
 * lendemain du dernier jour à minuit. `null` (avec une erreur) si une date
 * est invalide.
 */
function parisPeriod(
  form: { readonly startDay: string; readonly endDay: string },
  context: z.RefinementCtx,
): { readonly startsAt: number; readonly endsAt: number } | null {
  const startsAt = parisMidnight(form.startDay);
  const endsAt = parisMidnight(nextDayKey(form.endDay));
  if (startsAt !== null && endsAt !== null) return { startsAt, endsAt };
  context.addIssue({
    code: "custom",
    message: "Date invalide.",
    path: ["startDay"],
  });
  return null;
}

/** Formulaire de cadeau, sur des jours entiers à l'heure de Paris. */
export const giveawayFormSchema = z
  .object({
    title: titleField("Donnez un titre au cadeau."),
    ingots: formInteger(MAX_GIVEAWAY_INGOTS).pipe(
      z.number().min(0, "Pas de cadeau négatif."),
    ),
    boosters: formInteger(MAX_GIVEAWAY_BOOSTERS).pipe(
      z.number().min(0, "Pas de cadeau négatif."),
    ),
    ...period,
  })
  .refine(({ ingots, boosters }) => ingots + boosters > 0, {
    message: "Offrez des lingots ou des boosters.",
    path: ["ingots"],
  })
  .refine(endsAfterStart, ENDS_AFTER_START)
  .transform((form, context) => {
    const dates = parisPeriod(form, context);
    if (!dates) return z.NEVER;
    return {
      title: form.title,
      ingots: form.ingots,
      boosters: form.boosters,
      ...dates,
    };
  });

/**
 * Formulaire de saison : un titre et des jours entiers à l'heure de Paris,
 * comme un cadeau (huit semaines conseillées).
 */
export const seasonFormSchema = z
  .object({ title: titleField("Donnez un titre à la saison."), ...period })
  .refine(endsAfterStart, ENDS_AFTER_START)
  .transform((form, context) => {
    const dates = parisPeriod(form, context);
    if (!dates) return z.NEVER;
    return { title: form.title, ...dates };
  });

/** Formulaire de promotion : un titre, une réduction et des jours entiers. */
export const promotionFormSchema = z
  .object({
    title: titleField("Donnez un titre à la promotion."),
    percentOff: formInteger(MAX_PROMOTION_PERCENT).pipe(
      z.number().min(1, "Au moins 1 %."),
    ),
    ...period,
  })
  .refine(endsAfterStart, ENDS_AFTER_START)
  .transform((form, context) => {
    const dates = parisPeriod(form, context);
    if (!dates) return z.NEVER;
    return { title: form.title, percentOff: form.percentOff, ...dates };
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
