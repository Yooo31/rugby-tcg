import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSeasonsPage } from "@/features/admin/server";

export const metadata: Metadata = { title: "Saisons · Administration" };

export default function SeasonsPage() {
  // Droits et données lus à la requête : chaque page a sa propre attente.
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <AdminSeasonsPage />
    </Suspense>
  );
}
