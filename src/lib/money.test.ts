import { formatEuros } from "./money";

describe("formatEuros", () => {
  it("écrit les centimes en euros, à la française", () => {
    // Espace insécable avant le symbole, comme le veut l'usage français.
    expect(formatEuros(599)).toBe("5,99 €");
    expect(formatEuros(2499)).toBe("24,99 €");
    expect(formatEuros(100)).toBe("1,00 €");
  });
});
