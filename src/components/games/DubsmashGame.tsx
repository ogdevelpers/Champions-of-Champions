"use client";

import { useState, useRef, useEffect } from "react";
import { DUBSMASH_CLIPS, DubsmashClip } from "@/lib/game-data/dubsmash-clips";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stagger } from "@/components/ui/Animated";
import { downloadBlob } from "@/lib/utils";
import { GameActionBar, gameActionButtonClass } from "@/components/ui/GameActionBar";

export function DubsmashGame() {
  const [selectedClip, setSelectedClip] = useState<DubsmashClip | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedUrlRef = useRef<string | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const revokeRecordedUrl = () => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      revokeRecordedUrl();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (recordedUrl) {
      video.srcObject = null;
      video.src = recordedUrl;
      video.muted = false;
      video.load();
      void video.play().catch(() => {
        // Autoplay may be blocked; controls remain available for manual playback.
      });
      return;
    }

    video.src = "";
    video.muted = true;
    if (streamRef.current) {
      video.srcObject = streamRef.current;
      void video.play().catch(() => {});
    }
  }, [recordedUrl]);

  const stopRecording = () => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.requestData();
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.src = "";
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        void videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera and microphone permissions.");
    }
  };

  const selectClip = async (clip: DubsmashClip) => {
    setSelectedClip(clip);
    revokeRecordedUrl();
    setRecordedBlob(null);
    setRecordedUrl(null);
    setSaved(false);
    await startCamera();
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setCameraError("Video recording is not supported in this browser.");
      return;
    }

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size === 0) {
        setCameraError("Recording failed. Please try again.");
        startCamera();
        return;
      }

      revokeRecordedUrl();
      const url = URL.createObjectURL(blob);
      recordedUrlRef.current = url;
      setRecordedBlob(blob);
      setRecordedUrl(url);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    setCountdown(3);
    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(null);
        setRecording(true);
        recorder.start(250);

        autoStopTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, (selectedClip?.duration || 8) * 1000);
      }
    }, 1000);
  };

  const handleUploadAndDownload = async () => {
    if (!recordedBlob || !selectedClip) return;
    setSaving(true);
    try {
      downloadBlob(recordedBlob, `dubsmash-${selectedClip.id}.webm`);

      const formData = new FormData();
      formData.append("clipId", selectedClip.id);
      formData.append("video", recordedBlob, "dubsmash.webm");

      const res = await fetch("/api/games/dubsmash", { method: "POST", body: formData });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    revokeRecordedUrl();
    setRecordedBlob(null);
    setRecordedUrl(null);
    setSaved(false);
    setCameraError(null);
    startCamera();
  };

  if (!selectedClip) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {DUBSMASH_CLIPS.map((clip, i) => (
          <Stagger key={clip.id} index={i}>
            <Card
              glow
              interactive
              className="cursor-pointer"
              onClick={() => selectClip(clip)}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-2xl transition-transform duration-300 group-hover:scale-110">
                  🎤
                </div>
                <div>
                  <Badge variant="muted">{clip.movie}</Badge>
                  <h3 className="mt-1 font-display text-lg font-bold text-cream">{clip.title}</h3>
                  <p className="mt-2 text-sm italic leading-relaxed text-cream/55">
                    &ldquo;{clip.dialogue}&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-gold/50">{clip.duration}s clip</p>
                </div>
              </div>
            </Card>
          </Stagger>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4 animate-fade-in-up">
      <Card glow>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <Badge variant="muted">{selectedClip.movie}</Badge>
            <h3 className="mt-1 font-display text-xl font-bold gold-gradient-text">
              {selectedClip.title}
            </h3>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSelectedClip(null)}>
            ← Change
          </Button>
        </div>
        <p className="rounded-xl border border-gold/15 bg-maroon/40 p-5 text-center text-lg italic leading-relaxed text-cream/80">
          &ldquo;{selectedClip.dialogue}&rdquo;
        </p>
      </Card>

      {cameraError && (
        <div className="animate-fade-in rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {cameraError}
        </div>
      )}

      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border-2 border-gold/30 bg-black shadow-2xl shadow-black/50">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls={!!recordedUrl}
          muted={!recordedUrl}
          className={`h-full w-full object-cover ${recordedUrl ? "" : "scale-x-[-1]"}`}
        />

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <span
              key={countdown}
              className="animate-pop-in font-display text-9xl font-bold gold-gradient-text"
            >
              {countdown}
            </span>
          </div>
        )}

        {recording && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 shadow-lg backdrop-blur-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
            <span className="text-sm font-semibold tracking-wider text-white">REC</span>
          </div>
        )}
      </div>

      <GameActionBar className="max-w-lg mx-auto">
        {!recordedUrl && !recording && countdown === null && (
          <Button
            onClick={startRecording}
            size="lg"
            disabled={!!cameraError}
            className={`${gameActionButtonClass} animate-pulse-gold`}
          >
            🎬 Start Recording
          </Button>
        )}
        {recording && (
          <Button
            onClick={stopRecording}
            variant="danger"
            size="lg"
            className={gameActionButtonClass}
          >
            ⏹ Stop Recording
          </Button>
        )}
        {recordedUrl && (
          <>
            <Button
              onClick={handleUploadAndDownload}
              variant="primary"
              disabled={saving || saved}
              className={gameActionButtonClass}
            >
              {saved ? "Uploaded ✓" : saving ? "Uploading..." : "Upload & Download Video"}
            </Button>
            <Button
              variant="secondary"
              className={gameActionButtonClass}
              onClick={handleRetake}
            >
              Retake
            </Button>
          </>
        )}
      </GameActionBar>
    </div>
  );
}
