import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GuessActorGame } from "@/components/games/GuessActorGame";
import { GamePageLayout } from "@/components/GamePageLayout";
import { getGuessActorSubmission } from "@/lib/games/guess-actor-status";
import { GAMES_WINDOW_OPEN } from "@/lib/games/config";
import { GamesClosedNotice } from "@/components/games/GamesClosedNotice";

export const runtime = "edge";

export default async function GuessActorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const previousSubmission = await getGuessActorSubmission(session.employeeId);

  return (
    <GamePageLayout
      title="Guess the Smile"
      subtitle="24 smiles · 30 seconds · 4 options each"
      fitViewport
    >
      <main className="mx-auto flex w-full max-w-xl flex-1 min-h-0 flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
        {!GAMES_WINDOW_OPEN ? (
          <div className="flex h-full min-h-0 items-center justify-center">
            <GamesClosedNotice />
          </div>
        ) : (
          <GuessActorGame
            hasPlayed={!!previousSubmission}
            previousScore={previousSubmission?.score}
          />
        )}
      </main>
    </GamePageLayout>
  );
}
