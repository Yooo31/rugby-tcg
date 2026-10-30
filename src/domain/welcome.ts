/**
 * Offre de bienvenue : une seule fois par compte, un premier achat à petit
 * prix (docs/economie.md, section 3.2). Le premier achat est le plus dur à
 * obtenir ; ensuite, le joueur rachète plus facilement.
 */
export const WELCOME_OFFER = {
  id: "welcome",
  label: "Offre de bienvenue",
  priceCents: 299,
  ingots: 500,
  /** Jours de pass VIP offerts avec les lingots. */
  vipDays: 7,
} as const;
