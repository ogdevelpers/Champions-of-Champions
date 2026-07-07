export const DEFAULT_LIVE_STREAM_URL =
  "https://webcastlive.co.in/cloud-player/player/player.php?event_id=3935";

export const LIVE_STREAM_ACTIONS = [
  "stream_mounted",
  "stream_unmounted",
  "iframe_loaded",
  "iframe_error",
  "visible_in_viewport",
  "hidden_from_viewport",
  "tab_visible",
  "tab_hidden",
  "wrapper_fullscreen_enter",
  "wrapper_fullscreen_exit",
  "wrapper_fullscreen_error",
  "player_message",
] as const;

export type LiveStreamAction = (typeof LIVE_STREAM_ACTIONS)[number];

export function getLiveStreamUrl(): string {
  return process.env.NEXT_PUBLIC_LIVE_STREAM_URL ?? DEFAULT_LIVE_STREAM_URL;
}

export function parseStreamEventId(streamUrl: string): string {
  try {
    const url = new URL(streamUrl);
    return url.searchParams.get("event_id") ?? "unknown";
  } catch {
    return "unknown";
  }
}

export async function logLiveStreamEvent(
  action: LiveStreamAction | string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await fetch("/api/live-stream/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        metadata,
        streamUrl: getLiveStreamUrl(),
      }),
      keepalive: true,
    });
  } catch {
    // Non-blocking analytics
  }
}
