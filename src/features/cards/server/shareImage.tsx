import "server-only";
import { ImageResponse } from "next/og";
import { catalogClub, ownsCard, referralData } from "@/data/server";
import {
  computePower,
  getDivision,
  raritySchema,
  rarityLabel,
  type Rarity,
} from "@/domain";
import { getAuthUser } from "@/features/auth/server";
import { crestDesign, crestSvgMarkup } from "../lib/crest";

/** Format story (Instagram, WhatsApp, TikTok…). */
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

/**
 * Couleurs des raretés et du fond. Copie des tokens de `globals.css`
 * (`--color-rarity-*`, `--color-night`…) : le moteur d'image ne lit pas le CSS.
 */
const RARITY_COLORS: Readonly<Record<Rarity, string>> = {
  common: "#9fb0bb",
  rare: "#58b4ff",
  epic: "#c084ff",
  legendary: "#f2c14e",
};
const NIGHT = "#05080a";
const CHALK = "#eef2f0";
const CHALK_MUTED = "#9aa5a0";
const PITCH = "#3ddc84";

/**
 * Image d'une carte à partager en story, avec le code de parrainage du
 * joueur. Seulement pour une carte qu'il possède : pas de fausse légendaire.
 */
export async function shareImageResponse(request: Request): Promise<Response> {
  const user = await getAuthUser();
  if (!user) return new Response("Connexion requise.", { status: 401 });

  const params = new URL(request.url).searchParams;
  const club = catalogClub(params.get("club") ?? "");
  const rarity = raritySchema.safeParse(params.get("rarete"));
  if (
    !club ||
    !rarity.success ||
    !(await ownsCard(user.id, club.id, rarity.data))
  )
    return new Response("Carte introuvable.", { status: 404 });

  const { code } = await referralData.summary(user.id);
  const design = crestDesign(club);
  const crest = `data:image/svg+xml;base64,${Buffer.from(crestSvgMarkup(design)).toString("base64")}`;
  const accent = RARITY_COLORS[rarity.data];
  const site = new URL(
    process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000",
  ).host;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "120px 80px",
        backgroundColor: NIGHT,
        backgroundImage: `radial-gradient(circle at 50% 42%, ${accent}55 0%, ${NIGHT} 62%)`,
        color: CHALK,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: 4,
        }}
      >
        RUGBY <span style={{ color: PITCH, marginLeft: 16 }}>TCG</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 780,
          padding: "64px 48px",
          borderRadius: 48,
          border: `8px solid ${accent}`,
          backgroundColor: "#0d1418",
          boxShadow: `0 0 120px ${accent}88`,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            fontSize: 40,
            color: CHALK_MUTED,
          }}
        >
          <span>{getDivision(club.division).label}</span>
          <span style={{ color: CHALK, fontSize: 72, fontWeight: 800 }}>
            {computePower(club)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 420,
            height: 487,
            marginTop: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- moteur d'image, pas une page */}
          <img src={crest} width={420} height={487} alt="" />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: design.stars.length > 0 ? 220 : 190,
              display: "flex",
              justifyContent: "center",
              fontSize: design.initials.length > 2 ? 120 : 150,
              fontWeight: 800,
              color: design.ink,
            }}
          >
            {design.initials}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 64,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {club.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontSize: 40,
            color: CHALK_MUTED,
          }}
        >
          {club.city}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            padding: "12px 40px",
            borderRadius: 999,
            backgroundColor: accent,
            color: NIGHT,
            fontSize: 44,
            fontWeight: 800,
          }}
        >
          {rarityLabel(rarity.data).toUpperCase()}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 44,
        }}
      >
        <span>Viens collectionner les clubs avec moi</span>
        <span
          style={{ marginTop: 20, fontSize: 56, fontWeight: 800, color: PITCH }}
        >
          Code {code} : un booster offert
        </span>
        <span style={{ marginTop: 20, color: CHALK_MUTED }}>{site}</span>
      </div>
    </div>,
    {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
