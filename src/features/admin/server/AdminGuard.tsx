import "server-only";
import type { ReactNode } from "react";
import { requireAdmin } from "./guard";

/** N'affiche l'administration qu'à un administrateur (sinon : page introuvable). */
export async function AdminGuard({
  children,
}: {
  readonly children: ReactNode;
}) {
  await requireAdmin();
  return children;
}
