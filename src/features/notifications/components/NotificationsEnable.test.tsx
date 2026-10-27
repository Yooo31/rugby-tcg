import { render, screen } from "@testing-library/react";
// La clé publique est lue au chargement du module : à définir avant l'import.
vi.hoisted(() => {
  process.env["NEXT_PUBLIC_VAPID_PUBLIC_KEY"] = "clé-publique";
});
import userEvent from "@testing-library/user-event";
import * as push from "../lib/push";
import * as actions from "../server/actions";
import { NotificationsToggle } from "./NotificationsToggle";

vi.mock("../lib/push", () => ({
  pushSupport: vi.fn(() => "supported"),
  currentSubscription: vi.fn(async () => null),
  subscribeDevice: vi.fn(),
}));

const subscription = {
  endpoint: "https://push.test/abc",
  toJSON: () => ({
    endpoint: "https://push.test/abc",
    keys: { p256dh: "k", auth: "a" },
  }),
  unsubscribe: vi.fn(async () => true),
} as unknown as PushSubscription;

describe("activation des notifications", () => {
  beforeEach(() => {
    vi.stubGlobal("Notification", { permission: "default" });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(push.currentSubscription).mockResolvedValue(null);
  });

  it("abonne l'appareil, puis permet de couper", async () => {
    const user = userEvent.setup();
    vi.mocked(push.subscribeDevice).mockResolvedValueOnce(subscription);
    vi.mocked(actions.subscribePush).mockResolvedValueOnce(true);
    render(<NotificationsToggle />);

    await user.click(
      await screen.findByRole("button", { name: "Activer les notifications" }),
    );
    // Abonné désormais : c'est cet abonnement que la coupure résilie.
    vi.mocked(push.currentSubscription).mockResolvedValue(subscription);
    await user.click(
      await screen.findByRole("button", { name: "Couper les notifications" }),
    );
    expect(subscription.unsubscribe).toHaveBeenCalled();
    expect(actions.unsubscribePush).toHaveBeenCalledWith(
      "https://push.test/abc",
    );
    expect(
      await screen.findByRole("button", { name: "Activer les notifications" }),
    ).toBeInTheDocument();
  });

  it("propose de réessayer si le serveur refuse l'abonnement", async () => {
    const user = userEvent.setup();
    vi.mocked(push.subscribeDevice).mockResolvedValueOnce(subscription);
    vi.mocked(actions.subscribePush).mockResolvedValueOnce(false);
    render(<NotificationsToggle />);
    await user.click(
      await screen.findByRole("button", { name: "Activer les notifications" }),
    );
    expect(
      await screen.findByRole("button", { name: "Réessayer" }),
    ).toBeInTheDocument();
  });

  it("reste coupé si le joueur refuse l'autorisation", async () => {
    const user = userEvent.setup();
    vi.mocked(push.subscribeDevice).mockResolvedValueOnce(null);
    render(<NotificationsToggle />);
    await user.click(
      await screen.findByRole("button", { name: "Activer les notifications" }),
    );
    expect(
      await screen.findByRole("button", { name: "Activer les notifications" }),
    ).toBeInTheDocument();
  });
});
