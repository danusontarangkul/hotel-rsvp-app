import { isModelUnavailable } from './model-errors';

function ollamaResponseError(message: string): Error {
  const error = new Error(message);
  error.name = 'ResponseError';
  return error;
}

describe('isModelUnavailable', () => {
  it('is true when Ollama is not running', () => {
    expect(isModelUnavailable(new TypeError('fetch failed'))).toBe(true);
  });

  it('is true when Ollama answers with an error, like a model that is not pulled', () => {
    expect(
      isModelUnavailable(ollamaResponseError('model "qwen3:8b" not found')),
    ).toBe(true);
  });

  it('is false for other type errors', () => {
    expect(
      isModelUnavailable(new TypeError('Cannot read properties of undefined')),
    ).toBe(false);
  });

  it('is false for other errors', () => {
    expect(isModelUnavailable(new Error('Something else'))).toBe(false);
  });

  it('is false for values that are not errors', () => {
    expect(isModelUnavailable('fetch failed')).toBe(false);
  });
});
