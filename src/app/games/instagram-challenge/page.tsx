import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InstagramChallengeGame } from "@/components/games/InstagramChallengeGame";
import { GamePageLayout } from "@/components/GamePageLayout";
import { isGameOpen } from "@/lib/games/config";
import { canPlayInstagramChallenge } from "@/lib/games/instagram-challenge";
import { GamesClosedNotice } from "@/components/games/GamesClosedNotice";
import { EventScheduleNotice } from "@/components/games/EventScheduleNotice";
import { getInstagramChallengeSubmission } from "@/lib/games/instagram-challenge-status";

export const runtime = "edge";

export default async function InstagramChallengePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!canPlayInstagramChallenge(session.employeeId)) {
    redirect("/dashboard");
  }

  const submission = session.canPlayGames
    ? await getInstagramChallengeSubmission(session.employeeId)
    : null;

  return (
    <GamePageLayout
      title="Champion Click"
      subtitle="Instagram photo challenge — highest likes wins!"
    >
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 pb-12 md:py-12 md:pb-16">
        {!isGameOpen("instagram-challenge") ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <GamesClosedNotice />
          </div>
        ) : !session.canPlayGames ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <EventScheduleNotice />
          </div>
        ) : (
          <InstagramChallengeGame initialSubmission={submission} />
        )}
      </main>
    </GamePageLayout>
  );
}
