import type { z } from "zod";

/** État d'un formulaire d'authentification, renvoyé par son action serveur. */
export interface AuthFormState {
  /** Erreur générale, affichée sous le formulaire. */
  readonly error?: string;
  /** Erreurs par champ. */
  readonly fieldErrors?: Readonly<Record<string, string>>;
  /** Confirmation à afficher à la place du formulaire (e-mail envoyé…). */
  readonly notice?: string;
  /** Valeurs à remettre dans les champs après une erreur (jamais le mot de passe). */
  readonly values?: Readonly<Record<string, string>>;
}

export const INITIAL_AUTH_FORM_STATE: AuthFormState = {};

/** Champs jamais renvoyés au navigateur. */
const SECRET_FIELDS = new Set(["password"]);

type Parsed<T> = { readonly data: T } | { readonly state: AuthFormState };

/** Valide un formulaire ; en cas d'échec, renvoie l'état à afficher (première erreur de chaque champ). */
export function parseForm<T>(
  schema: z.ZodType<T>,
  formData: FormData,
): Parsed<T> {
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string"),
  ) as Record<string, string>;

  const result = schema.safeParse(raw);
  if (result.success) return { data: result.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in fieldErrors)) fieldErrors[field] = issue.message;
  }
  // On rend tout ce qui a été saisi, sauf les mots de passe.
  const values = Object.fromEntries(
    Object.entries(raw).filter(([field]) => !SECRET_FIELDS.has(field)),
  );
  return { state: { fieldErrors, values } };
}
