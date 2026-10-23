import type { z } from "zod";

/** Stockage clé-valeur minimal (interface de `localStorage`) : en mémoire pour les tests. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createMemoryStore(): KeyValueStore {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
}

/** Lit et valide une valeur ; toute donnée absente ou corrompue donne `fallback`. */
export function readJson<T>(
  store: KeyValueStore,
  key: string,
  schema: z.ZodType<T>,
  fallback: T,
): T {
  const raw = store.getItem(key);
  if (raw === null) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(
  store: KeyValueStore,
  key: string,
  value: unknown,
): void {
  store.setItem(key, JSON.stringify(value));
}
