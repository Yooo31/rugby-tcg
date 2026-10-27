import { sequenceRng } from "@/test/fixtures";
import {
  addSpecialCard,
  getSpecialCard,
  rollSpecialCard,
  SPECIAL_CARD_ODDS,
  SPECIAL_CARDS,
} from "./special-card";

describe("cartes spéciales", () => {
  it("existent, avec l'Équipe de France, et se retrouvent par leur identifiant", () => {
    expect(getSpecialCard("equipe-de-france").name).toBe("Équipe de France");
    expect(() => getSpecialCard("inconnue" as never)).toThrow();
    expect(SPECIAL_CARDS.length).toBeGreaterThan(0);
  });

  it("sortent une fois sur cent mille", () => {
    expect(SPECIAL_CARD_ODDS).toBe(1 / 100_000);
    expect(rollSpecialCard(sequenceRng([SPECIAL_CARD_ODDS]))).toBeNull();
    expect(rollSpecialCard(sequenceRng([0.5]))).toBeNull();
    expect(rollSpecialCard(sequenceRng([SPECIAL_CARD_ODDS / 2, 0]))).toBe(
      "equipe-de-france",
    );
  });

  it("s'empilent sans modifier la collection d'origine", () => {
    const first = addSpecialCard([], "equipe-de-france", "2026-10-27");
    expect(first.pulled).toEqual({ id: "equipe-de-france", isNew: true });
    expect(first.collection).toEqual([
      { id: "equipe-de-france", count: 1, firstObtainedAt: "2026-10-27" },
    ]);
    const second = addSpecialCard(
      first.collection,
      "equipe-de-france",
      "2026-10-28",
    );
    expect(second.pulled.isNew).toBe(false);
    expect(second.collection).toEqual([
      { id: "equipe-de-france", count: 2, firstObtainedAt: "2026-10-27" },
    ]);
    expect(first.collection[0].count).toBe(1);
  });
});
