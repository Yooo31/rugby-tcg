import { adminData } from "@/data/server";
import { NegativeBalanceError } from "@/domain";
import { PromotionTooCloseError } from "@/data/server";
import {
  adjustPlayerAction,
  createPromotionAction,
  endPromotionAction,
} from "./actions";
import { requireAdmin } from "./guard";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({}));
vi.mock("./guard", () => ({
  requireAdmin: vi.fn(async () => ({ email: "admin@rugby-tcg.test" })),
}));
vi.mock("@/data/server", () => ({
  adminData: {
    adjustPlayer: vi.fn(async () => undefined),
    createPromotion: vi.fn(async () => undefined),
    endPromotion: vi.fn(async () => undefined),
  },
  PromotionTooCloseError: class PromotionTooCloseError extends Error {},
}));

const PLAYER_ID = "00000000-0000-4000-8000-000000000001";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

const VALID = {
  playerId: PLAYER_ID,
  ingotsDelta: "50",
  boostersDelta: "0",
  reason: "Geste commercial",
};

describe("correction d'un joueur", () => {
  it("vérifie les droits avant tout", async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("introuvable"));
    await expect(adjustPlayerAction({}, form(VALID))).rejects.toThrow();
    expect(adminData.adjustPlayer).not.toHaveBeenCalled();
  });

  it("refuse un joueur mal identifié", async () => {
    const state = await adjustPlayerAction(
      {},
      form({ ...VALID, playerId: "1" }),
    );
    expect(state.error).toBe("Joueur inconnu.");
  });

  it("renvoie les erreurs de saisie", async () => {
    const state = await adjustPlayerAction({}, form({ ...VALID, reason: "" }));
    expect(state.fieldErrors?.["reason"]).toBeDefined();
    expect(adminData.adjustPlayer).not.toHaveBeenCalled();
  });

  it("enregistre la correction au nom de l'administrateur", async () => {
    const state = await adjustPlayerAction({}, form(VALID));
    expect(adminData.adjustPlayer).toHaveBeenCalledWith(
      PLAYER_ID,
      expect.objectContaining({ ingotsDelta: 50 }),
      "admin@rugby-tcg.test",
    );
    expect(state.success).toBe("Correction enregistrée.");
  });

  it("refuse un solde négatif, et laisse remonter toute autre erreur", async () => {
    vi.mocked(adminData.adjustPlayer).mockRejectedValueOnce(
      new NegativeBalanceError(),
    );
    expect((await adjustPlayerAction({}, form(VALID))).error).toContain(
      "solde négatif",
    );
    vi.mocked(adminData.adjustPlayer).mockRejectedValueOnce(new Error("base"));
    await expect(adjustPlayerAction({}, form(VALID))).rejects.toThrow("base");
  });
});

describe("promotions", () => {
  const PROMO = {
    title: "Week-end du Top 14",
    percentOff: "30",
    startDay: "2027-03-06",
    endDay: "2027-03-07",
  };

  it("programme une promotion sur des jours entiers", async () => {
    const state = await createPromotionAction({}, form(PROMO));
    expect(adminData.createPromotion).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Week-end du Top 14", percentOff: 30 }),
      "admin@rugby-tcg.test",
    );
    expect(state.success).toBe("Promotion programmée.");
  });

  it("refuse une réduction hors bornes, ou trop proche d'une autre", async () => {
    const state = await createPromotionAction(
      {},
      form({ ...PROMO, percentOff: "80" }),
    );
    expect(state.fieldErrors?.["percentOff"]).toBeDefined();
    vi.mocked(adminData.createPromotion).mockRejectedValueOnce(
      new PromotionTooCloseError(),
    );
    expect((await createPromotionAction({}, form(PROMO))).error).toMatch(
      /30 jours/,
    );
  });

  it("arrête une promotion", async () => {
    await endPromotionAction(form({ promotionId: "pas-un-id" }));
    expect(adminData.endPromotion).not.toHaveBeenCalled();
    await endPromotionAction(form({ promotionId: PLAYER_ID }));
    expect(adminData.endPromotion).toHaveBeenCalledWith(PLAYER_ID);
  });
});
