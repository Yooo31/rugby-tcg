import { checkoutSessionParams, paidPurchase } from "./checkout";

const PLAYER = "0b6c1f0e-8a3c-4f1d-9a52-2e7d3c4b5a69";

const paid = {
  id: "cs_test_1",
  client_reference_id: PLAYER,
  metadata: {
    playerId: PLAYER,
    kind: "vip",
    productId: "vip-month",
    priceCents: "599",
  },
  amount_total: 599,
  currency: "eur",
  payment_status: "paid" as const,
  livemode: false,
};

describe("page de paiement", () => {
  it("fixe le montant et le joueur côté serveur", () => {
    const params = checkoutSessionParams({
      playerId: PLAYER,
      email: "joueur@club.fr",
      product: { kind: "ingots", id: "chest" },
      priceCents: 1_199,
      siteUrl: "https://rugby.test",
    });
    expect(params).toMatchObject({
      mode: "payment",
      client_reference_id: PLAYER,
      customer_email: "joueur@club.fr",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: 1_199,
            product_data: { name: "1500 lingots" },
          },
        },
      ],
      metadata: {
        playerId: PLAYER,
        kind: "ingots",
        productId: "chest",
        priceCents: "1199",
      },
      payment_intent_data: { metadata: { productId: "chest" } },
      success_url: "https://rugby.test/paiement/merci",
      cancel_url: "https://rugby.test/boutique",
    });
    expect(
      checkoutSessionParams({
        playerId: PLAYER,
        email: null,
        product: { kind: "ingots", id: "chest" },
        priceCents: 1_199,
        siteUrl: "https://rugby.test",
      }),
    ).not.toHaveProperty("customer_email");
  });
});

describe("paiement reçu", () => {
  it("accepte un paiement conforme", () => {
    expect(paidPurchase(paid, false)).toEqual({
      playerId: PLAYER,
      product: { kind: "vip", id: "vip-month" },
      reference: "cs_test_1",
      priceCents: 599,
    });
  });

  it.each([
    [{ payment_status: "unpaid" as const }, "unpaid"],
    [{ livemode: true }, "wrong-mode"],
    [{ currency: "usd" }, "wrong-currency"],
    [
      { metadata: { playerId: PLAYER, kind: "vip", productId: "vip-gratuit" } },
      "unknown-product",
    ],
    [{ metadata: null }, "unknown-product"],
    [
      { client_reference_id: "0b6c1f0e-8a3c-4f1d-9a52-2e7d3c4b5a70" },
      "wrong-player",
    ],
    [{ amount_total: 1 }, "wrong-amount"],
  ])("refuse %o", (change, reason) => {
    expect(paidPurchase({ ...paid, ...change }, false)).toEqual({
      rejected: reason,
    });
  });

  it("accepte un prix réduit fixé par le serveur, jamais un prix plus haut", () => {
    const promo = {
      ...paid,
      amount_total: 419,
      metadata: { ...paid.metadata, priceCents: "419" },
    };
    expect(paidPurchase(promo, false)).toMatchObject({ priceCents: 419 });
    const tooHigh = {
      ...paid,
      amount_total: 999,
      metadata: { ...paid.metadata, priceCents: "999" },
    };
    expect(paidPurchase(tooHigh, false)).toEqual({ rejected: "wrong-amount" });
  });

  it("crédite au prix normal un paiement ouvert avant l'arrivée des promotions", () => {
    const older = {
      playerId: PLAYER,
      kind: "vip",
      productId: "vip-month",
    };
    expect(paidPurchase({ ...paid, metadata: older }, false)).toMatchObject({
      priceCents: 599,
    });
  });
});
