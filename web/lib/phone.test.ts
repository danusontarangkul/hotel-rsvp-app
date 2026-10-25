import { formatPhone, isValidPhone, toPhoneDigits } from './phone';

describe('toPhoneDigits', () => {
  it('keeps only the digits of a formatted number', () => {
    expect(toPhoneDigits('(123) 456-7890')).toBe('1234567890');
  });

  it('drops a leading US country code', () => {
    expect(toPhoneDigits('+1 123 456 7890')).toBe('1234567890');
  });

  it('stops at 10 digits', () => {
    expect(toPhoneDigits('12345678901234')).toBe('2345678901');
  });

  it('returns nothing for text with no digits', () => {
    expect(toPhoneDigits('abc')).toBe('');
  });
});

describe('formatPhone', () => {
  it('formats a full number', () => {
    expect(formatPhone('1234567890')).toBe('(123) 456-7890');
  });

  it('formats the area code while typing', () => {
    expect(formatPhone('12')).toBe('(12');
  });

  it('formats the area code and prefix while typing', () => {
    expect(formatPhone('12345')).toBe('(123) 45');
  });

  it('adds the dash once the line number starts', () => {
    expect(formatPhone('1234567')).toBe('(123) 456-7');
  });

  it('formats an empty number as empty', () => {
    expect(formatPhone('')).toBe('');
  });
});

describe('isValidPhone', () => {
  it('accepts 10 digits', () => {
    expect(isValidPhone('1234567890')).toBe(true);
  });

  it('rejects fewer than 10 digits', () => {
    expect(isValidPhone('123456789')).toBe(false);
  });

  it('rejects a formatted number', () => {
    expect(isValidPhone('(123) 456-7890')).toBe(false);
  });
});
