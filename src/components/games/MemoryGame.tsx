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

interface GridLayout {
  cols: number;
  rows: number;
  gap: number;
}

interface GridFit {
  width: number;
  height: number;
  tile: number;
}

function useGridLayout(): GridLayout {
  const [layout, setLayout] = useState<GridLayout>({ cols: 3, rows: 4, gap: 8 });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => {
      setLayout(
        media.matches ? { cols: 4, rows: 3, gap: 12 } : { cols: 3, rows: 4, gap: 8 }
      );
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return layout;
}

function useFitSquareGrid(
  containerRef: React.RefObject<HTMLDivElement | null>,
  layout: GridLayout
): GridFit | null {
  const [fit, setFit] = useState<GridFit | null>(null);
  const { cols, rows, gap } = layout;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const tileByWidth = (width - gap * (cols - 1)) / cols;
      const tileByHeight = (height - gap * (rows - 1)) / rows;
      const tile = Math.floor(Math.min(tileByWidth, tileByHeight));

      setFit({
        tile,
        width: tile * cols + gap * (cols - 1),
        height: tile * rows + gap * (rows - 1),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, cols, rows, gap]);

  return fit;
}

function CenteredScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-hidden px-2">
      {children}
    </div>
  );
}

export function MemoryGame() {
  const [deck, setDeck] = useState<DeckTile[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [actions, setActions] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lockRef = useRef(false);

  const initGame = useCallback(() => {
    setDeck(createShuffledDeck());
    setFlipped([]);
    setMatched([]);
    setActions(0);
    setCompleted(false);
    setScoreSubmitted(false);
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

  const handleSubmitScore = async () => {
    if (scoreSubmitted || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/games/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions,
          timeTakenSeconds: elapsed,
          completed: true,
        }),
      });
      if (res.ok) setScoreSubmitted(true);
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
      <CenteredScreen>
        <GameStartCard
          emoji="🧩"
          title="Memory Match"
          description={`Flip tiles one at a time to find matching pairs. Match all ${TOTAL_PAIRS} pairs to win!`}
          onStart={initGame}
        />
      </CenteredScreen>
    );
  }

  if (completed) {
    return (
      <CenteredScreen>
        <GameResultCard
          emoji="🎉"
          title="Congratulations!"
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleSubmitScore}
                variant="primary"
                size="lg"
                disabled={saving || scoreSubmitted}
              >
                {scoreSubmitted ? "Submitted ✓" : saving ? "Submitting..." : "Submit Score"}
              </Button>
              <Button onClick={initGame} variant="secondary" size="lg">
                Play Again
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Actions" value={actions} />
            <StatBox label="Time" value={formatTime(elapsed)} />
          </div>
        </GameResultCard>
      </CenteredScreen>
    );
  }

  return <MemoryGameBoard deck={deck} actions={actions} elapsed={elapsed} onTileClick={handleTileClick} flipped={flipped} matched={matched} />;
}

interface MemoryGameBoardProps {
  deck: DeckTile[];
  actions: number;
  elapsed: number;
  flipped: string[];
  matched: string[];
  onTileClick: (tile: DeckTile) => void;
}

function MemoryGameBoard({
  deck,
  actions,
  elapsed,
  flipped,
  matched,
  onTileClick,
}: MemoryGameBoardProps) {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const layout = useGridLayout();
  const fit = useFitSquareGrid(gridContainerRef, layout);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 sm:gap-3">
      <FadeIn>
        <div className="glass-panel grid shrink-0 grid-cols-2 gap-3 rounded-2xl p-3 sm:p-4">
          <StatBox label="Actions" value={actions} className="border-0 bg-transparent p-0" />
          <StatBox label="Time" value={formatTime(elapsed)} className="border-0 bg-transparent p-0 text-right" />
        </div>
      </FadeIn>

      <FadeIn delay={100} className="flex min-h-0 flex-1 flex-col">
        <div className="panel-elevated flex min-h-0 flex-1 flex-col rounded-2xl border border-gold/30 p-2 sm:rounded-3xl sm:p-3">
          <div
            ref={gridContainerRef}
            className="flex min-h-0 flex-1 items-center justify-center"
          >
            {fit && (
              <div
                className="grid perspective-1000"
                style={{
                  width: fit.width,
                  height: fit.height,
                  gap: layout.gap,
                  gridTemplateColumns: `repeat(${layout.cols}, ${fit.tile}px)`,
                  gridTemplateRows: `repeat(${layout.rows}, ${fit.tile}px)`,
                }}
              >
                {deck.map((tile) => {
                  const isFlipped = flipped.includes(tile.uniqueId) || matched.includes(tile.pairId);
                  const isMatched = matched.includes(tile.pairId);

                  return (
                    <button
                      key={tile.uniqueId}
                      onClick={() => onTileClick(tile)}
                      className={`cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed sm:rounded-2xl ${isMatched ? "tile-matched" : ""}`}
                      style={{ width: fit.tile, height: fit.tile }}
                      disabled={isMatched}
                      aria-label={isFlipped ? tile.label : "Hidden tile"}
                    >
                      <div
                        className="tile-3d relative h-full w-full"
                        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                      >
                        <div className="tile-face absolute inset-0 flex items-center justify-center rounded-xl border-2 border-gold/25 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 shadow-md sm:rounded-2xl">
                          <span
                            className="opacity-50"
                            style={{ fontSize: Math.max(20, Math.floor(fit.tile * 0.35)) }}
                          >
                            ★
                          </span>
                        </div>
                        <div
                          className="tile-face absolute inset-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-lg sm:rounded-2xl"
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
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
