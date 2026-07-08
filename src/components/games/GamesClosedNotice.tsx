import { GAMES_CLOSED_HEADLINE, GAMES_CLOSED_MESSAGE } from "@/lib/games/config";

export function GamesClosedNotice() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-gold/30 bg-amber-500/15 px-6 py-8 text-center">
      <p className="font-display text-2xl font-bold text-gold-light sm:text-3xl">
        {GAMES_CLOSED_HEADLINE}
      </p>
      <p className="text-body mt-4 text-base leading-relaxed text-cream/85 sm:text-lg">
        {GAMES_CLOSED_MESSAGE}
      </p>
    </div>
  );
}
