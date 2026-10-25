export const PHONE_DIGITS = 10;

export function toPhoneDigits(input: string): string {
  const digits = input.replace(/\D/g, '');
  const withoutCountryCode =
    digits.length > PHONE_DIGITS && digits.startsWith('1')
      ? digits.slice(1)
      : digits;
  return withoutCountryCode.slice(0, PHONE_DIGITS);
}

export function formatPhone(digits: string): string {
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);
  if (digits.length === 0) {
    return '';
  }
  if (digits.length <= 3) {
    return `(${area}`;
  }
  if (digits.length <= 6) {
    return `(${area}) ${prefix}`;
  }
  return `(${area}) ${prefix}-${line}`;
}

export function isValidPhone(digits: string): boolean {
  return /^\d+$/.test(digits) && digits.length === PHONE_DIGITS;
}
