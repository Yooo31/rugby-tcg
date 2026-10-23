import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGiveawaysPage } from "@/features/admin/server";

export const metadata: Metadata = { title: "Cadeaux · Administration" };

export default function GiveawaysPage() {
  // Droits et données lus à la requête : chaque page a sa propre attente.
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <AdminGiveawaysPage />
    </Suspense>
  );
}
