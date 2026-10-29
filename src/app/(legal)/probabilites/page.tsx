import type { Metadata } from "next";
import { OddsPage } from "@/features/legal";

export const metadata: Metadata = { title: "Probabilités" };

export default function OddsRoute() {
  return <OddsPage />;
}
