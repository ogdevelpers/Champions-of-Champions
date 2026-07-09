import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemoryGame } from "@/components/games/MemoryGame";
import { GamePageLayout } from "@/components/GamePageLayout";
import { getMemorySubmission } from "@/lib/games/memory-status";
import { isGameOpen } from "@/lib/games/config";
import { GamesClosedNotice } from "@/components/games/GamesClosedNotice";

export const runtime = "edge";

export default async function MemoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const previousSubmission = await getMemorySubmission(session.employeeId);

  return (
    <GamePageLayout title="Memory Match" subtitle="Find all matching pairs" fitViewport>
      <main className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
        {!isGameOpen("memory") ? (
          <div className="flex h-full min-h-0 items-center justify-center">
            <GamesClosedNotice />
          </div>
        ) : (
          <MemoryGame
            hasPlayed={!!previousSubmission}
            previousActions={previousSubmission?.actions}
            previousTimeSeconds={previousSubmission?.time_taken_seconds}
          />
        )}
      </main>
    </GamePageLayout>
  );
}
