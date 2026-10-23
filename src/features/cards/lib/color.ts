const DARK_INK = "#0b131a";
const LIGHT_INK = "#ffffff";

/** Seuil de luminance au-delà duquel un texte sombre est plus lisible qu'un texte clair. */
const LIGHT_BACKGROUND_THRESHOLD = 0.4;

/** Luminance relative WCAG d'une couleur `#rrggbb`, entre 0 (noir) et 1 (blanc). */
export function relativeLuminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Couleur d'encre lisible sur le fond donné. */
export function readableInkOn(background: string): string {
  return relativeLuminance(background) > LIGHT_BACKGROUND_THRESHOLD
    ? DARK_INK
    : LIGHT_INK;
}
