export const PHONE_DIGITS = 10;

export function toPhoneDigits(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.length > PHONE_DIGITS && digits.startsWith('1')
    ? digits.slice(1)
    : digits;
}
