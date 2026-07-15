export const CLOUD_PLAYER_URL =
  "https://webcastlive.co.in/cloud-player/player/player.php?event_id=3935";

export interface LiveStreamParticipant {
  employeeId: string;
  participantId: string;
  name: string;
  email: string;
}

/** Visible iframe — cloud player (no viewer identity in this URL). */
export function getLiveStreamPlayerUrl(): string {
  return process.env.NEXT_PUBLIC_LIVE_STREAM_URL ?? CLOUD_PLAYER_URL;
}

/**
 * Webcast SSO URL — this is what captures viewer data at their end.
 * Format: api_login.php?data=employee_id=…&participant_id=…&name=…&email=…
 * Must be loaded in the user's browser (not via server fetch).
 */
export function getLiveStreamAuthUrl(participant: LiveStreamParticipant): string {
  const data = [
    `employee_id=${encodeURIComponent(participant.employeeId.trim())}`,
    `participant_id=${encodeURIComponent(participant.participantId)}`,
    `name=${encodeURIComponent(participant.name.trim())}`,
    `email=${encodeURIComponent(participant.email.trim())}`,
  ].join("&");

  return `https://webcastlive.co.in/tataaigcoc/api_login.php?data=${data}`;
}

export function isDirectVideoStream(streamUrl: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(streamUrl);
}
