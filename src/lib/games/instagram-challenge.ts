export const INSTAGRAM_HANDLE = "@tataaigofficial";
export const INSTAGRAM_CHALLENGE_EMPLOYEE_PREFIX = "CMPRQ";
export const SCREENSHOT_UNLOCK_SECONDS = 24 * 60 * 60;
export const SCREENSHOT_UNLOCK_MS = SCREENSHOT_UNLOCK_SECONDS * 1000;

export function canPlayInstagramChallenge(employeeId: string): boolean {
  return employeeId.trim().toUpperCase().startsWith(INSTAGRAM_CHALLENGE_EMPLOYEE_PREFIX);
}

export function canPlayDubsmash(employeeId: string): boolean {
  return !canPlayInstagramChallenge(employeeId);
}

export function getScreenshotUnlockLabel(): string {
  if (SCREENSHOT_UNLOCK_MS < 60 * 1000) {
    return `${SCREENSHOT_UNLOCK_SECONDS} seconds`;
  }
  const hours = Math.round(SCREENSHOT_UNLOCK_MS / (60 * 60 * 1000));
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

export function canUploadScreenshot(photoCapturedAt: string): boolean {
  const captured = new Date(photoCapturedAt).getTime();
  return Date.now() - captured >= SCREENSHOT_UNLOCK_MS;
}

export function getScreenshotUnlockAt(photoCapturedAt: string): Date {
  return new Date(new Date(photoCapturedAt).getTime() + SCREENSHOT_UNLOCK_MS);
}

export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "Ready now";
  if (msRemaining < 60 * 1000) {
    const seconds = Math.ceil(msRemaining / 1000);
    return `${seconds}s`;
  }
  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}
