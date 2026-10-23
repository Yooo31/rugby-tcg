import { readableInkOn, relativeLuminance } from "./color";

describe("couleurs", () => {
  it("calcule la luminance relative", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1);
  });

  it("choisit une encre lisible selon le fond", () => {
    expect(readableInkOn("#ffd100")).toBe("#0b131a");
    expect(readableInkOn("#0b2a5b")).toBe("#ffffff");
  });
});
