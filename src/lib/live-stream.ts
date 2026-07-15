export const CLOUD_PLAYER_URL =
  "https://webcastlive.co.in/cloud-player/player/player.php?event_id=3935";

export interface LiveStreamParticipant {
  employeeId: string;
  participantId: string;
  name: string;
  email: string;
}

/** Iframe player URL — cloud player only (do not use api_login here). */
export function getLiveStreamPlayerUrl(): string {
  return process.env.NEXT_PUBLIC_LIVE_STREAM_URL ?? CLOUD_PLAYER_URL;
}

/**
 * Webcast SSO URL — registers the viewer with participant details.
 * Format: api_login.php?data=employee_id=…&participant_id=…&name=…&email=…
 * Open in a top-level window or call server-side; not for iframe embed.
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

/** Register participant with the webcast provider (server-side only). */
export async function registerLiveStreamAttendance(
  participant: LiveStreamParticipant
): Promise<void> {
  try {
    // Abort if provider is slow — do not block dashboard render for long
    await fetch(getLiveStreamAuthUrl(participant), {
      redirect: "follow",
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Non-blocking — stream still plays via cloud player
  }
}
