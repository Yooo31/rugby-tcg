import { base64UrlToBytes, pushSupport } from "./push";

describe("notifications côté navigateur", () => {
  it("décode une clé base64 url sans remplissage", () => {
    expect([...base64UrlToBytes("AQID_-8")]).toEqual([1, 2, 3, 255, 239]);
  });

  it("signale un navigateur sans notifications", () => {
    // jsdom n'a ni service worker ni PushManager.
    expect(pushSupport()).toBe("unsupported");
  });
});
