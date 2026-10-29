import type { Metadata } from "next";
import { SeasonScreen } from "@/features/season";

export const metadata: Metadata = { title: "Passe de saison" };

export default function SeasonPage() {
  return <SeasonScreen />;
}
