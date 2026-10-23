import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPlayersPage } from "@/features/admin/server";

export const metadata: Metadata = { title: "Joueurs · Administration" };

export default function PlayersPage({
  searchParams,
}: PageProps<"/admin/joueurs">) {
  // Droits et données lus à la requête : chaque page a sa propre attente.
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <AdminPlayersPage searchParams={searchParams} />
    </Suspense>
  );
}
