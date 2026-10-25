export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_TOO_SHORT_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isFilled(value: string): boolean {
  return value.trim() !== '';
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}
