const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TATA_AIG_EMAIL_PATTERN = /^[^\s@]+@tataaig\.com$/i;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isTataAigEmail(email: string): boolean {
  return TATA_AIG_EMAIL_PATTERN.test(email.trim());
}
