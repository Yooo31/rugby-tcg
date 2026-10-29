import { render, screen } from "@testing-library/react";
import { MISSION_POOL, type MissionProgress } from "@/domain";
import { MissionsSummary } from "./MissionsSummary";

const [first, second, third] = MISSION_POOL;
const missions: MissionProgress[] = [
  { mission: first, progress: 1, status: "locked", isVip: false },
  { mission: second, progress: second.goal, status: "claimable", isVip: false },
  { mission: third, progress: third.goal, status: "claimed", isVip: false },
];

describe("MissionsSummary", () => {
  it("montre l'avancement, les récompenses à récupérer et les missions faites", () => {
    render(<MissionsSummary missions={missions} />);
    expect(screen.getByText("1 récompense à récupérer")).toBeInTheDocument();
    expect(screen.getByText(`1/${first.goal}`)).toBeInTheDocument();
    expect(screen.getByText(third.title).parentElement).toHaveClass(
      "line-through",
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/missions");
  });
});
