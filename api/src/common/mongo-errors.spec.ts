import { isDuplicateKeyError } from './mongo-errors';

describe('isDuplicateKeyError', () => {
  it('is true for a MongoDB duplicate key error', () => {
    expect(isDuplicateKeyError({ code: 11000 })).toBe(true);
  });

  it('is false for another MongoDB error', () => {
    expect(isDuplicateKeyError({ code: 121 })).toBe(false);
  });

  it('is false for a plain error', () => {
    expect(isDuplicateKeyError(new Error('boom'))).toBe(false);
  });

  it('is false for a value that is not an object', () => {
    expect(isDuplicateKeyError('11000')).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
  });
});
