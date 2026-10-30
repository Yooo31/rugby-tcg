import { installMode, isIosDevice } from "./install";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15";
const IPAD_AS_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";
const ANDROID = "Mozilla/5.0 (Linux; Android 15; Pixel 7) Chrome/130.0";

const context = {
  userAgent: ANDROID,
  maxTouchPoints: 5,
  isStandalone: false,
  hasPrompt: false,
};

describe("installation de l'application", () => {
  it("reconnaît iPhone et iPad, même déguisé en Mac", () => {
    expect(isIosDevice({ userAgent: IPHONE, maxTouchPoints: 5 })).toBe(true);
    expect(isIosDevice({ userAgent: IPAD_AS_MAC, maxTouchPoints: 5 })).toBe(
      true,
    );
    expect(isIosDevice({ userAgent: IPAD_AS_MAC, maxTouchPoints: 0 })).toBe(
      false,
    );
    expect(isIosDevice({ userAgent: ANDROID, maxTouchPoints: 5 })).toBe(false);
  });

  it("propose l'invite, la marche à suivre sur iPhone, ou rien", () => {
    expect(
      installMode({ ...context, isStandalone: true, hasPrompt: true }),
    ).toBe("installed");
    expect(installMode({ ...context, hasPrompt: true })).toBe("prompt");
    expect(installMode({ ...context, userAgent: IPHONE })).toBe("ios");
    expect(installMode(context)).toBe("unavailable");
  });
});
