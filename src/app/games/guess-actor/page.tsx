import { GuessActorGame } from "@/components/games/GuessActorGame";
import { GamePageLayout } from "@/components/GamePageLayout";

export default function GuessActorPage() {
  return (
    <GamePageLayout
      title="Guess The Star"
      subtitle="24 smiles · 30 seconds · 4 options each"
      fitViewport
    >
      <main className="mx-auto flex w-full max-w-xl flex-1 min-h-0 flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
        <GuessActorGame />
      </main>
    </GamePageLayout>
  );
}
