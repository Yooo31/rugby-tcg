import type { Metadata } from "next";
import { MissionsScreen } from "@/features/missions";

export const metadata: Metadata = { title: "Missions" };

export default function MissionsPage() {
  return <MissionsScreen />;
}
