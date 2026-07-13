import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DubsmashGame } from "@/components/games/DubsmashGame";
import { GamePageLayout } from "@/components/GamePageLayout";
import { isGameOpen } from "@/lib/games/config";
import { GamesClosedNotice } from "@/components/games/GamesClosedNotice";
import { EventScheduleNotice } from "@/components/games/EventScheduleNotice";

export const runtime = "edge";

export default async function DubsmashPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <GamePageLayout title="Dubsmash" subtitle="Enact your favourite Bollywood dialogues">
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 pb-12 md:py-12 md:pb-16">
        {!isGameOpen("dubsmash") ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <GamesClosedNotice />
          </div>
        ) : !session.canPlayGames ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <EventScheduleNotice />
          </div>
        ) : (
          <DubsmashGame />
        )}
      </main>
    </GamePageLayout>
  );
}
