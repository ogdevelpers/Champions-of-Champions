import { GameHeader } from "@/components/GameHeader";
import { GuessActorGame } from "@/components/games/GuessActorGame";
import { PageShell } from "@/components/PageShell";

export default function GuessActorPage() {
  return (
    <PageShell>
      <GameHeader
        title="Guess The Star"
        subtitle="Can you guess the actor from their smile?"
      />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <GuessActorGame />
      </main>
    </PageShell>
  );
}
