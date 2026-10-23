import type { Metadata } from "next";
import { Suspense } from "react";
import { createCatalogRepositories } from "@/data";
import { AlbumDetailScreen } from "@/features/albums";

export const metadata: Metadata = { title: "Album" };

/** Les albums sont connus à la construction : chaque page est prérendue. */
export async function generateStaticParams() {
  const albums = await createCatalogRepositories().albums.list();
  return albums.map((album) => ({ albumId: album.id }));
}

export default function AlbumPage({ params }: PageProps<"/albums/[albumId]">) {
  // Avec Cache Components, un paramètre d'URL se lit sous une frontière Suspense.
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      {params.then(({ albumId }) => (
        <AlbumDetailScreen albumId={albumId} />
      ))}
    </Suspense>
  );
}
