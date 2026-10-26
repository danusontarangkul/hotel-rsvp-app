export const BCRYPT_COST = 10;
export const MIN_PASSWORD_LENGTH = 8;

export const TOKEN_COOKIE = 'token';
export const TOKEN_LIFETIME = '7d';
export const TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const NAME_REQUIRED = 'Name is required.';
export const EMAIL_INVALID = 'Email must be a valid email address.';
export const PASSWORD_TOO_SHORT = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
export const EMAIL_TAKEN = 'Email is already registered.';
export const EMAIL_REQUIRED = 'Email is required.';
export const PASSWORD_REQUIRED = 'Password is required.';
export const WRONG_CREDENTIALS = 'Wrong email or password.';

export const TIMING_SAFE_PASSWORD_HASH =
  '$2b$10$AUcXXX5e.Wp0obO300emROVelyaNjJtL7fqCeIo/hI32GbSppfNF2';
