import type { Metadata } from "next";
import { PaymentThanksScreen } from "@/features/payments";

export const metadata: Metadata = { title: "Merci" };

export default function PaymentThanksPage() {
  return <PaymentThanksScreen />;
}
