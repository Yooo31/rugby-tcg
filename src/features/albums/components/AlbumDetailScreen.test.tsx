import { render, screen } from "@testing-library/react";
import { createInMemoryRepositories, type Repositories } from "@/data";
import { DEFAULT_EQUIPPED } from "@/domain";
import { GameProvider } from "@/features/game";
import { AlbumDetailScreen } from "./AlbumDetailScreen";

async function playerWithTheme(
  theme: (typeof DEFAULT_EQUIPPED)["album-theme"],
): Promise<Repositories> {
  const repositories = createInMemoryRepositories();
  const named = await repositories.player.setUsername("Testeur");
  return {
    ...repositories,
    player: {
      ...repositories.player,
      get: async () => ({
        ...named,
        cosmetics: {
          ...named.cosmetics,
          equipped: { ...DEFAULT_EQUIPPED, "album-theme": theme },
        },
      }),
    },
  };
}

describe("AlbumDetailScreen", () => {
  it("habille l'en-tête avec le thème d'album équipé", async () => {
    const [album] = await createInMemoryRepositories().albums.list();
    render(
      <GameProvider repositories={await playerWithTheme("theme-sunset")}>
        <AlbumDetailScreen albumId={album!.id} />
      </GameProvider>,
    );
    const title = await screen.findByRole("heading", { level: 1 });
    expect(title.closest("[data-album-theme]")).toHaveAttribute(
      "data-album-theme",
      "theme-sunset",
    );
  });

  it("garde le décor du jeu avec le thème de départ", async () => {
    const [album] = await createInMemoryRepositories().albums.list();
    render(
      <GameProvider repositories={await playerWithTheme("theme-night")}>
        <AlbumDetailScreen albumId={album!.id} />
      </GameProvider>,
    );
    const title = await screen.findByRole("heading", { level: 1 });
    expect(title.closest("[data-album-theme]")).toBeNull();
  });
});
