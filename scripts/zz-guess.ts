import { readFileSync, writeFileSync } from "node:fs";
import { CLUB_CATALOG } from "../src/data/catalog";
import {
  CLUB_PAGE_BASE,
  officialInitials,
  parseClubPage,
  pickClubPage,
} from "./import-clubs/ffr";
import { getText } from "./import-clubs/http";
import { slugify } from "./import-clubs/parse";

const EXPAND: Record<string, string[]> = {
  RC: ["rugby-club", "racing-club"],
  US: ["union-sportive"],
  AS: ["association-sportive", "avenir-sportif"],
  SC: ["sporting-club", "stade-club"],
  CA: ["club-athletique"],
  CS: ["club-sportif"],
  FC: ["football-club"],
  SO: ["stade-olympique"],
  RO: ["rugby-olympique"],
  UA: ["union-athletique"],
  JO: ["jeunesse-olympique"],
};
function guesses(name: string): string[] {
  const words = name.split(/\s+/);
  const out = new Set<string>([slugify(name)]);
  const first = words[0] ?? "";
  const rest = slugify(words.slice(1).join(" "));
  if (/^[A-Z]{2,4}$/.test(first)) {
    out.add(`${first.toLowerCase().split("").join("-")}-${rest}`);
    for (const e of EXPAND[first] ?? []) out.add(`${e}-${rest}`);
  }
  const last = words.at(-1) ?? "";
  if (/^[A-Z]{2,4}$/.test(last)) {
    const head = slugify(words.slice(0, -1).join(" "));
    out.add(`${last.toLowerCase().split("").join("-")}-${head}`);
  }
  return [...out];
}
async function main() {
  const ffr = JSON.parse(
    readFileSync("scripts/import-clubs/clubs.ffr.json", "utf8"),
  );
  const lines: string[] = [];
  for (const id of ffr.unmatched.map((u: string) => u.split(" ")[0])) {
    const club = CLUB_CATALOG.find((c) => c.id === id);
    if (!club) continue;
    const pages = [];
    for (const slug of guesses(club.name)) {
      const page = parseClubPage(
        slug,
        await getText(`${CLUB_PAGE_BASE}${slug}`, "text/html").catch(() => ""),
      );
      if (page) pages.push(page);
    }
    const m = pickClubPage(club, pages);
    const p = m?.page ?? pages[0];
    lines.push(
      `${id}\t${p ? `${p.slug} | ${p.name} | ${p.colors.join(", ") || "—"} | ${p.postalCode} | ${officialInitials(p.name)}${m ? "" : " (département différent ?)"}` : "?"}`,
    );
    console.log(lines.at(-1));
  }
  writeFileSync(process.argv[2]!, lines.join("\n") + "\n");
}
main();
