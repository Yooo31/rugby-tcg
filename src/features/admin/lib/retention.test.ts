import { lastDays, retention } from "./retention";

const player = (signupDay: string, ...activeDays: string[]) => ({
  signupDay,
  activeDays: new Set(activeDays),
});

describe("rétention", () => {
  const today = "2026-10-30";
  const players = [
    player("2026-10-20", "2026-10-20", "2026-10-21", "2026-10-28"),
    player("2026-10-20", "2026-10-20"),
    player("2026-10-29", "2026-10-29", "2026-10-30"),
    player("2026-10-30", "2026-10-30"),
  ];

  it("ne compte que les joueurs inscrits depuis assez longtemps", () => {
    expect(retention(players, today, 1)).toEqual({
      day: 1,
      eligible: 3,
      retained: 2,
    });
    expect(retention(players, today, 7)).toEqual({
      day: 7,
      eligible: 2,
      retained: 1,
    });
    expect(retention(players, today, 30)).toEqual({
      day: 30,
      eligible: 0,
      retained: 0,
    });
  });
});

describe("activité des derniers jours", () => {
  it("complète les jours sans activité", () => {
    expect(
      lastDays(
        [{ day: "2026-10-29", players: 2, openings: 5 }],
        ["2026-10-28", "2026-10-29"],
      ),
    ).toEqual([
      { day: "2026-10-28", players: 0, openings: 0 },
      { day: "2026-10-29", players: 2, openings: 5 },
    ]);
  });
});
