import type { Metadata } from "next";
import { SignInScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Connexion" };

export default function Page() {
  return <SignInScreen />;
}
