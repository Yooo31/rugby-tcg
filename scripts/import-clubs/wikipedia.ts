import { chunk, getJson } from "./http";
import { parseWikiLink, type WikiLink } from "./parse";

const API = "https://fr.wikipedia.org/w/api.php";

function call<T>(params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams({
    format: "json",
    formatversion: "2",
    ...params,
  });
  return getJson<T>(`${API}?${query}`);
}

/** Texte source d'une page. */
export async function fetchWikitext(title: string): Promise<string> {
  const data = await call<{ parse?: { wikitext: string } }>({
    action: "parse",
    page: title,
    prop: "wikitext",
    redirects: "1",
  });
  if (!data.parse) throw new Error(`Page Wikipédia introuvable : ${title}`);
  return data.parse.wikitext;
}

const CODES_PER_CALL = 40;

/**
 * Traduit les codes courts des clubs (« ru Pau ») en lien vers leur article,
 * en faisant développer par Wikipédia le modèle qui les définit.
 */
export async function resolveClubCodes(
  codes: readonly string[],
): Promise<Map<string, WikiLink>> {
  const links = new Map<string, WikiLink>();
  for (const batch of chunk(codes, CODES_PER_CALL)) {
    const text = batch
      .map((code, index) => `@@${index}@@{{chemin équipes rugby à XV|${code}}}`)
      .join("\n");
    const data = await call<{ expandtemplates: { wikitext: string } }>({
      action: "expandtemplates",
      text,
      prop: "wikitext",
    });
    const parts = data.expandtemplates.wikitext.split(/@@(\d+)@@/).slice(1);
    for (let index = 0; index < parts.length; index += 2) {
      const link = parseWikiLink(parts[index + 1]);
      if (link) links.set(batch[Number(parts[index])], link);
    }
  }
  return links;
}

interface PageQuery {
  readonly query: {
    readonly normalized?: readonly { from: string; to: string }[];
    readonly redirects?: readonly { from: string; to: string }[];
    readonly pages: readonly {
      readonly title: string;
      readonly pageprops?: { wikibase_item?: string };
      readonly revisions?: readonly { slots: { main: { content: string } } }[];
    }[];
  };
}

const TITLES_PER_CALL = 40;

/** Suit les normalisations et redirections pour retrouver le titre final de chaque page. */
function finalTitles(
  query: PageQuery["query"],
  titles: readonly string[],
): Map<string, string> {
  const moves = new Map<string, string>();
  for (const { from, to } of [
    ...(query.normalized ?? []),
    ...(query.redirects ?? []),
  ]) {
    moves.set(from, to);
  }
  return new Map(
    titles.map((title) => {
      let current = title;
      while (moves.has(current) && moves.get(current) !== current) {
        current = moves.get(current) as string;
      }
      return [title, current];
    }),
  );
}

/**
 * Pages demandées par lots (limite de l'API), suivies à travers les
 * redirections : chaque titre demandé avec sa page finale.
 */
async function* pagesByTitle(
  titles: readonly string[],
  params: Readonly<Record<string, string>>,
): AsyncGenerator<[string, PageQuery["query"]["pages"][number] | undefined]> {
  for (const batch of chunk(titles, TITLES_PER_CALL)) {
    const { query } = await call<PageQuery>({
      action: "query",
      titles: batch.join("|"),
      redirects: "1",
      ...params,
    });
    const byTitle = new Map(query.pages.map((page) => [page.title, page]));
    for (const [title, final] of finalTitles(query, batch)) {
      yield [title, byTitle.get(final)];
    }
  }
}

/** Identifiant Wikidata de chaque article. */
export async function fetchWikidataIds(
  titles: readonly string[],
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  const params = { prop: "pageprops", ppprop: "wikibase_item" };
  for await (const [title, page] of pagesByTitle(titles, params)) {
    const id = page?.pageprops?.wikibase_item;
    if (id) ids.set(title, id);
  }
  return ids;
}

/** Champ « couleurs » de l'infobox de chaque article de club, quand il existe. */
export async function fetchInfoboxColors(
  titles: readonly string[],
): Promise<Map<string, string>> {
  const colors = new Map<string, string>();
  const params = {
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    rvsection: "0",
  };
  for await (const [title, page] of pagesByTitle(titles, params)) {
    const content = page?.revisions?.[0]?.slots.main.content ?? "";
    const match = /\|\s*couleurs?\s*=\s*(.+)/.exec(content);
    if (match) colors.set(title, match[1].trim());
  }
  return colors;
}
