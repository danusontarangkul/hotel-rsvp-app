import type { ApiErrorBody, SignupInput, Staff } from './types';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join('\n'));
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

async function readErrorMessages(response: Response): Promise<string[]> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (Array.isArray(body.message)) {
      return body.message;
    }
    if (typeof body.message === 'string') {
      return [body.message];
    }
  } catch {
    return [GENERIC_ERROR_MESSAGE];
  }
  return [GENERIC_ERROR_MESSAGE];
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessages(response));
  }
  return (await response.json()) as T;
}

export function signup(input: SignupInput): Promise<Staff> {
  return request<Staff>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
