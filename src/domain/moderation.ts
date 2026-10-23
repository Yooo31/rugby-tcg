/**
 * Modération des pseudos, publics dans les classements : insultes, propos
 * haineux et usurpation (se faire passer pour l'équipe du jeu ou la FFR).
 *
 * Volontairement simple : une liste, sans prétention d'exhaustivité. Le
 * dernier mot revient à l'administration, qui peut réinitialiser un pseudo.
 */

/** Chiffres et symboles souvent utilisés pour déguiser une lettre. */
const LEET: Readonly<Record<string, string>> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

/** Minuscules, sans accents, chiffres déguisés remis en lettres. */
export function normalizeForModeration(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[013457@$]/g, (char) => LEET[char] ?? char);
}

/** Mots assez longs pour être cherchés n'importe où dans le pseudo. */
const BLOCKED_ANYWHERE = [
  "connard",
  "connasse",
  "salope",
  "salaud",
  "encule",
  "batard",
  "putain",
  "petasse",
  "pouffiasse",
  "niquer",
  "niquetamere",
  "tamere",
  "fils2pute",
  "filsdepute",
  "pede",
  "tapette",
  "negro",
  "negre",
  "bougnoul",
  "youpin",
  "bicot",
  "nazi",
  "hitler",
  "branleur",
  "couille",
  "nigger",
  "nigga",
  "faggot",
  "bitch",
  "fuck",
  "porno",
  // Usurpation
  "admin",
  "moderat",
  "rugbytcg",
  "officiel",
];

/** Mots courts, bloqués seulement quand ils forment un mot entier (« con », pas « Concarneau »). */
const BLOCKED_WORDS = new Set([
  "con",
  "cons",
  "pd",
  "fdp",
  "ntm",
  "tg",
  "pute",
  "putes",
  "bite",
  "cul",
  "chatte",
  "merde",
  "nique",
  "sexe",
  "sex",
  "shit",
  "cunt",
  "dick",
  "modo",
  "staff",
  "ffr",
]);

export function isUsernameAllowed(username: string): boolean {
  const normalized = normalizeForModeration(username);
  const compact = normalized.replace(/[^a-z]/g, "");
  if (BLOCKED_ANYWHERE.some((word) => compact.includes(word))) return false;
  const words = normalized.split(/[^a-z]+/).filter(Boolean);
  return !words.some((word) => BLOCKED_WORDS.has(word));
}
