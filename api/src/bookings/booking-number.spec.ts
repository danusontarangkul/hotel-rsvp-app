import { generateBookingNumber } from './booking-number';
import {
  BOOKING_NUMBER_ALPHABET,
  BOOKING_NUMBER_LENGTH,
} from './bookings.constants';

describe('generateBookingNumber', () => {
  it('has the booking number length', () => {
    expect(generateBookingNumber()).toHaveLength(BOOKING_NUMBER_LENGTH);
  });

  it('only uses characters that are easy to read aloud', () => {
    for (let i = 0; i < 200; i += 1) {
      for (const character of generateBookingNumber()) {
        expect(BOOKING_NUMBER_ALPHABET).toContain(character);
      }
    }
  });

  it('never uses characters that look alike', () => {
    expect(BOOKING_NUMBER_ALPHABET).not.toMatch(/[01ILO]/);
  });

  it('gives different numbers on different calls', () => {
    const numbers = new Set(
      Array.from({ length: 50 }, () => generateBookingNumber()),
    );

    expect(numbers.size).toBeGreaterThan(45);
  });
});
