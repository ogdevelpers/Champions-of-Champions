import { DubsmashGame } from "@/components/games/DubsmashGame";
import { GamePageLayout } from "@/components/GamePageLayout";

export default function DubsmashPage() {
  return (
    <GamePageLayout title="Dubsmash" subtitle="Enact your favourite Bollywood dialogues">
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 pb-12 md:py-12 md:pb-16">
        <DubsmashGame />
      </main>
    </GamePageLayout>
  );
}
