"use client";

import { useState, useCallback, useEffect } from "react";
import { PosterTemplate } from "@/lib/game-data/posters";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FadeIn } from "@/components/ui/Animated";
import { downloadBlob } from "@/lib/utils";
import { detectFaceLandmarks } from "@/lib/face-replacement/detector";
import { compositeFaceOnPoster, compositeFaceOnPosterFallback, loadImage } from "@/lib/face-replacement/composite";

interface PosterEditorProps {
  poster: PosterTemplate;
  selfieSrc: string;
  onSave: (blob: Blob) => Promise<void>;
}

export function PosterEditor({ poster, selfieSrc, onSave }: PosterEditorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePoster = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const [posterImg, selfieImg] = await Promise.all([
        loadImage(poster.imageUrl),
        loadImage(selfieSrc),
      ]);

      const selfieLandmarks = await detectFaceLandmarks(selfieImg);

      const result = selfieLandmarks
        ? await compositeFaceOnPoster(posterImg, selfieImg, poster.targetFace, selfieLandmarks)
        : await compositeFaceOnPosterFallback(posterImg, selfieImg, poster.targetFace);

      setPreviewUrl(result);
      setSaved(false);
    } catch {
      setError("Could not generate poster. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [poster, selfieSrc]);

  useEffect(() => {
    generatePoster();
  }, [generatePoster]);

  const handleSave = async () => {
    if (!previewUrl) return;
    setSaving(true);
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      await onSave(blob);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    downloadBlob(blob, `${poster.id}-retro-poster.png`);
  };

  return (
    <FadeIn className="flex flex-col items-center gap-6">
      <div className="relative aspect-[5/7] w-full max-w-xs overflow-hidden rounded-2xl border-2 border-gold/35 bg-maroon-dark shadow-2xl shadow-black/40">
        {generating && !previewUrl ? (
          <div className="flex h-full items-center justify-center shimmer-bg">
            <LoadingSpinner label="Aligning your face..." />
          </div>
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={poster.title} className="h-full w-full animate-scale-in object-cover" />
        ) : null}
      </div>

      {error && (
        <p className="max-w-sm animate-fade-in rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-cream/55">
        Your face is mapped onto the hero in{" "}
        <span className="font-semibold text-gold">{poster.title}</span>
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={generatePoster} variant="ghost" disabled={generating}>
          {generating ? "Aligning..." : "↻ Refresh"}
        </Button>
        {previewUrl && (
          <>
            <Button onClick={handleDownload} variant="secondary">
              Download Poster
            </Button>
            <Button onClick={handleSave} disabled={saving || saved}>
              {saved ? "Saved ✓" : saving ? "Saving..." : "Save to Gallery"}
            </Button>
          </>
        )}
      </div>
    </FadeIn>
  );
}
