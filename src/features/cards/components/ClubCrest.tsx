import { useId } from "react";
import type { Club } from "@/domain";
import { CREST_VIEWBOX, crestDesign } from "../lib/crest";

/**
 * Blason généré depuis le club (couleurs, sigle, division). Il remplace les
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
        y={design.stars.length > 0 ? 66 : 60}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize={design.initials.length > 2 ? 30 : 38}
        fill={design.ink}
        stroke={design.field}
        strokeWidth="7"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {design.initials}
      </text>
    </svg>
  );
}
