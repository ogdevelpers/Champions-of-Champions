import { MemoryGame } from "@/components/games/MemoryGame";
import { GamePageLayout } from "@/components/GamePageLayout";

export default function MemoryPage() {
  return (
    <GamePageLayout title="Memory Match" subtitle="Find all matching pairs" fitViewport>
      <main className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
        <MemoryGame />
      </main>
    </GamePageLayout>
  );
}
