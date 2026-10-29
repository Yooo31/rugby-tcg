import { useId } from "react";
import type { Club } from "@/domain";
import {
  CREST_VIEWBOX,
  crestDesign,
  SYMBOL_TRANSFORM,
  symbolLayers,
  TRIM_WIDTH,
} from "../lib/crest";

/**
 * Blason généré depuis le club (couleurs, symbole, sigle, division). Il remplace les
 * logos officiels, dont nous n'avons pas les droits. Dessin : `lib/crest.ts`.
 */
export function ClubCrest({ club }: { readonly club: Club }) {
  const clipId = useId();
  const design = crestDesign(club);

  return (
    <svg
      viewBox={CREST_VIEWBOX}
      role="img"
      aria-label={`Blason de ${club.name}`}
    >
      <clipPath id={clipId}>
        <path d={design.shield} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="100" height="116" fill={design.field} />
        <path d={design.pattern} fill={design.charge} />
        <rect width="50" height="116" fill="#000" opacity="0.12" />
        <g transform={SYMBOL_TRANSFORM}>
          {symbolLayers(design).map((layer, index) => (
            <path
              key={index}
              {...layer}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
        {design.trim ? (
          <path
            d={design.shield}
            fill="none"
            stroke={design.trim}
            strokeWidth={TRIM_WIDTH}
          />
        ) : null}
      </g>
      <path
        d={design.shield}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.85"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {design.stars.map((star) => (
        <path
          key={star}
          d={star}
          fill="#fff"
          stroke="#0b131a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ))}
      <text
        x="50"
        y={design.initialsLayout.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize={design.initialsLayout.size}
        fill={design.ink}
        stroke={design.field}
        strokeWidth={design.initialsLayout.size / 5}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {design.initials}
      </text>
    </svg>
  );
}
