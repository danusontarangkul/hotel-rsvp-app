import { toPhoneDigits } from './phone';

describe('toPhoneDigits', () => {
  it('keeps only the digits', () => {
    expect(toPhoneDigits('(555) 010-0123')).toBe('5550100123');
  });

  it('drops a leading US country code', () => {
    expect(toPhoneDigits('+1 555 010 0123')).toBe('5550100123');
  });

  it('leaves a number that is already digits alone', () => {
    expect(toPhoneDigits('5550100123')).toBe('5550100123');
  });

  it('keeps every digit of a number that is too long', () => {
    expect(toPhoneDigits('55501001234')).toBe('55501001234');
  });

  it('returns an empty string when there are no digits', () => {
    expect(toPhoneDigits('call me')).toBe('');
  });
});
