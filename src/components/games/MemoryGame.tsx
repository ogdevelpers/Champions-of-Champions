"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createShuffledDeck, MEMORY_TILES } from "@/lib/game-data/memory-tiles";
import { Button } from "@/components/ui/Button";
import { StatBox } from "@/components/ui/StatBox";
import { GameStartCard, GameResultCard } from "@/components/ui/GameScreen";
import { FadeIn } from "@/components/ui/Animated";
import { formatTime } from "@/lib/utils";

type DeckTile = ReturnType<typeof createShuffledDeck>[number];

const TOTAL_PAIRS = MEMORY_TILES.length;

export function MemoryGame() {
  const [deck, setDeck] = useState<DeckTile[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [actions, setActions] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lockRef = useRef(false);

  const initGame = useCallback(() => {
    setDeck(createShuffledDeck());
    setFlipped([]);
    setMatched([]);
    setActions(0);
    setCompleted(false);
    setElapsed(0);
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started || completed) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, completed]);

  const saveResults = async (finalActions: number, finalTime: number) => {
    setSaving(true);
    try {
      await fetch("/api/games/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions: finalActions,
          timeTakenSeconds: finalTime,
          completed: true,
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTileClick = (tile: DeckTile) => {
    if (lockRef.current) return;
    if (flipped.includes(tile.uniqueId) || matched.includes(tile.pairId)) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, tile.uniqueId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setActions((a) => a + 1);
      lockRef.current = true;

      const [first, second] = newFlipped;
      const firstTile = deck.find((t) => t.uniqueId === first)!;
      const secondTile = deck.find((t) => t.uniqueId === second)!;

      if (firstTile.pairId === secondTile.pairId) {
        const newMatched = [...matched, firstTile.pairId];
        setMatched(newMatched);
        setFlipped([]);
        lockRef.current = false;

        if (newMatched.length === TOTAL_PAIRS) {
          setCompleted(true);
          if (timerRef.current) clearInterval(timerRef.current);
          saveResults(actions + 1, elapsed);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 900);
      }
    }
  };

  if (!started) {
    return (
      <GameStartCard
        emoji="🧩"
        title="Memory Match"
        description={`Flip tiles one at a time to find matching pairs. Match all ${TOTAL_PAIRS} pairs to win!`}
        onStart={initGame}
      />
    );
  }

  if (completed) {
    return (
      <GameResultCard
        emoji="🎉"
        title="Congratulations!"
        footer={
          <Button onClick={initGame} variant="secondary" size="lg">
            Play Again
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Actions" value={actions} />
          <StatBox label="Time" value={formatTime(elapsed)} />
        </div>
        {saving && (
          <p className="mt-4 text-sm text-cream/40 animate-pulse">Saving results...</p>
        )}
      </GameResultCard>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="glass-panel grid grid-cols-2 gap-4 rounded-2xl p-5">
          <StatBox label="Actions" value={actions} className="border-0 bg-transparent p-0" />
          <StatBox label="Time" value={formatTime(elapsed)} className="border-0 bg-transparent p-0 text-right" />
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3 perspective-1000 sm:grid-cols-4">
          {deck.map((tile) => {
            const isFlipped = flipped.includes(tile.uniqueId) || matched.includes(tile.pairId);
            const isMatched = matched.includes(tile.pairId);

            return (
              <button
                key={tile.uniqueId}
                onClick={() => handleTileClick(tile)}
                className={`aspect-square cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed ${isMatched ? "tile-matched" : ""}`}
                disabled={isMatched}
                aria-label={isFlipped ? tile.label : "Hidden tile"}
              >
                <div
                  className="tile-3d relative h-full w-full"
                  style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  <div className="tile-face absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-gold/25 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 shadow-md">
                    <span className="text-3xl opacity-50">★</span>
                  </div>
                  <div
                    className="tile-face absolute inset-0 overflow-hidden rounded-2xl border-2 border-white/20 shadow-lg"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tile.imageUrl}
                      alt={tile.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </FadeIn>
    </div>
  );
}
