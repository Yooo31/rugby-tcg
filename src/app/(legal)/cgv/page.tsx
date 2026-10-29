import type { Metadata } from "next";
import { TermsOfSale } from "@/features/legal";

export const metadata: Metadata = { title: "Conditions de vente" };

export default function TermsOfSalePage() {
  return <TermsOfSale />;
}
