import { GameHeader } from "@/components/GameHeader";
import { DubsmashGame } from "@/components/games/DubsmashGame";
import { PageShell } from "@/components/PageShell";

export default function DubsmashPage() {
  return (
    <PageShell>
      <GameHeader title="Dubsmash" subtitle="Enact your favourite Bollywood dialogues" />
      <main className="mx-auto max-w-6xl px-4 py-8 pb-12 md:py-12 md:pb-16">
        <DubsmashGame />
      </main>
    </PageShell>
  );
}
