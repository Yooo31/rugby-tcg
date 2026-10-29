"use client";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ButtonLink } from "@/components/ui/button";
import { IngotAmount } from "@/components/ui/reward";
import { VIP_MISSION_COUNT } from "@/domain";
import { GameGate, type ReadyGame } from "@/features/game";
import { MissionCard } from "./MissionCard";

export function MissionsScreen() {
  return <GameGate>{(game) => <Missions game={game} />}</GameGate>;
}

function Missions({ game }: { readonly game: ReadyGame }) {
  const claimed = game.missions.filter(
    (entry) => entry.status === "claimed",
  ).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <ScreenHeader
        eyebrow={`${claimed}/${game.missions.length} terminées · jusqu'à minuit`}
        title="Missions"
      />

      <ul className="grid gap-3 md:grid-cols-3">
        {game.missions.map((entry) => (
          <li key={entry.mission.id}>
            <MissionCard
              entry={entry}
              onClaim={() => game.claimMission(entry.mission.id)}
            />
          </li>
        ))}
      </ul>

      {game.vip.isActive ? null : (
        <section className="panel border-gold/40 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-chalk-muted min-w-0 flex-1 text-sm text-pretty">
            Avec le pass VIP, {VIP_MISSION_COUNT} missions de plus chaque jour.
          </p>
          <ButtonLink href="/vip" variant="secondary">
            Découvrir le VIP
          </ButtonLink>
        </section>
      )}

      <section className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="eyebrow">Vos lingots</p>
          <IngotAmount amount={game.ingots} className="mt-1 text-4xl" />
          <p className="text-chalk-muted mt-2 text-sm">
            Les lingots s&apos;échangent contre des boosters.
          </p>
        </div>
        <ButtonLink href="/boosters" variant="secondary">
          Aller aux boosters
        </ButtonLink>
      </section>
    </div>
  );
}
