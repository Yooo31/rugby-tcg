import type { Metadata } from "next";
import { ShopScreen } from "@/features/shop";

export const metadata: Metadata = { title: "Boutique" };

export default function ShopPage() {
  return <ShopScreen />;
}
