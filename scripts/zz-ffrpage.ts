import {
  CLUB_PAGE_BASE,
  officialInitials,
  parseClubPage,
} from "./import-clubs/ffr";
import { getText } from "./import-clubs/http";
async function main() {
  for (const slug of process.argv.slice(2)) {
    const page = parseClubPage(
      slug,
      await getText(`${CLUB_PAGE_BASE}${slug}`, "text/html").catch(() => ""),
    );
    console.log(
      page
        ? `${slug} | ${page.name} | ${page.colors.join(", ") || "—"} | ${page.postalCode} ${page.city} | ${officialInitials(page.name)}`
        : `${slug} | (aucune page)`,
    );
  }
}
main();
