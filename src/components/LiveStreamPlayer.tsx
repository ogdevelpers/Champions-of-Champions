"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getLiveStreamAuthUrl,
  getLiveStreamPlayerUrl,
  isDirectVideoStream,
  type LiveStreamParticipant,
} from "@/lib/live-stream";
import { cn } from "@/lib/utils";

interface LiveStreamPlayerProps {
  participant: LiveStreamParticipant;
  className?: string;
}

export function LiveStreamPlayer({ participant, className }: LiveStreamPlayerProps) {
  const streamUrl = getLiveStreamPlayerUrl();
  const authUrl = getLiveStreamAuthUrl(participant);
  const useNativeVideo = isDirectVideoStream(streamUrl);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  // Register viewer with webcast (same URL as "Open Full Webcast") in the browser.
  // Cloud player iframe alone does not send employee/participant data.
  useEffect(() => {
    void fetch(authUrl, { mode: "no-cors", credentials: "omit", redirect: "follow" });
  }, [authUrl]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === player);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!useNativeVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        await video.play();
        setPlaybackBlocked(false);
      } catch {
        setPlaybackBlocked(true);
      }
    };

    void tryPlay();
  }, [streamUrl, useNativeVideo]);

  const startPlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setPlaybackBlocked(false);
    } catch {
      // Autoplay blocked — user can retry via the button
    }
  };

  const toggleFullscreen = async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen();
      } else {
        await player.requestFullscreen();
      }
    } catch {
      // Fullscreen may be blocked by browser policy
    }
  };

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <div className="mb-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-100 sm:justify-start">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          Broadcasting Live
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={toggleFullscreen}
            className="w-full shrink-0 text-xs sm:w-auto"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full shrink-0 text-xs sm:w-auto"
            onClick={() => window.open(authUrl, "_blank", "noopener,noreferrer")}
          >
            Open Full Webcast
          </Button>
        </div>
      </div>

      <div
        ref={playerRef}
        className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-gold/30 bg-black shadow-2xl shadow-black/60"
      >
        {useNativeVideo ? (
          <>
            <video
              ref={videoRef}
              src={streamUrl}
              className="absolute inset-0 h-full w-full border-0 object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
            />
            {playbackBlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
                <Button type="button" size="sm" onClick={startPlayback}>
                  Tap to Play Stream
                </Button>
              </div>
            )}
          </>
        ) : (
          <iframe
            src={streamUrl}
            title="Champions of Champions live stream"
            className="absolute inset-0 h-full w-full overflow-hidden border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>

      {/* Attendance is registered via fetch above — no second iframe (that page can show "event not started") */}
    </div>
  );
}
