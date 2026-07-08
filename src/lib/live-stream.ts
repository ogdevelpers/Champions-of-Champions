export const DEFAULT_LIVE_STREAM_URL =
  "https://webcastlive.co.in/cloud-player/player/player.php?event_id=3935";

export const LIVE_STREAM_ACTIONS = [
  "stream_mounted",
  "stream_unmounted",
  "iframe_loaded",
  "iframe_error",
  "video_loaded",
  "video_error",
  "video_play_clicked",
  "video_play_error",
  "visible_in_viewport",
  "hidden_from_viewport",
  "tab_visible",
  "tab_hidden",
  "wrapper_fullscreen_enter",
  "wrapper_fullscreen_exit",
  "wrapper_fullscreen_error",
  "player_message",
  "stream_play",
  "stream_playing",
  "stream_pause",
  "stream_seeked",
  "stream_ended",
  "stream_buffering",
  "stream_volume_change",
  "watch_heartbeat",
  "watch_session_end",
] as const;

export type LiveStreamAction = (typeof LIVE_STREAM_ACTIONS)[number];

export const TEST_LIVE_STREAM_VIDEO_URL =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4";

export function getLiveStreamUrl(employeeId: string): string {
  const username = encodeURIComponent(employeeId.trim());
  return `https://webcastlive.co.in/tataaigcoc/api_login.php?data=username=${username}`;
}

export function isDirectVideoStream(streamUrl: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(streamUrl);
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
  metadata: Record<string, unknown> = {},
  employeeId?: string
): Promise<void> {
  try {
    await fetch("/api/live-stream/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        metadata,
        streamUrl: employeeId ? getLiveStreamUrl(employeeId) : undefined,
      }),
      keepalive: true,
    });
  } catch {
    // Non-blocking analytics
  }
}
