import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function Page() {
  return <ForgotPasswordScreen />;
}
