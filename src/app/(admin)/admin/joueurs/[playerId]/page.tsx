import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPlayerPage } from "@/features/admin/server";

export const metadata: Metadata = { title: "Joueur · Administration" };

export default function PlayerPage({
  params,
}: PageProps<"/admin/joueurs/[playerId]">) {
  // Droits et données lus à la requête : chaque page a sa propre attente.
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <AdminPlayerPage params={params} />
    </Suspense>
  );
}
