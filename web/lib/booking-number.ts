export function toBookingNumber(text: string): string {
  return text.replace(/\s/g, '').toUpperCase();
}
