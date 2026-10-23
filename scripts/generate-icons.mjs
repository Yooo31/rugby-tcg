// Génère les icônes PWA dans public/icons à partir d'un SVG décrit ici.
// Usage : pnpm icons
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

// sharp est une dépendance de Next, pas du projet : on la résout depuis le paquet next.
const requireFromProject = createRequire(import.meta.url);
const sharp = createRequire(requireFromProject.resolve("next/package.json"))(
  "sharp",
);

const NIGHT = "#05090d";
const PITCH = "#37d67f";
const CHALK = "#eef4f0";

/** `inset` réduit le motif pour la zone de sécurité des icônes « maskable ». */
function iconSvg(size, { inset = 0, rounded = true } = {}) {
  const scale = 1 - inset * 2;
  const offset = size * inset;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rounded ? size * 0.22 : 0}" fill="${NIGHT}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <g transform="rotate(-28 ${size / 2} ${size / 2})">
      <ellipse cx="${size / 2}" cy="${size / 2}" rx="${size * 0.21}" ry="${size * 0.31}" fill="${PITCH}"/>
      <rect x="${size * 0.485}" y="${size * 0.3}" width="${size * 0.03}" height="${size * 0.4}" rx="${size * 0.015}" fill="${NIGHT}"/>
      ${[0.38, 0.46, 0.54, 0.62]
        .map(
          (y) =>
            `<rect x="${size * 0.44}" y="${size * y - size * 0.012}" width="${size * 0.12}" height="${size * 0.024}" rx="${size * 0.012}" fill="${NIGHT}"/>`,
        )
        .join("")}
    </g>
    <rect x="${size * 0.14}" y="${size * 0.14}" width="${size * 0.72}" height="${size * 0.72}" rx="${size * 0.1}" fill="none" stroke="${CHALK}" stroke-opacity="0.9" stroke-width="${size * 0.028}"/>
  </g>
</svg>`;
}

const ICONS = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512, inset: 0.12, rounded: false },
  { file: "apple-touch-icon.png", size: 180, rounded: false },
];

await mkdir("public/icons", { recursive: true });
for (const { file, size, ...options } of ICONS) {
  await sharp(Buffer.from(iconSvg(size, options)))
    .png()
    .toFile(`public/icons/${file}`);
}
await writeFile("src/app/icon.svg", iconSvg(64));
console.log(`${ICONS.length} icônes générées.`);
