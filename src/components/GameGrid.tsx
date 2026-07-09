"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stagger } from "@/components/ui/Animated";
import { cn, formatTime } from "@/lib/utils";
import { isGameOpen, type GameId } from "@/lib/games/config";

interface GameDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
  tag: string;
  accent: string;
  oneAttempt?: boolean;
}

const GAMES: GameDefinition[] = [
  {
    id: "memory",
    title: "Memory Match",
    description: "Flip tiles, find matching pairs — fewer moves and faster time wins!",
    emoji: "🧩",
    href: "/games/memory",
    tag: "One Attempt",
    accent: "from-emerald-500/20 to-teal-600/10",
    oneAttempt: true,
  },
  {
    id: "dubsmash",
    title: "Dubsmash",
    description: "Enact iconic Bollywood dialogues and save your blockbuster moment!",
    emoji: "🎤",
    href: "/games/dubsmash",
    tag: "Record & Share",
    accent: "from-purple-500/20 to-pink-600/10",
  },
];

interface GameGridProps {
  hasPlayedMemoryGame?: boolean;
  previousMemoryActions?: number;
  previousMemoryTimeSeconds?: number;
}

function isGameDisabled(
  game: GameDefinition,
  hasPlayedMemoryGame: boolean
): boolean {
  if (game.id === "memory" && hasPlayedMemoryGame) return true;
  return false;
}

function getDisabledLabel(
  game: GameDefinition,
  hasPlayedMemoryGame: boolean,
  previousMemoryActions?: number,
  previousMemoryTimeSeconds?: number
): string {
  if (game.id === "memory" && hasPlayedMemoryGame) {
    const timeLabel =
      typeof previousMemoryTimeSeconds === "number"
        ? formatTime(previousMemoryTimeSeconds)
        : "—";
    return `Already played · ${previousMemoryActions ?? 0} actions · ${timeLabel}`;
  }
  return "Play Now →";
}

export function GameGrid({
  hasPlayedMemoryGame = false,
  previousMemoryActions,
  previousMemoryTimeSeconds,
}: GameGridProps) {
  const visibleGames = GAMES.filter((game) => isGameOpen(game.id as GameId));

  return (
    <div
      className={cn(
        "grid w-full gap-4",
        visibleGames.length === 1
          ? "mx-auto max-w-xl grid-cols-1"
          : "grid-cols-1 sm:grid-cols-2 sm:gap-5"
      )}
    >
      {visibleGames.map((game, i) => {
        const disabled = isGameDisabled(game, hasPlayedMemoryGame);
        const disabledLabel = getDisabledLabel(
          game,
          hasPlayedMemoryGame,
          previousMemoryActions,
          previousMemoryTimeSeconds
        );

        return (
          <Stagger key={game.id} index={i + 1} className="h-full w-full">
            {disabled ? (
              <div className="block h-full w-full cursor-not-allowed" aria-disabled="true">
                <GameCard game={game} disabled disabledLabel={disabledLabel} />
              </div>
            ) : (
              <Link href={game.href} className="block h-full w-full cursor-pointer">
                <GameCard game={game} />
              </Link>
            )}
          </Stagger>
        );
      })}
    </div>
  );
}

function GameCard({
  game,
  disabled = false,
  disabledLabel = "Play Now →",
}: {
  game: GameDefinition;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  return (
    <Card
      glow
      interactive={!disabled}
      className={cn(
        "group h-full w-full overflow-hidden p-0",
        disabled && "opacity-50 saturate-50"
      )}
    >
      <div className={cn("bg-gradient-to-br p-5 sm:p-6", game.accent)}>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-brand-header/50 text-3xl shadow-inner transition-all duration-500 sm:h-16 sm:w-16 sm:text-4xl group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-gold/20">
            {game.emoji}
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center sm:items-start">
            <Badge>{game.tag}</Badge>
            <h3 className="mt-2 font-display text-lg font-bold text-cream transition-colors duration-300 sm:text-xl group-hover:text-gold">
              {game.title}
            </h3>
            <p className="text-body mt-2 text-sm leading-relaxed">{game.description}</p>
            <p className="mt-4 text-sm font-bold text-gold-light transition-all duration-300 group-hover:translate-x-0.5">
              {disabled ? disabledLabel : "Play Now →"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
