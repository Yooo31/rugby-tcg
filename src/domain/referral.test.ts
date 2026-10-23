import { createSeededRng } from "@/lib/rng";
import {
  generateReferralCode,
  MAX_REWARDED_REFERRALS,
  referralCodeSchema,
  referrerEarns,
} from "./referral";

describe("parrainage", () => {
  it("génère des codes lisibles de 6 caractères", () => {
    const rng = createSeededRng(1);
    const codes = Array.from({ length: 100 }, () => generateReferralCode(rng));
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z2-9]{6}$/);
      expect(code).not.toMatch(/[01OIL]/);
    }
    expect(new Set(codes).size).toBe(100);
  });

  it("accepte un code saisi en minuscules avec des espaces", () => {
    expect(referralCodeSchema.parse(" ab3k9z ")).toBe("AB3K9Z");
    expect(referralCodeSchema.safeParse("AB0K9Z").success).toBe(false);
    expect(referralCodeSchema.safeParse("ABC").success).toBe(false);
  });

  it("récompense le parrain après 3 jours actifs, dans la limite du plafond", () => {
    expect(referrerEarns(2, 0)).toBe(false);
    expect(referrerEarns(3, 0)).toBe(true);
    expect(referrerEarns(3, MAX_REWARDED_REFERRALS)).toBe(false);
  });
});
