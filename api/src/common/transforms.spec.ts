import type { TransformFnParams } from 'class-transformer';
import { trimString } from './transforms';

function params(value: unknown): TransformFnParams {
  return { value } as TransformFnParams;
}

describe('trimString', () => {
  it('trims spaces around a string', () => {
    expect(trimString(params('  Sam Lee  '))).toBe('Sam Lee');
  });

  it('turns a blank string into an empty string', () => {
    expect(trimString(params('   '))).toBe('');
  });

  it('leaves other values as they are', () => {
    expect(trimString(params(42))).toBe(42);
    expect(trimString(params(undefined))).toBeUndefined();
  });
});
