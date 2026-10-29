"use server";

import { redirect } from "next/navigation";
import {
  AUTH_CALLBACK_PATH,
  HOME_PATH,
  safeNextPath,
  SIGN_IN_PATH,
  UPDATE_PASSWORD_PATH,
} from "@/lib/supabase/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseForm, type AuthFormState } from "../lib/form-state";
import { authErrorMessage, USERNAME_TAKEN_MESSAGE } from "../lib/messages";
import {
  deleteAccountSchema,
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "../lib/schemas";
import { accountData, isUsernameAvailable, referralData } from "@/data/server";
import { ensurePlayer, getAuthUser } from "./session";

/** Adresse de retour des liens envoyés par e-mail, vers la page `next` du site. */
function callbackUrl(next: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${site}${AUTH_CALLBACK_PATH}?next=${encodeURIComponent(next)}`;
}

export async function signIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseForm(signInSchema, formData);
  if ("state" in parsed) return parsed.state;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      error: authErrorMessage(error.code),
      values: { email: parsed.data.email },
    };
  }

  await ensurePlayer(data.user);
  redirect(safeNextPath(formData.get("next")?.toString()));
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseForm(signUpSchema, formData);
  if ("state" in parsed) return parsed.state;

  const { email, password, username, referralCode } = parsed.data;
  const values = { email, username, referralCode: referralCode ?? "" };
  if (!(await isUsernameAvailable(username))) {
    return { fieldErrors: { username: USERNAME_TAKEN_MESSAGE }, values };
  }
  if (referralCode && !(await referralData.codeExists(referralCode))) {
    return {
      fieldErrors: { referralCode: "Ce code de parrainage n'existe pas." },
      values,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(HOME_PATH),
      // Gardé dans le compte jusqu'à la création du joueur (voir ensurePlayer).
      // Date d'acceptation des CGU et de la déclaration d'âge, comme preuve.
      data: {
        username,
        referralCode: referralCode ?? null,
        termsAcceptedAt: new Date().toISOString(),
      },
    },
  });
  if (error) {
    return { error: authErrorMessage(error.code), values };
  }

  // Sans confirmation d'e-mail exigée, Supabase ouvre la session tout de suite.
  if (data.session && data.user) {
    await ensurePlayer(data.user);
    redirect(HOME_PATH);
  }
  // Même message que le compte existe déjà ou non : on ne révèle pas qui est inscrit.
  return {
    notice: `Un e-mail de confirmation vient d'être envoyé à ${parsed.data.email}. Cliquez sur le lien qu'il contient pour entrer sur le terrain.`,
  };
}

/**
 * Déconnecte le joueur. La redirection se fait côté navigateur par un
 * rechargement complet (voir `SignOutButton`) : Next.js garde sinon les écrans
 * quittés en mémoire, avec l'état du joueur, et les restaurerait au compte
 * suivant.
 */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseForm(forgotPasswordSchema, formData);
  if ("state" in parsed) return parsed.state;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: callbackUrl(UPDATE_PASSWORD_PATH),
    },
  );
  // Seule une limite d'envoi est signalée : toute autre réponse reste identique,
  // pour ne pas révéler si l'adresse a un compte.
  if (error?.code?.startsWith("over_")) {
    return {
      error: authErrorMessage(error.code),
      values: { email: parsed.data.email },
    };
  }
  return {
    notice: `Si un compte existe pour ${parsed.data.email}, un e-mail vient de partir avec un lien pour choisir un nouveau mot de passe.`,
  };
}

export async function updatePassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseForm(updatePasswordSchema, formData);
  if ("state" in parsed) return parsed.state;

  if (!(await getAuthUser()))
    return { error: authErrorMessage("session_not_found") };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: authErrorMessage(error.code) };

  return { notice: "Votre mot de passe est modifié." };
}

/**
 * Supprime définitivement le compte du joueur connecté (RGPD). Le mot de
 * passe est redemandé : une session restée ouverte ne suffit pas.
 */
export async function deleteAccount(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseForm(deleteAccountSchema, formData);
  if ("state" in parsed) return { fieldErrors: parsed.state.fieldErrors };

  const user = await getAuthUser();
  if (!user?.email) return { error: authErrorMessage("session_not_found") };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password,
  });
  if (error) return { fieldErrors: { password: "Mot de passe incorrect." } };

  await accountData.delete(user.id);
  // Le compte n'existe plus : on efface aussi les cookies de session.
  await supabase.auth.signOut().catch(() => undefined);
  // Rechargement complet côté navigateur : rien du compte supprimé ne doit
  // rester en mémoire dans la page (écrans gardés par Next.js).
  return { redirectTo: `${SIGN_IN_PATH}?compte=supprime` };
}
