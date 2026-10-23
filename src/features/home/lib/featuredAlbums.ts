import {
  albumProgress,
  type Album,
  type AlbumProgress,
  type Club,
} from "@/domain";

export interface FeaturedAlbum {
  readonly album: Album;
  readonly progress: AlbumProgress;
}

/**
 * Albums mis en avant sur l'accueil : ceux qui sont entamés et les plus proches
 * d'être terminés, pour donner envie d'aller chercher les cartes manquantes.
 */
export function featuredAlbums(
  albums: readonly Album[],
  clubs: readonly Club[],
  ownedClubs: ReadonlySet<string>,
  limit: number,
): FeaturedAlbum[] {
  return albums
    .map((album) => ({
      album,
      progress: albumProgress(album, clubs, ownedClubs),
    }))
    .filter(({ progress }) => progress.owned > 0 && !progress.isComplete)
    .sort(
      (a, b) =>
        b.progress.ratio - a.progress.ratio ||
        a.progress.total - b.progress.total,
    )
    .slice(0, limit);
}
