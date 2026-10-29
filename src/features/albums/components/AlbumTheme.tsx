import type { ReactNode } from "react";
import { DEFAULT_COSMETICS, type CosmeticIdOf } from "@/domain";
import { cn } from "@/lib/utils";
import styles from "./AlbumTheme.module.css";

/** Surface habillée par un thème d'album (en-tête de page, aperçu en boutique). */
export function AlbumThemeSurface({
  theme,
  className,
  children,
}: {
  readonly theme: CosmeticIdOf<"album-theme">;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <div
      data-album-theme={
        theme === DEFAULT_COSMETICS["album-theme"] ? undefined : theme
      }
      className={cn(styles.surface, className)}
    >
      {children}
    </div>
  );
}
