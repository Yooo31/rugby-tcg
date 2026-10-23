import { pushSubscriptionSchema } from "./schemas";

describe("abonnement reçu du navigateur", () => {
  const valid = {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc",
    keys: { p256dh: "BNc", auth: "tBH" },
  };

  it("accepte un abonnement en HTTPS", () => {
    expect(pushSubscriptionSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse une adresse non chiffrée ou des clés manquantes", () => {
    expect(
      pushSubscriptionSchema.safeParse({
        ...valid,
        endpoint: "http://exemple.fr",
      }).success,
    ).toBe(false);
    expect(
      pushSubscriptionSchema.safeParse({ endpoint: valid.endpoint }).success,
    ).toBe(false);
  });
});
