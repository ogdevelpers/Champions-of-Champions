import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { AppHeader } from "@/components/AppHeader";
import { GameGrid } from "@/components/GameGrid";
import { LiveStreamPlayer } from "@/components/LiveStreamPlayer";
import { PageShell } from "@/components/PageShell";
import { FadeIn } from "@/components/ui/Animated";
import { hasOpenGames } from "@/lib/games/config";
import { GamesClosedNotice } from "@/components/games/GamesClosedNotice";

export const runtime = "edge";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <PageShell overlay={false}>
      <AppHeader
        title="Champions of Champions"
        subtitle="Employee engagement microsite"
        showLogout
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-6 pb-14 sm:space-y-10 sm:py-8 sm:pb-16 md:space-y-12 md:py-10">
        <FadeIn>
          <DashboardSection
            id="live-stream"
            title="Live Event Stream"
            description="Watch the Champions of Champions event live. Fullscreen is available for a better viewing experience."
            variant="stream"
            contentClassName="flex justify-center"
          >
            <LiveStreamPlayer
              participant={{
                employeeId: session.employeeId,
                participantId: session.participantId,
                name: session.name ?? session.employeeId,
                email: session.email ?? "",
              }}
              className="w-full"
            />
          </DashboardSection>
        </FadeIn>

        {!hasOpenGames() ? (
          <FadeIn delay={100}>
            <div className="flex min-h-[24vh] items-center justify-center py-8">
              <GamesClosedNotice />
            </div>
          </FadeIn>
        ) : session.canPlayGames ? (
          <FadeIn delay={100}>
            <DashboardSection
              id="games"
              title="Play & Compete"
              description="Dubsmash and Champion Click are live — pick a challenge and compete!"
              variant="elevated"
            >
              <GameGrid />
            </DashboardSection>
          </FadeIn>
        ) : null}

        <div className="relative z-20 rounded-2xl border-2 border-gold bg-brand-header/90 px-4 py-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:px-6 sm:py-5">
          <p className="font-display text-sm font-bold uppercase leading-relaxed tracking-[0.18em] text-cream sm:text-base">
            <span className="text-gold">★</span> Be The Champion · Own The Spotlight{" "}
            <span className="text-gold">★</span>
          </p>
        </div>
      </main>
    </PageShell>
  );
}
