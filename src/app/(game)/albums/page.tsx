import type { Metadata } from "next";
import { AlbumsScreen } from "@/features/albums";

export const metadata: Metadata = { title: "Albums" };

export default function AlbumsPage() {
  return <AlbumsScreen />;
}
