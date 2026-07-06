import { GameHeader } from "@/components/GameHeader";
import { MemoryGame } from "@/components/games/MemoryGame";
import { PageShell } from "@/components/PageShell";

export default function MemoryPage() {
  return (
    <PageShell>
      <GameHeader title="Memory Match" subtitle="Find all matching pairs" />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <MemoryGame />
      </main>
    </PageShell>
  );
}
