"use client";

import { useState } from "react";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SelfieCapture } from "@/components/games/SelfieCapture";
import { PosterEditor } from "@/components/games/PosterEditor";
import { POSTER_TEMPLATES } from "@/lib/game-data/posters";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, Stagger } from "@/components/ui/Animated";
import { cn } from "@/lib/utils";
import { gameActionButtonClass } from "@/components/ui/GameActionBar";

export default function RetroPosterPage() {
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [selectedPoster, setSelectedPoster] = useState(POSTER_TEMPLATES[0]);

  const handleSave = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("posterId", selectedPoster.id);
    formData.append("image", blob, `${selectedPoster.id}-poster.png`);

    const res = await fetch("/api/games/retro-poster", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Save failed");
    }
  };

  if (!selfieUrl) {
    return (
      <GamePageLayout title="Retro Posters" subtitle="Step 1 — Take your selfie">
        <main className="mx-auto max-w-6xl flex-1 px-4 py-8 pb-12 md:py-12 md:pb-16">
          <SelfieCapture onCapture={setSelfieUrl} />
        </main>
      </GamePageLayout>
    );
  }

  return (
    <GamePageLayout title="Retro Posters" subtitle="Step 2 — Choose your poster">
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 pb-12 md:py-12 md:pb-16">
        <FadeIn className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-3 rounded-full border border-gold/25 bg-maroon-light/50 px-4 py-2 shadow-lg backdrop-blur-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selfieUrl}
              alt="Your selfie"
              className="h-11 w-11 rounded-full border-2 border-gold object-cover shadow-md"
            />
            <span className="text-sm text-cream/70">Selfie ready</span>
            <Badge variant="outline">Step 2</Badge>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className={gameActionButtonClass}
            onClick={() => setSelfieUrl(null)}
          >
            ← Retake Selfie
          </Button>
        </FadeIn>

        <FadeIn delay={100} className="mb-8 text-center">
          <p className="text-cream/55">
            Pick a classic Bollywood poster — your face replaces the hero!
          </p>
        </FadeIn>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {POSTER_TEMPLATES.map((poster, i) => (
            <Stagger key={poster.id} index={i}>
              <button
                onClick={() => setSelectedPoster(poster)}
                className={cn(
                  "group w-full cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300",
                  selectedPoster.id === poster.id
                    ? "border-gold shadow-xl shadow-gold/25 scale-[1.02]"
                    : "border-gold/15 opacity-75 hover:opacity-100 hover:border-gold/40 hover:scale-[1.02]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poster.imageUrl}
                  alt={poster.title}
                  className="aspect-[5/7] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <p className="bg-brand-header/90 py-2.5 text-center text-xs font-bold tracking-wider text-gold">
                  {poster.title}
                </p>
              </button>
            </Stagger>
          ))}
        </div>

        <PosterEditor poster={selectedPoster} selfieSrc={selfieUrl} onSave={handleSave} />
      </main>
    </GamePageLayout>
  );
}
