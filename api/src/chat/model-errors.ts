const OLLAMA_RESPONSE_ERROR = 'ResponseError';
const FETCH_FAILED = 'fetch failed';

export function isModelUnavailable(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message === FETCH_FAILED;
  }
  return error instanceof Error && error.name === OLLAMA_RESPONSE_ERROR;
}
