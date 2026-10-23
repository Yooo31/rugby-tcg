import type { Metadata } from "next";
import { LegalNotice } from "@/features/legal";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalNoticePage() {
  return <LegalNotice />;
}
