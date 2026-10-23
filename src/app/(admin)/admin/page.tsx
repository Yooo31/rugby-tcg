import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminHomePage } from "@/features/admin/server";

export const metadata: Metadata = { title: "Administration" };

export default function AdminPage() {
  // Droits et données lus à la requête : chaque page a sa propre attente.
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <AdminHomePage />
    </Suspense>
  );
}
