"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/ui/Animated";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { GameActionBar, gameActionButtonClass } from "@/components/ui/GameActionBar";

interface SelfieCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

export function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission or upload a photo.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const takeSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight) || 480;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    setPreview(canvas.toDataURL("image/jpeg", 0.92));
    stopCamera();
  };

  const retake = async () => {
    setPreview(null);
    await startCamera();
  };

  const handleFileUpload = (file: File) => {
    stopCamera();
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    if (!preview) return;
    onCapture(preview);
  };

  return (
    <FadeIn className="mx-auto max-w-md space-y-5">
      <Card glow className="text-center">
        <Badge className="mb-3">Step 1 of 2</Badge>
        <h2 className="font-display text-2xl font-bold gold-gradient-text">Take Your Selfie</h2>
        <p className="mt-3 text-sm leading-relaxed text-cream/65">
          Center your face in the frame with good lighting. We&apos;ll swap it onto your Bollywood poster.
        </p>
      </Card>

      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <div className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-gold/40 via-gold/10 to-gold/30 opacity-80 blur-sm" />
        <div className="relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-black shadow-2xl shadow-black/50">
          {!preview && !ready && !cameraError && (
            <div className="flex h-full min-h-[280px] items-center justify-center shimmer-bg">
              <LoadingSpinner label="Starting camera..." />
            </div>
          )}

          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Your selfie"
              className="aspect-square h-full w-full animate-scale-in object-cover"
            />
          ) : (
            !cameraError && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => setReady(true)}
                className={`aspect-square h-full w-full scale-x-[-1] object-cover ${ready ? "opacity-100" : "opacity-0"}`}
              />
            )
          )}

          {!preview && ready && (
            <>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                <div className="h-[72%] w-[72%] rounded-[50%] border-2 border-dashed border-gold/50 shadow-[inset_0_0_30px_rgba(212,175,55,0.08)]" />
              </div>
              <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-gold/70" />
              <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-gold/70" />
              <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gold/70" />
              <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gold/70" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-black/55 px-3 py-1 text-xs font-medium tracking-wide text-cream/80 backdrop-blur-sm">
                Align your face here
              </div>
            </>
          )}

          {preview && (
            <div className="absolute left-4 top-4 rounded-full border border-gold/30 bg-black/55 px-3 py-1 text-xs font-semibold text-gold backdrop-blur-sm">
              Preview ready
            </div>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="animate-fade-in rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {cameraError}
        </div>
      )}

      {!preview && ready && (
        <p className="text-center text-xs text-cream/45">
          Tip: Face the camera directly and keep your shoulders visible.
        </p>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = "";
        }}
      />

      <GameActionBar>
        {!preview ? (
          <>
            <Button
              onClick={takeSelfie}
              size="lg"
              disabled={!ready && !cameraError}
              className={gameActionButtonClass}
            >
              📷 Take Selfie
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              className={gameActionButtonClass}
            >
              Upload Photo
            </Button>
          </>
        ) : (
          <>
            <Button onClick={retake} variant="secondary" className={gameActionButtonClass}>
              Retake
            </Button>
            <Button onClick={handleContinue} size="lg" className={gameActionButtonClass}>
              Continue →
            </Button>
          </>
        )}
      </GameActionBar>
    </FadeIn>
  );
}
