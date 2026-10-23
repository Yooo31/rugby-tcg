/** Générateur de nombres dans [0, 1[, comme Math.random. Injecté pour rester testable. */
export type Rng = () => number;

/** Générateur déterministe (mulberry32) : même graine, même suite. */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Empreinte entière stable d'une chaîne (FNV-1a), utile comme graine. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** 2^32 : ramène un entier non signé de 32 bits dans [0, 1[. */
const UINT32_RANGE = 2 ** 32;

/**
 * Générateur cryptographique, pour les tirages qui comptent (boosters côté
 * serveur) : `Math.random` n'est pas fait pour résister à la prédiction.
 */
export const secureRng: Rng = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] / UINT32_RANGE;
