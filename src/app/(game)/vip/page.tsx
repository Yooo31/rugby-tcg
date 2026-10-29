import type { Metadata } from "next";
import { VipScreen } from "@/features/vip";

export const metadata: Metadata = { title: "Pass VIP" };

export default function VipPage() {
  return <VipScreen />;
}
