import { z } from "zod";
import { referralCodeSchema, usernameSchema } from "@/domain";

/** Longueur minimale du mot de passe, rappelée à l'écran. */
export const MIN_PASSWORD_LENGTH = 8;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Saisissez une adresse e-mail valide."));

const newPassword = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`,
  )
  .max(72, "Le mot de passe est trop long.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

export const signUpSchema = z.object({
  username: usernameSchema,
  email,
  password: newPassword,
  /** Facultatif : vide si le joueur n'a pas de parrain. */
  referralCode: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .pipe(referralCodeSchema.optional()),
});

export const forgotPasswordSchema = z.object({ email });

export const updatePasswordSchema = z.object({ password: newPassword });

/** Mot à recopier pour confirmer la suppression du compte. */
export const DELETE_CONFIRMATION = "SUPPRIMER";

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Saisissez votre mot de passe."),
  confirmation: z
    .string()
    .trim()
    .refine(
      (value) => value.toUpperCase() === DELETE_CONFIRMATION,
      `Recopiez ${DELETE_CONFIRMATION} pour confirmer.`,
    ),
});
