import { createServerPlayerRepository } from "@/data/server";
import type { PlayerSnapshot } from "@/domain";
import { startCheckout } from "./actions";
import { stripeClient } from "./config";

// `src/test/setup.ts` double cette action pour les écrans : ici, la vraie.
vi.unmock("@/features/payments/server/actions");
vi.mock("server-only", () => ({}));
vi.mock("@/features/auth/server", () => ({
  requireAuthUser: vi.fn(async () => ({ id: PLAYER, email: "joueur@club.fr" })),
}));
vi.mock("@/data/server", () => ({
  createServerRateLimiter: () => ({ take: async () => true }),
  createServerPlayerRepository: vi.fn(),
}));
vi.mock("./config", () => ({ stripeClient: vi.fn() }));

const PLAYER = "0b6c1f0e-8a3c-4f1d-9a52-2e7d3c4b5a69";
const SEASON = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const create = vi.fn(async () => ({
  url: "https://checkout.stripe.com/c/pay/cs_test_1",
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://rugby.test");
  withState();
  vi.mocked(stripeClient).mockReturnValue({
    checkout: { sessions: { create } },
  } as unknown as ReturnType<typeof stripeClient>);
});

function withState(
  state: {
    hasPremium?: boolean;
    promotion?: { percentOff: number } | null;
    welcomeOffer?: boolean;
  } = {},
) {
  vi.mocked(createServerPlayerRepository).mockReturnValue({
    get: async () =>
      ({
        season:
          state.hasPremium === undefined
            ? null
            : { season: { id: SEASON }, hasPremium: state.hasPremium },
        promotion: state.promotion ?? null,
        welcomeOffer: state.welcomeOffer ?? true,
      }) as unknown as PlayerSnapshot,
  } as unknown as ReturnType<typeof createServerPlayerRepository>);
}

const withSeason = (hasPremium: boolean) => withState({ hasPremium });

describe("ouverture d'un paiement", () => {
  it("ouvre la page Stripe pour le joueur de la session", async () => {
    expect(await startCheckout({ kind: "ingots", id: "bag" }, true)).toEqual({
      ok: true,
      url: "https://checkout.stripe.com/c/pay/cs_test_1",
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: PLAYER,
        customer_email: "joueur@club.fr",
        success_url: "https://rugby.test/paiement/merci",
      }),
    );
  });

  it("refuse un produit inconnu ou sans renonciation", async () => {
    expect(
      await startCheckout({ kind: "ingots", id: "gratuit" }, true),
    ).toEqual({
      ok: false,
      error: "invalid",
    });
    expect(await startCheckout({ kind: "ingots", id: "bag" }, "oui")).toEqual({
      ok: false,
      error: "waiver-required",
    });
  });

  it("répond « indisponible » sans clé Stripe", async () => {
    vi.mocked(stripeClient).mockReturnValue(null);
    expect(await startCheckout({ kind: "vip", id: "vip-month" }, true)).toEqual(
      {
        ok: false,
        error: "unavailable",
      },
    );
  });

  it("ne vend que la voie payante de la saison en cours, une fois", async () => {
    withSeason(true);
    expect(
      await startCheckout({ kind: "season-pass", id: SEASON }, true),
    ).toEqual({
      ok: false,
      error: "already-owned",
    });
    withSeason(false);
    expect(
      await startCheckout(
        { kind: "season-pass", id: "7f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b" },
        true,
      ),
    ).toEqual({ ok: false, error: "invalid" });
    expect(
      await startCheckout({ kind: "season-pass", id: SEASON }, true),
    ).toMatchObject({
      ok: true,
    });
  });

  it("applique la promotion en cours au prix envoyé à Stripe", async () => {
    withState({ promotion: { percentOff: 30 } });
    await startCheckout({ kind: "ingots", id: "bag" }, true);
    expect(create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 419 }),
          }),
        ],
        metadata: expect.objectContaining({ priceCents: "419" }),
      }),
    );
  });

  it("ne vend l'offre de bienvenue qu'une fois", async () => {
    const welcome = { kind: "welcome", id: "welcome" };
    expect(await startCheckout(welcome, true)).toMatchObject({ ok: true });
    withState({ welcomeOffer: false });
    expect(await startCheckout(welcome, true)).toEqual({
      ok: false,
      error: "already-owned",
    });
  });
});
