export const INSTAGRAM_HANDLE = "@tataaigofficial";

/** Screenshot upload unlocks on this date/time (IST), not after a relative wait. */
export const SCREENSHOT_UNLOCK_AT = new Date("2026-07-14T11:00:00+05:30");

/** Screenshot upload closes sharply at this time (IST). */
export const SCREENSHOT_DEADLINE_AT = new Date("2026-07-14T17:00:00+05:30");

export function getScreenshotUnlockLabel(): string {
  return "14 July 2026 at 11:00 AM";
}

export function getScreenshotDeadlineLabel(): string {
  return "5:00 PM IST";
}

export function isScreenshotSubmissionClosed(): boolean {
  return Date.now() >= SCREENSHOT_DEADLINE_AT.getTime();
}

export function canUploadScreenshot(_photoCapturedAt?: string): boolean {
  return Date.now() >= SCREENSHOT_UNLOCK_AT.getTime() && !isScreenshotSubmissionClosed();
}

export function getScreenshotUnlockAt(_photoCapturedAt?: string): Date {
  return SCREENSHOT_UNLOCK_AT;
}

export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "Ready now";
  if (msRemaining < 60 * 1000) {
    const seconds = Math.ceil(msRemaining / 1000);
    return `${seconds}s`;
  }
  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}
