import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GameHeader } from "@/components/GameHeader";
import { GameGrid } from "@/components/GameGrid";
import { PageShell } from "@/components/PageShell";
import { FadeIn } from "@/components/ui/Animated";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <PageShell>
      <GameHeader
        title="Game Dashboard"
        subtitle={session.name ? `Welcome, ${session.name}` : `ID: ${session.employeeId}`}
        showBack={false}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <FadeIn className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            <span className="gold-gradient-text">Choose Your Game</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-cream/55">
            Play all four games and stand a chance to win exciting prizes!
          </p>
        </FadeIn>

        <GameGrid />

        <FadeIn delay={500} className="mt-14 text-center">
          <p className="animate-marquee text-sm tracking-widest text-cream/30">
            ★ BE THE CHAMPION · OWN THE SPOTLIGHT ★
          </p>
        </FadeIn>
      </main>
    </PageShell>
  );
}
