/**
 * Couleurs de maillot, nommées comme les clubs les nomment : c'est ce qui rend
 * les fiches d'identité relisibles (« jaune et bleu » plutôt que des codes).
 * Ces teintes sont des données de clubs, pas des tokens d'interface.
 */
export const CLUB_PALETTE = {
  blanc: "#f5f5f5",
  noir: "#111111",
  gris: "#8a9aa6",
  rouge: "#c8102e",
  "rouge vif": "#e1000f",
  grenat: "#7a1f3d",
  bordeaux: "#6d1a36",
  rose: "#e6007e",
  orange: "#ff6a13",
  jaune: "#ffd100",
  or: "#f2c14e",
  vert: "#00843d",
  "vert foncé": "#0b5d33",
  "vert clair": "#5cb85c",
  "bleu ciel": "#6cace4",
  bleu: "#0055a4",
  "bleu roi": "#0033a0",
  "bleu marine": "#0b2a5b",
  violet: "#6a1b9a",
  mauve: "#9b6bc9",
  marron: "#6b3e26",
  noisette: "#9c6b3f",
} as const;

export type ClubColorName = keyof typeof CLUB_PALETTE;
