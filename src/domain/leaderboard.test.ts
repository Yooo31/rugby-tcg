import { rankScores } from "./leaderboard";

const score = (playerId: string, clubs: number) => ({
  playerId,
  username: playerId,
  clubs,
});

describe("classement", () => {
  it("classe par clubs, ex æquo au même rang puis rang sauté", () => {
    const { entries } = rankScores(
      [
        score("bea", 10),
        score("alex", 12),
        score("chloe", 10),
        score("dan", 3),
      ],
      "dan",
    );
    expect(entries.map(({ username, rank }) => [username, rank])).toEqual([
      ["alex", 1],
      ["bea", 2],
      ["chloe", 2],
      ["dan", 4],
    ]);
  });

  it("ignore les joueurs sans club", () => {
    expect(rankScores([score("vide", 0)], "vide")).toEqual({
      entries: [],
      me: null,
    });
  });

  it("donne le rang du joueur même hors du haut du tableau", () => {
    const scores = [score("a", 9), score("b", 8), score("moi", 1)];
    const board = rankScores(scores, "moi", 2);
    expect(board.entries.map((entry) => entry.username)).toEqual(["a", "b"]);
    expect(board.me).toEqual({
      rank: 3,
      username: "moi",
      clubs: 1,
      isMe: true,
      isVip: false,
    });
  });
});
