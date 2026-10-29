"use client";

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BoosterOpening, Repositories } from "@/data";
import type {
  Album,
  BoosterOfferId,
  Club,
  Leaderboard,
  PlayerSnapshot,
  RegionId,
  SeasonTrack,
} from "@/domain";
import { createServerRepositories } from "./lib/server-repositories";

interface GameCatalog {
  readonly clubs: readonly Club[];
  readonly clubsById: ReadonlyMap<string, Club>;
  readonly albums: readonly Album[];
}

export type OpenedBooster = Pick<BoosterOpening, "cards" | "special">;

/** Actions du joueur. Chacune met l'état partagé à jour une fois terminée. */
interface GameActions {
  /** Cartes tirées (et carte spéciale éventuelle) ; l'état suit tout seul. */
  readonly openBooster: () => Promise<OpenedBooster>;
  readonly buyBoosters: (offerId: BoosterOfferId) => Promise<void>;
  readonly claimMission: (missionId: string) => Promise<void>;
  readonly claimAlbumReward: (albumId: string) => Promise<void>;
  readonly claimGiveaway: (giveawayId: string) => Promise<void>;
  readonly claimSeasonTier: (tier: number, track: SeasonTrack) => Promise<void>;
  readonly claimStreak: () => Promise<void>;
  readonly setUsername: (username: string) => Promise<void>;
  /** Classement du moment (non partagé : chaque écran le demande au besoin). */
  readonly loadLeaderboard: (region: RegionId | null) => Promise<Leaderboard>;
  /** Relit l'état du joueur (un booster gratuit vient d'arriver, par exemple). */
  readonly refresh: () => Promise<void>;
}

export type GameState =
  | { readonly status: "loading" }
  | { readonly status: "error" }
  | ({ readonly status: "ready" } & GameCatalog & PlayerSnapshot & GameActions);

export type ReadyGame = Extract<GameState, { status: "ready" }>;

const GameContext = createContext<GameState | null>(null);

/** Dépose l'état du joueur lu par le serveur ; `null` s'il n'a pas pu le lire. */
type SeedPlayer = (snapshot: PlayerSnapshot | null) => void;
const SeedContext = createContext<SeedPlayer | null>(null);

interface GameProviderProps {
  readonly children: ReactNode;
  /** Injectable pour les tests ; par défaut, l'état du joueur est arbitré par le serveur. */
  readonly repositories?: Repositories;
  /**
   * L'état du joueur arrive du serveur avec la page (`<InitialPlayer>`) :
   * inutile de le redemander une fois la page chargée.
   */
  readonly seeded?: boolean;
}

/** Charge l'état du jeu et le partage aux écrans. */
export function GameProvider({
  children,
  repositories: injected,
  seeded = false,
}: GameProviderProps) {
  const [repositories] = useState(() => injected ?? createServerRepositories());
  const [catalog, setCatalog] = useState<GameCatalog | null>(null);
  const [player, setPlayer] = useState<PlayerSnapshot | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  // Sans état fourni par le serveur (ou s'il n'a pas pu le lire), on le demande.
  const [mustFetch, setMustFetch] = useState(!seeded);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([repositories.clubs.list(), repositories.albums.list()])
      .then(([clubs, albums]) => {
        if (!isCurrent) return;
        setCatalog({
          clubs,
          clubsById: new Map(clubs.map((club) => [club.id, club])),
          albums,
        });
      })
      .catch(() => {
        if (isCurrent) setHasFailed(true);
      });
    return () => {
      isCurrent = false;
    };
  }, [repositories]);

  useEffect(() => {
    if (!mustFetch) return;
    let isCurrent = true;
    repositories.player
      .get()
      .then((snapshot) => {
        if (isCurrent) setPlayer(snapshot);
      })
      .catch(() => {
        if (isCurrent) setHasFailed(true);
      });
    return () => {
      isCurrent = false;
    };
  }, [repositories, mustFetch]);

  const seed = useMemo<SeedPlayer>(
    () => (snapshot) => {
      // L'état lu par le serveur fait foi : il remplace celui gardé en
      // mémoire (écran restauré par Next.js, éventuellement d'un autre compte).
      if (snapshot) setPlayer(snapshot);
      else setMustFetch(true);
    },
    [],
  );

  const actions = useMemo<GameActions>(
    () => ({
      openBooster: async () => {
        const opening = await repositories.player.openBooster();
        setPlayer(opening.player);
        return { cards: opening.cards, special: opening.special };
      },
      buyBoosters: async (offerId) =>
        setPlayer(await repositories.player.buyBoosters(offerId)),
      claimMission: async (missionId) =>
        setPlayer(await repositories.player.claimMission(missionId)),
      claimAlbumReward: async (albumId) =>
        setPlayer(await repositories.player.claimAlbumReward(albumId)),
      claimGiveaway: async (giveawayId) =>
        setPlayer(await repositories.player.claimGiveaway(giveawayId)),
      claimSeasonTier: async (tier, track) =>
        setPlayer(await repositories.player.claimSeasonTier(tier, track)),
      claimStreak: async () =>
        setPlayer(await repositories.player.claimStreak()),
      setUsername: async (username) =>
        setPlayer(await repositories.player.setUsername(username)),
      loadLeaderboard: (region) => repositories.leaderboard.get(region),
      refresh: async () => setPlayer(await repositories.player.get()),
    }),
    [repositories],
  );

  const state = useMemo<GameState>(() => {
    if (hasFailed) return { status: "error" };
    if (!catalog || !player) return { status: "loading" };
    return { status: "ready", ...catalog, ...player, ...actions };
  }, [catalog, player, hasFailed, actions]);

  return (
    <SeedContext value={seed}>
      <GameContext value={state}>{children}</GameContext>
    </SeedContext>
  );
}

export function useGame(): GameState {
  const state = use(GameContext);
  if (!state) throw new Error("useGame doit être utilisé sous <GameProvider>.");
  return state;
}

/** Remet au `GameProvider` l'état du joueur lu par le serveur avec la page. */
export function PlayerSeed({
  snapshot,
}: {
  readonly snapshot: PlayerSnapshot | null;
}) {
  const seed = use(SeedContext);
  useEffect(() => {
    seed?.(snapshot);
  }, [seed, snapshot]);
  return null;
}
