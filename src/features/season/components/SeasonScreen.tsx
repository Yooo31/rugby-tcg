"use client";

import { Lock } from "lucide-react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { AsyncButton } from "@/components/ui/async-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RewardLabel } from "@/components/ui/reward";
import {
  SEASON_TIERS,
  SEASON_XP_PER_BOOSTER,
  SEASON_XP_PER_MISSION,
  SEASON_XP_PER_TIER,
  type Reward,
  type RewardStatus,
  type Promotion,
  type SeasonProgress,
} from "@/domain";
import { GameGate, type ReadyGame } from "@/features/game";
import { CheckoutButton } from "@/features/payments";
import { cn } from "@/lib/utils";

export function SeasonScreen() {
  return <GameGate>{(game) => <Season game={game} />}</GameGate>;
}

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Paris",
});

function Season({ game }: { readonly game: ReadyGame }) {
  const progress = game.season;
  if (!progress) {
    return (
      <div className="flex flex-col gap-6">
        <ScreenHeader eyebrow="Passe de saison" title="Hors saison" />
        <EmptyState
          title="Pas de saison en cours"
          description="La prochaine saison sera annoncée sur l'accueil. En attendant, les missions du jour continuent."
          action={<ButtonLink href="/missions">Missions du jour</ButtonLink>}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader eyebrow="Passe de saison" title={progress.season.title} />
      <SeasonSummary progress={progress} promotion={game.promotion} />
      <ol aria-label="Paliers de la saison" className="flex flex-col gap-2">
        {progress.tiers.map((entry) => (
          <li
            key={entry.tier}
            className={cn(
              "panel grid grid-cols-[3rem_1fr_1fr] items-start gap-3 p-3",
              entry.tier > progress.tier && "opacity-70",
            )}
          >
            <span className="font-display self-center text-center text-2xl font-bold tabular-nums">
              {entry.tier}
            </span>
            <TrackCell
              label="Gratuit"
              reward={entry.free.reward}
              status={entry.free.status}
              onClaim={() => game.claimSeasonTier(entry.tier, "free")}
            />
            <TrackCell
              label="Payant"
              reward={entry.premium.reward}
              status={entry.premium.status}
              locked={!progress.hasPremium}
              onClaim={() => game.claimSeasonTier(entry.tier, "premium")}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function SeasonSummary({
  progress,
  promotion,
}: {
  readonly progress: SeasonProgress;
  readonly promotion: Promotion | null;
}) {
  const isMaxed = progress.tier >= SEASON_TIERS;
  const intoTier = progress.xp - progress.tier * SEASON_XP_PER_TIER;
  return (
    <section
      aria-labelledby="avancement"
      className="panel flex flex-col gap-3 p-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="avancement" className="text-2xl font-bold">
          Palier {progress.tier} / {SEASON_TIERS}
        </h2>
        <p className="text-chalk-muted text-sm">
          jusqu&apos;au{" "}
          {DATE_FORMAT.format(new Date(progress.season.endsAt - 1))}
        </p>
      </div>
      <ProgressBar
        ratio={isMaxed ? 1 : intoTier / SEASON_XP_PER_TIER}
        complete={isMaxed}
        label={`Avancement vers le palier ${Math.min(progress.tier + 1, SEASON_TIERS)}`}
      />
      <p className="text-chalk-muted text-sm text-pretty">
        {isMaxed
          ? "Dernier palier atteint, bravo !"
          : `${progress.xpToNextTier} points avant le palier suivant.`}{" "}
        Un booster ouvert rapporte {SEASON_XP_PER_BOOSTER} points, une mission
        récupérée {SEASON_XP_PER_MISSION}.
      </p>
      {progress.hasPremium ? null : (
        <div className="flex flex-col gap-2">
          <p className="text-chalk-muted text-sm text-pretty">
            La voie payante ajoute ses récompenses à chaque palier, y compris
            ceux déjà atteints. Achat unique, pour toute la saison.
          </p>
          <CheckoutButton
            product={{ kind: "season-pass", id: progress.season.id }}
            promotion={promotion}
            variant="primary"
            className="sm:w-auto sm:self-start"
          />
        </div>
      )}
    </section>
  );
}

function TrackCell({
  label,
  reward,
  status,
  locked = false,
  onClaim,
}: {
  readonly label: string;
  readonly reward: Reward;
  readonly status: RewardStatus;
  readonly locked?: boolean;
  readonly onClaim: () => Promise<void>;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="eyebrow flex items-center gap-1">
        {locked ? <Lock aria-hidden className="size-3" /> : null}
        {label}
      </span>
      <RewardLabel reward={reward} className="text-base" />
      {status === "claimable" ? (
        <AsyncButton
          onAction={onClaim}
          className="min-h-11 px-3 text-sm"
          aria-label={`Récupérer la récompense ${label.toLowerCase()}`}
        >
          Récupérer
        </AsyncButton>
      ) : status === "claimed" ? (
        <span className="text-pitch text-sm">Récupérée</span>
      ) : null}
    </div>
  );
}
