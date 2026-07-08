import { GuessActorGame } from "@/components/games/GuessActorGame";
import { GamePageLayout } from "@/components/GamePageLayout";

export default function GuessActorPage() {
  return (
    <GamePageLayout
      title="Guess The Star"
      subtitle="Can you guess the actor from their smile?"
    >
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 md:py-12">
        <GuessActorGame />
      </main>
    </GamePageLayout>
  );
}
