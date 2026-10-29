import type { Metadata } from "next";
import { TermsOfUse } from "@/features/legal";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function TermsOfUsePage() {
  return <TermsOfUse />;
}
