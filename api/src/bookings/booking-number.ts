import { randomInt } from 'node:crypto';
import {
  BOOKING_NUMBER_ALPHABET,
  BOOKING_NUMBER_LENGTH,
} from './bookings.constants';

export function generateBookingNumber(): string {
  return Array.from(
    { length: BOOKING_NUMBER_LENGTH },
    () => BOOKING_NUMBER_ALPHABET[randomInt(BOOKING_NUMBER_ALPHABET.length)],
  ).join('');
}
