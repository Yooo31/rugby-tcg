import type { DivisionId } from "../../src/domain";

/** Saison importée. À changer chaque été, avec les titres de pages ci-dessous. */
export const SEASON = "2026-2027";

const PREFIX = "Championnat de France de rugby à XV";

/**
 * Page Wikipédia de la saison pour chaque division.
 * Les divisions régionales n'ont pas de page de saison : elles ne sont pas importées.
 */
export const SEASON_PAGES: Partial<Record<DivisionId, string>> = {
  top14: `${PREFIX} ${SEASON}`,
  prod2: `${PREFIX} de 2e division ${SEASON}`,
  nationale: `${PREFIX} de Nationale ${SEASON}`,
  nationale2: `${PREFIX} de Nationale 2 ${SEASON}`,
  federale1: `${PREFIX} de 1re division fédérale ${SEASON}`,
  federale2: `${PREFIX} de 2e division fédérale ${SEASON}`,
  federale3: `${PREFIX} de 3e division fédérale ${SEASON}`,
};
