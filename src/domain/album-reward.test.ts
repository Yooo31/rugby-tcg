import type { AlbumProgress } from "./album";
import {
  albumReward,
  albumRewardStatus,
  albumRewardView,
} from "./album-reward";

const complete: AlbumProgress = {
  owned: 14,
  total: 14,
  ratio: 1,
  isComplete: true,
};
const partial: AlbumProgress = {
  owned: 3,
  total: 14,
  ratio: 3 / 14,
  isComplete: false,
};

describe("albumReward", () => {
  it("croît avec la taille de l'album", () => {
    expect(albumReward(14)).toEqual({ ingots: 70, boosters: 1 });
    expect(albumReward(122).ingots).toBeGreaterThan(albumReward(14).ingots);
  });

  it("garde un plancher et réserve le booster aux albums d'au moins 10 clubs", () => {
    expect(albumReward(1)).toEqual({ ingots: 20, boosters: 0 });
    expect(albumReward(9).boosters).toBe(0);
    expect(albumReward(10).boosters).toBe(1);
  });
});

describe("albumRewardStatus", () => {
  it("suit l'avancement puis la récupération", () => {
    expect(albumRewardStatus("a", partial, [])).toBe("locked");
    expect(albumRewardStatus("a", complete, [])).toBe("claimable");
    expect(albumRewardStatus("a", complete, ["a"])).toBe("claimed");
  });

  it("s'accompagne de la récompense pour l'affichage", () => {
    expect(albumRewardView("a", complete, [])).toEqual({
      reward: { ingots: 70, boosters: 1 },
      status: "claimable",
    });
  });
});
