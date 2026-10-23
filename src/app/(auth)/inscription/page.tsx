import type { Metadata } from "next";
import { SignUpScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Créer un compte" };

export default function Page() {
  return <SignUpScreen />;
}
