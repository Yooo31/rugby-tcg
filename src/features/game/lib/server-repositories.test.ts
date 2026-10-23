import { BoosterQuotaExceededError, type PlayerSnapshot } from "@/domain";
import * as actions from "../server/actions";
import { createServerRepositories } from "./server-repositories";

// Les actions sont remplacées par des doublures dans src/test/setup.ts.
const mocked = vi.mocked(actions);

describe("dépôts branchés sur les actions serveur", () => {
  it("transmet les paramètres et renvoie l'état du serveur", async () => {
    // Seule l'identité de l'objet compte ici : il doit revenir tel quel.
    const snapshot = { ingots: 7 } as unknown as PlayerSnapshot;
    mocked.claimMission.mockResolvedValueOnce({ ok: true, value: snapshot });
    const { player } = createServerRepositories();
    await expect(player.claimMission("open-2")).resolves.toBe(snapshot);
    expect(mocked.claimMission).toHaveBeenCalledWith("open-2");
  });

  it("redonne au navigateur l'erreur du domaine d'un refus", async () => {
    mocked.openBooster.mockResolvedValueOnce({
      ok: false,
      error: "booster-quota",
    });
    await expect(
      createServerRepositories().player.openBooster(),
    ).rejects.toBeInstanceOf(BoosterQuotaExceededError);
  });

  it("sert le catalogue sans passer par le serveur", async () => {
    const { clubs, albums } = createServerRepositories();
    expect((await clubs.list()).length).toBeGreaterThan(100);
    expect((await albums.list()).length).toBeGreaterThan(10);
  });
});
