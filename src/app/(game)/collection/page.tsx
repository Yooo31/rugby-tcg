import type { Metadata } from "next";
import { CollectionScreen } from "@/features/collection";

export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage() {
  return <CollectionScreen />;
}
