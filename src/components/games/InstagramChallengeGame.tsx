"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { GameActionBar, gameActionButtonClass } from "@/components/ui/GameActionBar";
import {
  composeBrandedPhoto,
  drawCameraPreview,
  FRAME_HEIGHT,
  FRAME_WIDTH,
  loadFrameOverlayImage,
} from "@/lib/photo-frame";
import { downloadBlob } from "@/lib/utils";
import {
  INSTAGRAM_HANDLE,
  canUploadScreenshot,
  formatCountdown,
  getScreenshotUnlockAt,
  getScreenshotUnlockLabel,
} from "@/lib/games/instagram-challenge";
import type { InstagramChallengeSubmission } from "@/lib/games/instagram-challenge-status";

const HOW_TO_PLAY = [
  "Click your photo using the event's digital frame.",
  "Download your branded picture.",
  `Post it on your Instagram and tag ${INSTAGRAM_HANDLE}.`,
  `After ${getScreenshotUnlockLabel()}, return to the portal and upload a screenshot of your Instagram post showing the number of likes.`,
  "The post with the highest likes wins an exciting hamper! 🏆",
];

interface InstagramChallengeGameProps {
  initialSubmission: InstagramChallengeSubmission | null;
}

export function InstagramChallengeGame({ initialSubmission }: InstagramChallengeGameProps) {
  const [submission, setSubmission] = useState(initialSubmission);
  const [brandedPreview, setBrandedPreview] = useState<string | null>(null);
  const [brandedBlob, setBrandedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [composing, setComposing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [likesCount, setLikesCount] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [countdownLabel, setCountdownLabel] = useState("");
  const [savedBrandedPreview, setSavedBrandedPreview] = useState<string | null>(null);
  const [frameOverlay, setFrameOverlay] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission or upload a photo.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadFrameOverlayImage()
      .then((overlay) => {
        if (active) setFrameOverlay(overlay);
      })
      .catch(() => {
        if (active) setError("Could not load the photo frame.");
      });
    return () => {
      active = false;
    };
  }, []);

  const showCamera = !submission && !brandedPreview;

  useEffect(() => {
    if (showCamera) {
      void startCamera();
    }
    return () => stopCamera();
  }, [showCamera, startCamera, stopCamera]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas || !frameOverlay || !ready || !showCamera || composing) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    const render = () => {
      if (video.readyState >= 2) {
        drawCameraPreview(ctx, video, frameOverlay, canvas.width, canvas.height);
      }
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [ready, showCamera, composing, frameOverlay]);

  useEffect(() => {
    if (!submission || submission.instagram_screenshot_url) return;

    const updateCountdown = () => {
      const unlockAt = getScreenshotUnlockAt(submission.photo_captured_at).getTime();
      setCountdownLabel(formatCountdown(unlockAt - Date.now()));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [submission]);

  const capturePhotoDataUrl = () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    const scale = Math.max(
      canvas.width / video.videoWidth,
      canvas.height / video.videoHeight
    );
    const sw = video.videoWidth * scale;
    const sh = video.videoHeight * scale;
    const sx = (canvas.width - sw) / 2;
    const sy = (canvas.height - sh) / 2;
    ctx.drawImage(video, sx, sy, sw, sh);
    ctx.restore();

    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const buildBrandedPreview = async (photoDataUrl: string) => {
    setComposing(true);
    setError(null);
    stopCamera();
    try {
      const blob = await composeBrandedPhoto(photoDataUrl);
      setBrandedBlob(blob);
      setBrandedPreview(URL.createObjectURL(blob));
    } catch {
      setError("Could not create your branded photo. Please try again.");
      await startCamera();
    } finally {
      setComposing(false);
    }
  };

  const takePhoto = () => {
    const photoDataUrl = capturePhotoDataUrl();
    if (!photoDataUrl) return;
    void buildBrandedPreview(photoDataUrl);
  };

  const handleFileUpload = (file: File) => {
    stopCamera();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) void buildBrandedPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const retake = async () => {
    if (brandedPreview) URL.revokeObjectURL(brandedPreview);
    setBrandedPreview(null);
    setBrandedBlob(null);
    setSavedBrandedPreview(null);
    setSubmission(null);
    setError(null);
    await startCamera();
  };

  const handleSaveAndDownload = async () => {
    if (!brandedBlob) return;
    setSaving(true);
    setError(null);
    try {
      downloadBlob(brandedBlob, "champions-branded-photo.jpg");

      const formData = new FormData();
      formData.append("image", brandedBlob, "champions-branded-photo.jpg");

      const res = await fetch("/api/games/instagram-challenge", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save your photo.");
        return;
      }

      setSavedBrandedPreview(brandedPreview);
      setSubmission({
        branded_image_url: data.brandedImageUrl,
        photo_captured_at: data.photoCapturedAt,
        instagram_screenshot_url: null,
        likes_count: null,
        screenshot_uploaded_at: null,
      });
      setBrandedPreview(null);
      setBrandedBlob(null);
    } finally {
      setSaving(false);
    }
  };

  const handleScreenshotSelect = (file: File) => {
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleScreenshotUpload = async () => {
    if (!screenshotFile || likesCount.trim() === "") return;
    setUploadingScreenshot(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("screenshot", screenshotFile);
      formData.append("likesCount", likesCount.trim());

      const res = await fetch("/api/games/instagram-challenge/screenshot", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload screenshot.");
        return;
      }

      setSubmission((prev) =>
        prev
          ? {
              ...prev,
              instagram_screenshot_url: data.screenshotUrl,
              likes_count: data.likesCount,
              screenshot_uploaded_at: data.screenshotUploadedAt,
            }
          : prev
      );
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setLikesCount("");
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleDownloadAgain = async () => {
    if (!submission) return;
    const res = await fetch(submission.branded_image_url);
    const blob = await res.blob();
    downloadBlob(blob, "champions-branded-photo.jpg");
  };

  const brandedPhotoSrc = savedBrandedPreview || submission?.branded_image_url;
  const canRetakeSaved = !!submission && !submission.instagram_screenshot_url;

  const screenshotUnlocked =
    submission && !submission.instagram_screenshot_url
      ? canUploadScreenshot(submission.photo_captured_at)
      : false;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <Card glow>
        <Badge className="mb-3">How to Play</Badge>
        <ol className="space-y-3 text-sm leading-relaxed text-cream/80">
          {HOW_TO_PLAY.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-light">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-center font-display text-lg font-bold text-gold-light">
          Ready? Champion Click and let the likes roll in! 📸✨
        </p>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {showCamera && (
        <>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden bg-white shadow-2xl">
            {(!ready || composing) && !cameraError && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/90">
                <LoadingSpinner
                  label={composing ? "Applying frame..." : "Starting camera..."}
                />
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => setReady(true)}
              className="hidden"
            />
            <canvas
              ref={previewCanvasRef}
              width={FRAME_WIDTH}
              height={FRAME_HEIGHT}
              className={`h-full w-full object-contain ${ready && !composing ? "" : "invisible"}`}
            />
          </div>
          <canvas ref={captureCanvasRef} className="hidden" />
          {cameraError && (
            <p className="text-center text-sm text-red-300">{cameraError}</p>
          )}
          <GameActionBar className="max-w-md mx-auto">
            <Button
              onClick={takePhoto}
              disabled={!ready || !!cameraError || composing}
              className={gameActionButtonClass}
            >
              📸 Capture Photo
            </Button>
            <Button
              variant="secondary"
              className={gameActionButtonClass}
              disabled={composing}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </GameActionBar>
        </>
      )}

      {!submission && brandedPreview && (
        <>
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandedPreview}
              alt="Branded preview"
              className="aspect-[3/4] w-full object-contain"
            />
          </div>
          <GameActionBar className="max-w-md mx-auto">
            <Button
              onClick={handleSaveAndDownload}
              disabled={!brandedBlob || saving}
              className={gameActionButtonClass}
            >
              {saving ? "Saving..." : "Download & Save"}
            </Button>
            <Button
              variant="secondary"
              onClick={retake}
              disabled={saving}
              className={gameActionButtonClass}
            >
              Retake
            </Button>
          </GameActionBar>
        </>
      )}

      {submission && (
        <Card glow className="space-y-5">
          <div className="text-center">
            <Badge variant="outline">Your Branded Photo</Badge>
            <h3 className="mt-2 font-display text-xl font-bold text-cream">Saved Successfully</h3>
          </div>
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandedPhotoSrc}
              alt="Your branded photo"
              className="aspect-[3/4] w-full object-contain"
              onError={(e) => {
                if (savedBrandedPreview && e.currentTarget.src !== savedBrandedPreview) {
                  e.currentTarget.src = savedBrandedPreview;
                }
              }}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleDownloadAgain}>
              Download Again
            </Button>
            {canRetakeSaved && (
              <Button variant="secondary" size="sm" onClick={retake}>
                Retake
              </Button>
            )}
          </div>
          <p className="text-center text-sm text-cream/75">
            Post this on Instagram and tag <strong className="text-gold-light">{INSTAGRAM_HANDLE}</strong>
          </p>
        </Card>
      )}

      {submission && !submission.instagram_screenshot_url && !screenshotUnlocked && (
        <Card glow className="text-center">
          <Badge variant="muted">Step 2 · After {getScreenshotUnlockLabel()}</Badge>
          <h3 className="mt-3 font-display text-xl font-bold text-cream">Screenshot Upload Locked</h3>
          <p className="text-body mt-3 text-sm leading-relaxed">
            Come back after {getScreenshotUnlockLabel()} to upload your Instagram post screenshot with likes.
          </p>
          <p className="mt-4 font-display text-2xl font-bold text-gold-light">{countdownLabel}</p>
        </Card>
      )}

      {submission && !submission.instagram_screenshot_url && screenshotUnlocked && (
        <Card glow className="space-y-5">
          <div className="text-center">
            <Badge>Step 2 · Upload Screenshot</Badge>
            <h3 className="mt-3 font-display text-xl font-bold text-cream">Share Your Instagram Proof</h3>
            <p className="text-body mt-2 text-sm">
              Upload a screenshot of your Instagram post showing the number of likes.
            </p>
          </div>
          {screenshotPreview && (
            <div className="mx-auto max-w-sm overflow-hidden rounded-2xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshotPreview} alt="Screenshot preview" className="w-full object-contain" />
            </div>
          )}
          <div className="mx-auto max-w-sm space-y-4">
            <Input
              type="number"
              min={0}
              placeholder="Number of likes on your post"
              value={likesCount}
              onChange={(e) => setLikesCount(e.target.value)}
            />
            <Button variant="secondary" className="w-full" onClick={() => screenshotInputRef.current?.click()}>
              {screenshotFile ? "Change Screenshot" : "Choose Screenshot"}
            </Button>
            <input
              ref={screenshotInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleScreenshotSelect(file);
              }}
            />
            <Button
              className="w-full"
              disabled={!screenshotFile || likesCount.trim() === "" || uploadingScreenshot}
              onClick={handleScreenshotUpload}
            >
              {uploadingScreenshot ? "Uploading..." : "Submit Screenshot"}
            </Button>
          </div>
        </Card>
      )}

      {submission?.instagram_screenshot_url && (
        <Card glow className="space-y-4 text-center">
          <Badge variant="gold">Submitted</Badge>
          <h3 className="font-display text-xl font-bold text-cream">Thank You for Participating!</h3>
          <p className="text-body text-sm">
            Your screenshot has been submitted with <strong className="text-gold-light">{submission.likes_count}</strong> likes recorded.
          </p>
          <p className="text-sm text-cream/70">The post with the highest likes wins an exciting hamper! 🏆</p>
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={submission.instagram_screenshot_url}
              alt="Instagram screenshot"
              className="w-full object-contain"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
