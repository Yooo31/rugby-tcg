import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPromotionsPage } from "@/features/admin/server";

export const metadata: Metadata = { title: "Promotions · Administration" };

export default function PromotionsRoute() {
  // Droits et données lus à la requête : chaque page a sa propre attente.
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <AdminPromotionsPage />
    </Suspense>
  );
}
