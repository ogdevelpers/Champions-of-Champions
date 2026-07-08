"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stagger } from "@/components/ui/Animated";
import { cn } from "@/lib/utils";

const GAMES = [
  {
    id: "guess-actor",
    title: "Guess The Star",
    description: "Identify Bollywood actors from their smiles before time runs out!",
    emoji: "⭐",
    href: "/games/guess-actor",
    tag: "Timed Challenge",
    accent: "from-yellow-500/20 to-amber-600/10",
  },
  {
    id: "memory",
    title: "Memory Match",
    description: "Flip tiles, find matching pairs — fewer moves and faster time wins!",
    emoji: "🧩",
    href: "/games/memory",
    tag: "Memory Game",
    accent: "from-emerald-500/20 to-teal-600/10",
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
  canPlayGames?: boolean;
}

export function GameGrid({ canPlayGames = true }: GameGridProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      {GAMES.map((game, i) => (
        <Stagger key={game.id} index={i + 1} className="h-full w-full">
          {canPlayGames ? (
            <Link href={game.href} className="block h-full w-full cursor-pointer">
              <GameCard game={game} />
            </Link>
          ) : (
            <div className="block h-full w-full cursor-not-allowed" aria-disabled="true">
              <GameCard game={game} disabled />
            </div>
          )}
        </Stagger>
      ))}
    </div>
  );
}

function GameCard({
  game,
  disabled = false,
}: {
  game: (typeof GAMES)[number];
  disabled?: boolean;
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
              {disabled ? "Not eligible" : "Play Now →"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
