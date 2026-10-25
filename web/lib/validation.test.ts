import { isFilled, isValidEmail, isValidPassword } from './validation';

describe('isFilled', () => {
  it('accepts text', () => {
    expect(isFilled('Sam')).toBe(true);
  });

  it('rejects an empty value', () => {
    expect(isFilled('')).toBe(false);
  });

  it('rejects a value of only spaces', () => {
    expect(isFilled('   ')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts a normal email', () => {
    expect(isValidEmail('sam@hotel.com')).toBe(true);
  });

  it('ignores spaces around the email', () => {
    expect(isValidEmail('  sam@hotel.com ')).toBe(true);
  });

  it('rejects an email without an @', () => {
    expect(isValidEmail('sam.hotel.com')).toBe(false);
  });

  it('rejects an email without a domain ending', () => {
    expect(isValidEmail('sam@hotel')).toBe(false);
  });

  it('rejects an email with a space inside', () => {
    expect(isValidEmail('sam lee@hotel.com')).toBe(false);
  });

  it('rejects an empty email', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts a password of exactly 8 characters', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });

  it('rejects a password of 7 characters', () => {
    expect(isValidPassword('1234567')).toBe(false);
  });
});
