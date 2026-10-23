import type { Club, DepartmentCode, DivisionId } from "@/domain";

/** Fabrique un club de test ; seuls les champs utiles au test sont à préciser. */
export function makeClub(overrides: Partial<Club> & { id: string }): Club {
  return {
    name: `Club ${overrides.id}`,
    city: "Toulouse",
    department: "31",
    division: "top14",
    category: "senior-men",
    colors: { primary: "#c8102e", secondary: "#111111" },
    recentResults: [],
    ...overrides,
  };
}

export function makeClubs(
  count: number,
  division: DivisionId = "top14",
  department: DepartmentCode = "31",
): Club[] {
  return Array.from({ length: count }, (_, index) =>
    makeClub({ id: `club-${index}`, division, department }),
  );
}

/** RNG qui rejoue une suite de valeurs, puis boucle. */
export function sequenceRng(values: readonly number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}
