"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, type ReactNode } from "react";
import { TextField } from "@/components/ui/text-field";
import {
  MINIMUM_AGE,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/domain";
import {
  FORGOT_PASSWORD_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  TERMS_OF_USE_PATH,
} from "@/lib/supabase/routes";
import { MIN_PASSWORD_LENGTH } from "../lib/schemas";
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
} from "../server/actions";
import { AuthForm } from "./AuthForm";

interface AuthCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="text-chalk-muted mt-2 text-sm text-pretty">{subtitle}</p>
      </header>
      {children}
      {footer ? (
        <p className="text-chalk-muted text-center text-sm">{footer}</p>
      ) : null}
    </div>
  );
}

const linkClass = "text-pitch font-medium underline-offset-4 hover:underline";
const passwordHint = `${MIN_PASSWORD_LENGTH} caractères au minimum.`;

export function SignInScreen() {
  const searchParams = useSearchParams();
  const hasInvalidLink = searchParams.get("lien") === "invalide";
  const wasDeleted = searchParams.get("compte") === "supprime";

  return (
    <AuthCard
      title="Connexion"
      subtitle="Retrouvez votre collection et vos boosters."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href={SIGN_UP_PATH} className={linkClass}>
            Créer un compte
          </Link>
        </>
      }
    >
      {wasDeleted ? (
        <p
          role="status"
          className="border-line-strong rounded-control border p-3 text-sm"
        >
          Votre compte et toutes vos données ont été supprimés. À bientôt sur le
          terrain.
        </p>
      ) : null}
      {hasInvalidLink ? (
        <p
          role="alert"
          className="border-danger/50 text-danger rounded-control border p-3 text-sm"
        >
          Ce lien n&apos;est plus valable. Connectez-vous, ou demandez-en un
          nouveau.
        </p>
      ) : null}
      <AuthForm action={signIn} submitLabel="Se connecter">
        {(state) => (
          <>
            <input
              type="hidden"
              name="next"
              value={searchParams.get("next") ?? ""}
            />
            <TextField
              label="Adresse e-mail"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              defaultValue={state.values?.email}
              error={state.fieldErrors?.email}
            />
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              error={state.fieldErrors?.password}
            />
            <Link
              href={FORGOT_PASSWORD_PATH}
              className={`${linkClass} -mt-1 self-end text-sm`}
            >
              Mot de passe oublié ?
            </Link>
          </>
        )}
      </AuthForm>
    </AuthCard>
  );
}

export function SignUpScreen() {
  // Lien de parrainage : /inscription?parrain=CODE
  const searchParams = useSearchParams();
  const sponsorCode = searchParams.get("parrain") ?? "";
  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Gratuit. Vos premiers boosters vous attendent."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href={SIGN_IN_PATH} className={linkClass}>
            Se connecter
          </Link>
        </>
      }
    >
      <AuthForm action={signUp} submitLabel="Créer mon compte">
        {(state) => (
          <>
            <TextField
              label="Pseudo"
              name="username"
              autoComplete="username"
              required
              minLength={USERNAME_MIN_LENGTH}
              maxLength={USERNAME_MAX_LENGTH}
              hint="Affiché dans les classements. Lettres, chiffres, point et tirets."
              defaultValue={state.values?.username}
              error={state.fieldErrors?.username}
            />
            <TextField
              label="Adresse e-mail"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              defaultValue={state.values?.email}
              error={state.fieldErrors?.email}
            />
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              hint={passwordHint}
              error={state.fieldErrors?.password}
            />
            <TextField
              label="Code de parrainage (facultatif)"
              name="referralCode"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={10}
              defaultValue={state.values?.referralCode ?? sponsorCode}
              hint="Un booster offert à l'inscription."
              error={state.fieldErrors?.referralCode}
            />
            <TermsCheckbox error={state.fieldErrors?.acceptsTerms} />
          </>
        )}
      </AuthForm>
    </AuthCard>
  );
}

/** Déclaration d'âge et acceptation des CGU, obligatoires pour s'inscrire. */
function TermsCheckbox({ error }: { readonly error?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex min-h-11 items-start gap-3 text-sm text-pretty"
      >
        <input
          id={id}
          name="acceptsTerms"
          type="checkbox"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="accent-pitch mt-0.5 size-5 shrink-0"
        />
        <span>
          J&apos;ai {MINIMUM_AGE} ans ou plus et j&apos;accepte les{" "}
          <Link href={TERMS_OF_USE_PATH} target="_blank" className={linkClass}>
            conditions d&apos;utilisation
          </Link>
          .
        </span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ForgotPasswordScreen() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Indiquez votre adresse : nous vous envoyons un lien pour en choisir un nouveau."
      footer={
        <Link href={SIGN_IN_PATH} className={linkClass}>
          Retour à la connexion
        </Link>
      }
    >
      <AuthForm action={requestPasswordReset} submitLabel="Envoyer le lien">
        {(state) => (
          <TextField
            label="Adresse e-mail"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue={state.values?.email}
            error={state.fieldErrors?.email}
          />
        )}
      </AuthForm>
    </AuthCard>
  );
}

/** Formulaire de changement de mot de passe, pour un joueur déjà connecté. */
export function UpdatePasswordForm() {
  return (
    <AuthForm action={updatePassword} submitLabel="Enregistrer">
      {(state) => (
        <TextField
          label="Nouveau mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          hint={passwordHint}
          error={state.fieldErrors?.password}
        />
      )}
    </AuthForm>
  );
}
