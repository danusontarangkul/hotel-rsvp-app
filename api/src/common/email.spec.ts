import { normalizeEmail } from './email';

describe('normalizeEmail', () => {
  it('lowercases the email', () => {
    expect(normalizeEmail('Sam@Hotel.COM')).toBe('sam@hotel.com');
  });

  it('trims spaces around the email', () => {
    expect(normalizeEmail('  sam@hotel.com ')).toBe('sam@hotel.com');
  });

  it('leaves a normalized email as it is', () => {
    expect(normalizeEmail('sam@hotel.com')).toBe('sam@hotel.com');
  });
});
