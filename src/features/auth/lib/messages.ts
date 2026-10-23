/** Message générique : on ne détaille jamais une erreur que l'on ne connaît pas. */
export const UNKNOWN_ERROR =
  "Une erreur est survenue. Réessayez dans un instant.";

/** Messages affichés au joueur, par code d'erreur de Supabase Auth. */
const MESSAGES: Readonly<Record<string, string>> = {
  invalid_credentials: "Adresse e-mail ou mot de passe incorrect.",
  email_not_confirmed:
    "Confirmez votre adresse grâce au lien reçu par e-mail avant de vous connecter.",
  user_already_exists:
    "Un compte existe déjà avec cette adresse. Connectez-vous.",
  email_exists: "Un compte existe déjà avec cette adresse. Connectez-vous.",
  weak_password:
    "Ce mot de passe est trop fragile. Choisissez-en un plus long ou moins courant.",
  same_password: "Choisissez un mot de passe différent de l'actuel.",
  over_email_send_rate_limit:
    "Trop d'e-mails envoyés. Patientez quelques minutes avant de réessayer.",
  over_request_rate_limit:
    "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
  email_address_invalid: "Cette adresse e-mail n'est pas acceptée.",
  signup_disabled: "Les inscriptions sont fermées pour le moment.",
  session_not_found: "Votre session a expiré. Reconnectez-vous.",
};

export function authErrorMessage(code: string | undefined): string {
  return (code && MESSAGES[code]) || UNKNOWN_ERROR;
}

/** Pseudo déjà pris par un autre joueur (on peut le dire : un pseudo est public). */
export const USERNAME_TAKEN_MESSAGE =
  "Ce pseudo est déjà pris. Choisissez-en un autre.";
