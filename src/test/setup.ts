import "@testing-library/jest-dom/vitest";

// Les actions serveur exigent une session et une base : les tests d'écran
// injectent des dépôts en mémoire (`createInMemoryRepositories`) à la place.
vi.mock("@/features/game/server/actions", () => {
  const unavailable = () => {
    throw new Error(
      "Action serveur indisponible en test : injecter des dépôts.",
    );
  };
  return {
    getPlayer: vi.fn(unavailable),
    openBooster: vi.fn(unavailable),
    buyBoosters: vi.fn(unavailable),
    claimMission: vi.fn(unavailable),
    claimAlbumReward: vi.fn(unavailable),
    claimGiveaway: vi.fn(unavailable),
    claimStreak: vi.fn(unavailable),
    setUsername: vi.fn(unavailable),
    getLeaderboard: vi.fn(unavailable),
  };
});

vi.mock("@/features/notifications/server/actions", () => ({
  subscribePush: vi.fn(async () => false),
  unsubscribePush: vi.fn(async () => undefined),
}));

// jsdom n'implémente pas les boîtes de dialogue modales : version minimale.
if (
  typeof HTMLDialogElement !== "undefined" &&
  !HTMLDialogElement.prototype.showModal
) {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}
