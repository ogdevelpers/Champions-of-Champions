"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getLiveStreamUrl, logLiveStreamEvent } from "@/lib/live-stream";
import { cn } from "@/lib/utils";

interface LiveStreamPlayerProps {
  className?: string;
}

export function LiveStreamPlayer({ className }: LiveStreamPlayerProps) {
  const streamUrl = getLiveStreamUrl();
  const playerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const track = useCallback((action: string, metadata: Record<string, unknown> = {}) => {
    void logLiveStreamEvent(action, metadata);
  }, []);

  useEffect(() => {
    track("stream_mounted", { layout: "section" });

    const player = playerRef.current;
    if (!player) return;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        track(entry.isIntersecting ? "visible_in_viewport" : "hidden_from_viewport", {
          intersectionRatio: entry.intersectionRatio,
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    visibilityObserver.observe(player);

    const handleVisibilityChange = () => {
      track(document.hidden ? "tab_hidden" : "tab_visible");
    };

    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === player;
      setIsFullscreen(active);
      track(active ? "wrapper_fullscreen_enter" : "wrapper_fullscreen_exit");
    };

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.origin !== "string") return;
      if (!event.origin.includes("webcastlive.co.in")) return;

      track("player_message", {
        origin: event.origin,
        data: event.data,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("message", handleMessage);

    return () => {
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("message", handleMessage);
      track("stream_unmounted");
    };
  }, [track]);

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
        <iframe
          src={streamUrl}
          title="Champions of Champions live stream"
          className="absolute inset-0 h-full w-full border-0"
          scrolling="no"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => track("iframe_loaded")}
          onError={() => track("iframe_error")}
        />
      </div>
    </div>
  );
}
