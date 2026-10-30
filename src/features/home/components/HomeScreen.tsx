"use client";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ownedClubIds, totalCards } from "@/domain";
import { AlbumRow } from "@/features/albums";
import {
  BoosterPack,
  BoosterPips,
  NextBoosterCountdown,
} from "@/features/boosters";
import { ClubCard } from "@/features/cards";
import { GameGate, type ReadyGame } from "@/features/game";
import { InstallAppCard } from "@/features/install";
import { featuredAlbums } from "../lib/featuredAlbums";
import { SeasonTeaser } from "@/features/season";
import { VipBoosterCard } from "@/features/vip";
import { GiveawayBanner } from "./GiveawayBanner";
import { LeaderboardTeaser } from "./LeaderboardTeaser";
import { MissionsSummary } from "./MissionsSummary";
import { StreakCard } from "./StreakCard";

const FEATURED_ALBUMS = 3;
const RECENT_CARDS = 8;

export function HomeScreen() {
  return <GameGate>{(game) => <Home game={game} />}</GameGate>;
}

function Home({ game }: { readonly game: ReadyGame }) {
  const owned = ownedClubIds(game.collection);
  const completion =
    game.clubs.length === 0 ? 0 : owned.size / game.clubs.length;
  const albums = featuredAlbums(
    game.albums,
    game.clubs,
    owned,
    FEATURED_ALBUMS,
  );
  const recentCards = [...game.collection]
    .sort((a, b) => b.firstObtainedAt.localeCompare(a.firstObtainedAt))
    .slice(0, RECENT_CARDS);
  const available = game.boosters.free + game.boosters.bonus;
  const hasBoosters = available > 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <ScreenHeader eyebrow="Club-house" title="Jour de match" />

      <InstallAppCard dismissible />

      <StreakCard streak={game.streak} onClaim={game.claimStreak} />
      <VipBoosterCard vip={game.vip} onClaim={game.claimVipBooster} />

      <GiveawayBanner giveaways={game.giveaways} onClaim={game.claimGiveaway} />
      <SeasonTeaser progress={game.season} />

      <section className="panel relative overflow-hidden p-5 sm:p-7">
        <div className="relative z-10 flex max-w-[62%] flex-col gap-4 sm:max-w-sm">
          <BoosterPips stock={game.boosters} />
          <h2 className="text-4xl font-extrabold sm:text-5xl">
            {hasBoosters
              ? `${available} booster${available > 1 ? "s" : ""} à ouvrir`
              : "Réserve vide"}
          </h2>
          {hasBoosters && game.boosters.nextFreeAt === null ? (
            <p className="text-chalk-muted text-sm text-pretty">
              Cinq clubs par booster, du Top 14 à la Fédérale 3.
            </p>
          ) : null}
          <NextBoosterCountdown
            nextFreeAt={game.boosters.nextFreeAt}
            onElapsed={game.refresh}
          />
          <ButtonLink
            href={hasBoosters ? "/boosters" : "/collection"}
            className="self-start"
          >
            {hasBoosters ? "Ouvrir" : "Ma collection"}
          </ButtonLink>
        </div>
        <BoosterPack
          spent={!hasBoosters}
          className="absolute top-1/2 -right-4 w-36 -translate-y-1/2 rotate-12 sm:right-8 sm:w-44"
        />
      </section>

      <MissionsSummary missions={game.missions} />

      <LeaderboardTeaser />

      <section className="panel flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-chalk-muted text-xl font-bold tracking-wider">
            Clubs collectionnés
          </h2>
          <p className="font-display text-3xl font-bold tabular-nums">
            {owned.size}
            <span className="text-chalk-muted text-lg">
              /{game.clubs.length}
            </span>
          </p>
        </div>
        <ProgressBar ratio={completion} label="Clubs collectionnés" />
        <p className="text-chalk-muted text-sm tabular-nums">
          {totalCards(game.collection)} cartes au total
        </p>
      </section>

      {recentCards.length > 0 ? (
        <section aria-labelledby="recent-cards" className="flex flex-col gap-3">
          <h2
            id="recent-cards"
            className="text-chalk-muted text-xl font-bold tracking-wider"
          >
            Dernières cartes
          </h2>
          <ul className="-mx-4 flex scrollbar-none gap-3 overflow-x-auto px-4 pt-1 pb-4 sm:mx-0 sm:px-0">
            {recentCards.map((card) => {
              const club = game.clubsById.get(card.clubId);
              return club ? (
                <li
                  key={`${card.clubId}:${card.rarity}`}
                  className="w-32 shrink-0 sm:w-36"
                >
                  <ClubCard club={club} rarity={card.rarity} />
                </li>
              ) : null;
            })}
          </ul>
        </section>
      ) : null}

      {albums.length > 0 ? (
        <section
          aria-labelledby="featured-albums"
          className="flex flex-col gap-3"
        >
          <h2
            id="featured-albums"
            className="text-chalk-muted text-xl font-bold tracking-wider"
          >
            Albums en cours
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map(({ album, progress }) => (
              <li key={album.id}>
                <AlbumRow
                  album={album}
                  progress={progress}
                  rewardStatus="locked"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
