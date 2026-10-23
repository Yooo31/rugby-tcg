import type { Metadata } from "next";
import { LeaderboardScreen } from "@/features/leaderboard";

export const metadata: Metadata = { title: "Classement" };

export default function LeaderboardPage() {
  return <LeaderboardScreen />;
}
