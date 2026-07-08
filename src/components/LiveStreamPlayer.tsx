"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLiveStreamTracking } from "@/hooks/useLiveStreamTracking";
import { getLiveStreamUrl, isDirectVideoStream } from "@/lib/live-stream";
import { cn } from "@/lib/utils";

interface LiveStreamPlayerProps {
  employeeId: string;
  className?: string;
}

export function LiveStreamPlayer({ employeeId, className }: LiveStreamPlayerProps) {
  const streamUrl = getLiveStreamUrl(employeeId);
  const useNativeVideo = isDirectVideoStream(streamUrl);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  const { track } = useLiveStreamTracking({
    playerRef,
    videoRef,
    useNativeVideo,
    employeeId,
  });

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
      track("video_play_clicked", {
        currentTimeSeconds: Number(video.currentTime.toFixed(2)),
      });
    } catch {
      track("video_play_error");
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
      track("wrapper_fullscreen_error");
    }
  };

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <div className="mb-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-100 sm:justify-start">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          Broadcasting Live
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={toggleFullscreen}
          className="w-full shrink-0 text-xs sm:w-auto"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
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
            onLoad={() => track("iframe_loaded")}
            onError={() => track("iframe_error")}
          />
        )}
      </div>
    </div>
  );
}
