import { toBookingNumber } from './booking-number';

describe('toBookingNumber', () => {
  it('uppercases the booking number', () => {
    expect(toBookingNumber('k7q2mx')).toBe('K7Q2MX');
  });

  it('removes spaces anywhere in it', () => {
    expect(toBookingNumber(' K7Q 2MX ')).toBe('K7Q2MX');
  });

  it('returns an empty string for only spaces', () => {
    expect(toBookingNumber('   ')).toBe('');
  });
});
