import type { Metadata } from "next";
import { BoosterScreen } from "@/features/boosters";

export const metadata: Metadata = { title: "Boosters" };

export default function BoostersPage() {
  return <BoosterScreen />;
}
