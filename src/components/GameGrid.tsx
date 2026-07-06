"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, Stagger } from "@/components/ui/Animated";

const GAMES = [
  {
    id: "retro-poster",
    title: "Retro Posters",
    description: "Take a selfie and star in classic Bollywood posters with AI face mapping.",
    emoji: "🎞️",
    href: "/games/retro-poster",
    tag: "Create & Download",
    accent: "from-amber-500/20 to-orange-600/10",
  },
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
    tag: "3×3 Grid",
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

export function GameGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {GAMES.map((game, i) => (
        <Stagger key={game.id} index={i + 1}>
          <Link href={game.href} className="block h-full">
            <Card glow interactive className="group h-full p-0 overflow-hidden">
              <div className={`bg-gradient-to-br ${game.accent} p-6`}>
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-maroon-dark/50 text-4xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-gold/20">
                    {game.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge>{game.tag}</Badge>
                    <h3 className="mt-2 font-display text-xl font-bold text-cream transition-colors duration-300 group-hover:text-gold">
                      {game.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream/55">
                      {game.description}
                    </p>
                    <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-gold opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                      Play Now
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </Stagger>
      ))}
    </div>
  );
}
