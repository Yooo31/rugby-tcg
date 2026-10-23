import { z } from "zod";
import { isUsernameAllowed } from "./moderation";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

/**
 * Pseudo public, affiché dans les classements à la place de l'adresse e-mail.
 * Lettres (accents compris), chiffres, tiret, point et tiret bas ; ni espace
 * ni symbole, pour rester lisible et difficile à usurper. L'unicité ne tient
 * pas compte de la casse (vérifiée en base).
 */
export const usernameSchema = z
  .string()
  .trim()
  .min(
    USERNAME_MIN_LENGTH,
    `Le pseudo doit faire au moins ${USERNAME_MIN_LENGTH} caractères.`,
  )
  .max(
    USERNAME_MAX_LENGTH,
    `Le pseudo doit faire au plus ${USERNAME_MAX_LENGTH} caractères.`,
  )
  .regex(
    /^[\p{L}\p{N}._-]+$/u,
    "Lettres, chiffres, point, tiret et tiret bas uniquement.",
  )
  .refine(isUsernameAllowed, "Ce pseudo n'est pas autorisé.");

export type Username = z.infer<typeof usernameSchema>;

export class UsernameTakenError extends Error {
  constructor() {
    super("Ce pseudo est déjà pris.");
    this.name = "UsernameTakenError";
  }
}
