import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { GameHeader } from "@/components/GameHeader";
import { GameGrid } from "@/components/GameGrid";
import { LiveStreamPlayer } from "@/components/LiveStreamPlayer";
import { PageShell } from "@/components/PageShell";
import { FadeIn } from "@/components/ui/Animated";

export const runtime = "edge";

interface DashboardPageProps {
  searchParams: Promise<{ ineligible?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const showIneligibleMessage = params.ineligible === "1" || !session.canPlayGames;

  return (
    <PageShell>
      <GameHeader
        title="Champions Dashboard"
        subtitle="Live event & games"
        showBack={false}
      />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 pb-14 sm:space-y-10 sm:py-8 sm:pb-16 md:space-y-12 md:py-10">
        <FadeIn>
          <DashboardWelcome session={session} />
        </FadeIn>

        {showIneligibleMessage && (
          <FadeIn>
            <div className="rounded-2xl border border-amber-400/50 bg-amber-500/20 px-5 py-4 text-center text-sm font-medium text-amber-50">
              Your employee ID is valid, but you are not eligible to play games yet. Please
              contact your administrator if you believe this is a mistake.
            </div>
          </FadeIn>
        )}

        <FadeIn delay={100}>
          <DashboardSection
            id="live-stream"
            eyebrow="Section 01"
            title="Live Event Stream"
            description="Watch the Champions of Champions event live. Fullscreen is available for a better viewing experience."
            variant="stream"
            contentClassName="flex justify-center"
          >
            <LiveStreamPlayer className="w-full" />
          </DashboardSection>
        </FadeIn>

        <FadeIn delay={200}>
          <DashboardSection
            id="games"
            eyebrow="Section 02"
            title="Play & Compete"
            description={
              session.canPlayGames
                ? "Choose a game below. Complete challenges, save your creations, and climb the leaderboard."
                : "Games will unlock here once your account is marked eligible to play."
            }
            variant="elevated"
          >
            <GameGrid canPlayGames={session.canPlayGames} />
          </DashboardSection>
        </FadeIn>

        <FadeIn delay={300} className="pt-2 text-center">
          <p className="text-muted text-sm tracking-[0.2em]">
            ★ BE THE CHAMPION · OWN THE SPOTLIGHT ★
          </p>
        </FadeIn>
      </main>
    </PageShell>
  );
}
