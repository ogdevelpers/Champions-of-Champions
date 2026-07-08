"use client";

import { RefObject, useCallback, useEffect, useRef } from "react";
import { logLiveStreamEvent } from "@/lib/live-stream";

const HEARTBEAT_INTERVAL_MS = 30_000;
const TICK_INTERVAL_MS = 1_000;

interface UseLiveStreamTrackingOptions {
  playerRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  useNativeVideo: boolean;
  employeeId: string;
}

interface WatchTrackerState {
  watchDurationSeconds: number;
  lastTickAt: number | null;
  isPlaying: boolean;
  isInViewport: boolean;
  isTabVisible: boolean;
}

function getVideoMetadata(video: HTMLVideoElement) {
  return {
    currentTimeSeconds: Number(video.currentTime.toFixed(2)),
    durationSeconds: Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : null,
    muted: video.muted,
    volume: Number(video.volume.toFixed(2)),
    playbackRate: video.playbackRate,
  };
}

function isActivelyWatching(state: WatchTrackerState, useNativeVideo: boolean) {
  if (!state.isInViewport || !state.isTabVisible) return false;
  if (useNativeVideo) return state.isPlaying;
  return true;
}

export function useLiveStreamTracking({
  playerRef,
  videoRef,
  useNativeVideo,
  employeeId,
}: UseLiveStreamTrackingOptions) {
  const watchStateRef = useRef<WatchTrackerState>({
    watchDurationSeconds: 0,
    lastTickAt: null,
    isPlaying: false,
    isInViewport: true,
    isTabVisible: true,
  });

  const track = useCallback((action: string, metadata: Record<string, unknown> = {}) => {
    void logLiveStreamEvent(action, metadata, employeeId);
  }, [employeeId]);

  const tickWatchDuration = useCallback(() => {
    const state = watchStateRef.current;
    const now = Date.now();

    if (state.lastTickAt !== null && isActivelyWatching(state, useNativeVideo)) {
      state.watchDurationSeconds += (now - state.lastTickAt) / 1000;
    }

    state.lastTickAt = now;
  }, [useNativeVideo]);

  const getWatchMetadata = useCallback(
    (extra: Record<string, unknown> = {}) => ({
      watch_duration_seconds: Number(watchStateRef.current.watchDurationSeconds.toFixed(2)),
      tracking_mode: useNativeVideo ? "playback" : "viewport",
      ...extra,
    }),
    [useNativeVideo]
  );

  const flushWatchSession = useCallback(
    (reason: string) => {
      tickWatchDuration();
      track("watch_session_end", getWatchMetadata({ reason }));
    },
    [getWatchMetadata, tickWatchDuration, track]
  );

  useEffect(() => {
    track("stream_mounted", { layout: "section", tracking_mode: useNativeVideo ? "playback" : "viewport" });

    watchStateRef.current.isTabVisible = !document.hidden;

    const player = playerRef.current;
    if (!player) return;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        tickWatchDuration();
        watchStateRef.current.isInViewport = entry.isIntersecting;
        track(entry.isIntersecting ? "visible_in_viewport" : "hidden_from_viewport", {
          intersectionRatio: entry.intersectionRatio,
          ...getWatchMetadata(),
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    visibilityObserver.observe(player);

    const handleVisibilityChange = () => {
      tickWatchDuration();
      watchStateRef.current.isTabVisible = !document.hidden;
      track(document.hidden ? "tab_hidden" : "tab_visible", getWatchMetadata());
    };

    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === player;
      track(active ? "wrapper_fullscreen_enter" : "wrapper_fullscreen_exit", getWatchMetadata());
    };

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.origin !== "string") return;
      if (!event.origin.includes("webcastlive.co.in")) return;

      const payload = event.data;
      track("player_message", {
        origin: event.origin,
        data: payload,
        ...getWatchMetadata(),
      });

      if (payload && typeof payload === "object") {
        const message = payload as Record<string, unknown>;
        const eventName = message.event ?? message.type ?? message.action;
        if (typeof eventName === "string") {
          const normalized = eventName.toLowerCase();
          if (normalized.includes("play")) {
            watchStateRef.current.isPlaying = true;
            track("stream_play", getWatchMetadata({ source: "iframe_message", event: eventName }));
          } else if (normalized.includes("pause")) {
            tickWatchDuration();
            watchStateRef.current.isPlaying = false;
            track("stream_pause", getWatchMetadata({ source: "iframe_message", event: eventName }));
          }
        }
      }
    };

    const tickTimer = window.setInterval(tickWatchDuration, TICK_INTERVAL_MS);
    const heartbeatTimer = window.setInterval(() => {
      tickWatchDuration();
      track("watch_heartbeat", getWatchMetadata());
    }, HEARTBEAT_INTERVAL_MS);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("message", handleMessage);

    return () => {
      window.clearInterval(tickTimer);
      window.clearInterval(heartbeatTimer);
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("message", handleMessage);
      flushWatchSession("unmount");
      track("stream_unmounted", getWatchMetadata());
    };
  }, [
    flushWatchSession,
    getWatchMetadata,
    playerRef,
    tickWatchDuration,
    track,
    useNativeVideo,
  ]);

  useEffect(() => {
    if (!useNativeVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      watchStateRef.current.isPlaying = true;
      track("stream_play", getWatchMetadata(getVideoMetadata(video)));
    };

    const handlePlaying = () => {
      watchStateRef.current.isPlaying = true;
      track("stream_playing", getWatchMetadata(getVideoMetadata(video)));
    };

    const handlePause = () => {
      tickWatchDuration();
      watchStateRef.current.isPlaying = false;
      track("stream_pause", getWatchMetadata(getVideoMetadata(video)));
    };

    const handleSeeked = () => {
      track("stream_seeked", getWatchMetadata(getVideoMetadata(video)));
    };

    const handleEnded = () => {
      tickWatchDuration();
      watchStateRef.current.isPlaying = false;
      track("stream_ended", getWatchMetadata(getVideoMetadata(video)));
    };

    const handleWaiting = () => {
      tickWatchDuration();
      watchStateRef.current.isPlaying = false;
      track("stream_buffering", getWatchMetadata(getVideoMetadata(video)));
    };

    const handleVolumeChange = () => {
      track("stream_volume_change", getWatchMetadata(getVideoMetadata(video)));
    };

    const handleLoadedData = () => {
      track("video_loaded", getWatchMetadata(getVideoMetadata(video)));
    };

    const handleError = () => {
      tickWatchDuration();
      watchStateRef.current.isPlaying = false;
      track("video_error", getWatchMetadata(getVideoMetadata(video)));
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };
  }, [getWatchMetadata, tickWatchDuration, track, useNativeVideo, videoRef]);

  return { track, getWatchMetadata, flushWatchSession };
}
