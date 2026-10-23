import { isCronAuthorized } from "./cron-auth";

describe("secret de la tâche planifiée", () => {
  it("n'accepte que le bon secret, et jamais sans secret configuré", () => {
    expect(isCronAuthorized("Bearer s3cret", "s3cret")).toBe(true);
    expect(isCronAuthorized("Bearer autre!", "s3cret")).toBe(false);
    expect(isCronAuthorized(null, "s3cret")).toBe(false);
    expect(isCronAuthorized("Bearer ", undefined)).toBe(false);
  });
});
