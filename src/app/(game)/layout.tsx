import { Suspense } from "react";
import { MotionPreferences } from "@/components/layout/MotionPreferences";
import { GameProvider, GameShell } from "@/features/game";
import { InitialPlayer } from "@/features/game/server";

export default function GameLayout({ children }: LayoutProps<"/">) {
  return (
    <MotionPreferences>
      <GameProvider seeded>
        {/* L'état du joueur arrive en flux avec la page ; le reste n'attend pas. */}
        <Suspense fallback={null}>
          <InitialPlayer />
        </Suspense>
        <GameShell>{children}</GameShell>
      </GameProvider>
    </MotionPreferences>
  );
}
