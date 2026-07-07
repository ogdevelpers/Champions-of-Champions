"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/ui/Animated";

interface SelfieCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

export function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission to take your selfie.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
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

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const retake = async () => {
    setPreview(null);
    await startCamera();
  };

  const handleContinue = () => {
    if (!preview) return;
    onCapture(preview);
  };

  return (
    <FadeIn className="mx-auto max-w-lg">
      <Card glow>
        <div className="text-center">
          <Badge className="mb-4">Step 1 of 2</Badge>
          <div className="animate-float mb-3 text-5xl">📸</div>
          <h2 className="font-display text-2xl font-bold gold-gradient-text">Take Your Selfie</h2>
          <p className="mt-2 text-sm text-cream/55">
            Face the camera directly — we&apos;ll map your face onto the poster star.
          </p>
        </div>

        {cameraError && (
          <div className="mt-5 animate-fade-in rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {cameraError}
            <div className="mt-3">
              <label className="cursor-pointer font-medium text-gold underline-offset-2 hover:underline">
                Or upload a photo instead
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          </div>
        )}

        <div className="relative mx-auto mt-6 aspect-square max-w-sm overflow-hidden rounded-2xl border-2 border-gold/35 bg-black shadow-2xl shadow-black/40">
          {!preview && ready && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-[70%] w-[70%] rounded-full border-2 border-dashed border-gold/40 animate-pulse" />
            </div>
          )}
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Your selfie" className="h-full w-full animate-scale-in object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => setReady(true)}
              className="h-full w-full scale-x-[-1] object-cover"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!preview ? (
            <Button onClick={takeSelfie} size="lg" disabled={!ready && !cameraError}>
              📷 Take Selfie
            </Button>
          ) : (
            <>
              <Button onClick={retake} variant="secondary">
                Retake
              </Button>
              <Button onClick={handleContinue} size="lg">
                Continue →
              </Button>
            </>
          )}
        </div>
      </Card>
    </FadeIn>
  );
}
