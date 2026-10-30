import Stripe from "stripe";
import {
  isLiveKey,
  stripeWebhookResponse,
  type WebhookDependencies,
} from "./webhook";

vi.mock("server-only", () => ({}));

const SECRET = "whsec_test_secret";
const PLAYER = "0b6c1f0e-8a3c-4f1d-9a52-2e7d3c4b5a69";
const stripe = new Stripe("sk_test_fake");

function deps(): WebhookDependencies & {
  credit: ReturnType<typeof vi.fn>;
  revoke: ReturnType<typeof vi.fn>;
} {
  return {
    stripe,
    secret: SECRET,
    credit: vi.fn(async () => true),
    revoke: vi.fn(async () => "ingots"),
    sessionOfPayment: async (paymentIntent) =>
      paymentIntent === "pi_1" ? "cs_test_1" : null,
  };
}

/** Requête signée comme Stripe le fait (sans réseau). */
function signedRequest(event: object, secret = SECRET): Request {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
  return new Request("https://rugby.test/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

const completed = {
  id: "evt_1",
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_1",
      object: "checkout.session",
      client_reference_id: PLAYER,
      metadata: { playerId: PLAYER, kind: "ingots", productId: "bag" },
      amount_total: 599,
      currency: "eur",
      payment_status: "paid",
      livemode: false,
    },
  },
};

async function outcome(response: Response): Promise<string> {
  return ((await response.json()) as { outcome: string }).outcome;
}

describe("webhook Stripe", () => {
  it("crédite un paiement signé et conforme", async () => {
    const dependencies = deps();
    const response = await stripeWebhookResponse(
      signedRequest(completed),
      dependencies,
      false,
    );
    expect(response.status).toBe(200);
    expect(await outcome(response)).toBe("crédité");
    expect(dependencies.credit).toHaveBeenCalledWith(
      PLAYER,
      { kind: "ingots", id: "bag" },
      "cs_test_1",
    );
  });

  it("refuse une signature absente ou fausse, sans rien créditer", async () => {
    const dependencies = deps();
    const unsigned = new Request("https://rugby.test/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify(completed),
    });
    expect(
      (await stripeWebhookResponse(unsigned, dependencies, false)).status,
    ).toBe(400);
    expect(
      (
        await stripeWebhookResponse(
          signedRequest(completed, "whsec_autre"),
          dependencies,
          false,
        )
      ).status,
    ).toBe(400);
    expect(dependencies.credit).not.toHaveBeenCalled();
  });

  it("ignore un paiement en production quand le serveur est en test, et un mauvais montant", async () => {
    const dependencies = deps();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(
      await outcome(
        await stripeWebhookResponse(
          signedRequest(completed),
          dependencies,
          true,
        ),
      ),
    ).toBe("ignoré : wrong-mode");
    const cheap = {
      ...completed,
      data: { object: { ...completed.data.object, amount_total: 1 } },
    };
    expect(
      await outcome(
        await stripeWebhookResponse(signedRequest(cheap), dependencies, false),
      ),
    ).toBe("ignoré : wrong-amount");
    expect(dependencies.credit).not.toHaveBeenCalled();
  });

  it("dit « déjà crédité » pour un événement renvoyé", async () => {
    const dependencies = deps();
    dependencies.credit.mockResolvedValueOnce(false);
    expect(
      await outcome(
        await stripeWebhookResponse(
          signedRequest(completed),
          dependencies,
          false,
        ),
      ),
    ).toBe("déjà crédité");
  });

  it("retire un achat remboursé en totalité ou contesté", async () => {
    const dependencies = deps();
    const refunded = (refunded: boolean) => ({
      id: "evt_2",
      object: "event",
      type: "charge.refunded",
      data: {
        object: {
          id: "ch_1",
          object: "charge",
          refunded,
          payment_intent: "pi_1",
        },
      },
    });
    expect(
      await outcome(
        await stripeWebhookResponse(
          signedRequest(refunded(false)),
          dependencies,
          false,
        ),
      ),
    ).toBe("ignoré : remboursement partiel");
    expect(
      await outcome(
        await stripeWebhookResponse(
          signedRequest(refunded(true)),
          dependencies,
          false,
        ),
      ),
    ).toBe("retiré");
    const dispute = {
      id: "evt_3",
      object: "event",
      type: "charge.dispute.created",
      data: {
        object: { id: "dp_1", object: "dispute", payment_intent: "pi_inconnu" },
      },
    };
    expect(
      await outcome(
        await stripeWebhookResponse(
          signedRequest(dispute),
          dependencies,
          false,
        ),
      ),
    ).toBe("ignoré : paiement inconnu");
    expect(dependencies.revoke).toHaveBeenCalledTimes(1);
    expect(dependencies.revoke).toHaveBeenCalledWith("cs_test_1");
  });

  it("ignore les autres événements et reconnaît une clé de production", async () => {
    expect(
      await outcome(
        await stripeWebhookResponse(
          signedRequest({
            id: "evt_4",
            object: "event",
            type: "customer.created",
            data: { object: {} },
          }),
          deps(),
          false,
        ),
      ),
    ).toBe("ignoré");
    expect(isLiveKey("sk_live_x")).toBe(true);
    expect(isLiveKey("sk_test_x")).toBe(false);
  });
});
