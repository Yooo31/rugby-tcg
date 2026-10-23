import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

/** Identifie le script auprès des serveurs, comme le demandent Wikipédia et Wikidata. */
const USER_AGENT = "rugby-tcg-import/0.1 (import de clubs de rugby)";
/** Pause entre deux requêtes : l'import n'est pas pressé, les serveurs sont partagés. */
const PAUSE_MS = 3000;
const MAX_ATTEMPTS = 5;
const CACHE_DIR = ".cache/import-clubs";

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Requête GET qui renvoie du JSON. Les réponses sont gardées sur disque
 * (`.cache/import-clubs`) : relancer l'import ne sollicite pas les serveurs
 * une seconde fois. Supprimer ce dossier force une récupération fraîche.
 */
export async function getJson<T>(
  url: string,
  accept = "application/json",
): Promise<T> {
  const cacheFile = `${CACHE_DIR}/${createHash("sha1").update(url).digest("hex")}.json`;
  try {
    return JSON.parse(await readFile(cacheFile, "utf8")) as T;
  } catch {
    // Pas encore en cache : on interroge le serveur.
  }

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: accept },
    });
    if (response.ok) {
      const text = await response.text();
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(cacheFile, text);
      await sleep(PAUSE_MS);
      return JSON.parse(text) as T;
    }
    if (response.status !== 429 || attempt === MAX_ATTEMPTS) {
      throw new Error(`${response.status} ${response.statusText} pour ${url}`);
    }
    // Le serveur demande de ralentir : on attend le délai qu'il indique.
    const retryAfter =
      Number(response.headers.get("Retry-After")) || 15 * attempt;
    await sleep(retryAfter * 1000);
  }
}

/** Découpe une liste en lots de taille fixe. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}
