import type {
  ApiErrorBody,
  Availability,
  Booking,
  BookingConfirmation,
  CreateBookingInput,
  LoginInput,
  SignupInput,
  Staff,
} from './types';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const SIGNUP_ERROR_STATUSES = [400, 409] as const;
const LOGIN_ERROR_STATUSES = [400, 401] as const;
const CREATE_BOOKING_ERROR_STATUSES = [400, 409] as const;
const CANCEL_BOOKING_ERROR_STATUSES = [409] as const;
const CURRENT_STAFF_ERROR_STATUSES = [401] as const;

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

export function toApiError(caught: unknown): ApiError {
  if (caught instanceof ApiError) {
    return caught;
  }
  console.error('Request failed before a response arrived:', caught);
  return new ApiError(0, [GENERIC_ERROR_MESSAGE]);
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

async function errorFor(
  path: string,
  response: Response,
  shownStatuses: readonly number[],
): Promise<ApiError> {
  const messages = await readErrorMessages(response);
  if (!shownStatuses.includes(response.status)) {
    console.error(`API ${response.status} from ${path}:`, messages);
    return new ApiError(response.status, [GENERIC_ERROR_MESSAGE]);
  }
  return new ApiError(response.status, messages);
}

async function send(
  path: string,
  init: RequestInit,
  shownStatuses: readonly number[] = [],
): Promise<Response> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    throw await errorFor(path, response, shownStatuses);
  }
  return response;
}

async function request<T>(
  path: string,
  init: RequestInit,
  shownStatuses: readonly number[] = [],
): Promise<T> {
  const response = await send(path, init, shownStatuses);
  return (await response.json()) as T;
}

export function signup(input: SignupInput): Promise<Staff> {
  return request<Staff>(
    '/api/auth/signup',
    { method: 'POST', body: JSON.stringify(input) },
    SIGNUP_ERROR_STATUSES,
  );
}

export function login(input: LoginInput): Promise<Staff> {
  return request<Staff>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify(input) },
    LOGIN_ERROR_STATUSES,
  );
}

export function getAvailability(): Promise<Availability> {
  return request<Availability>('/api/availability', { method: 'GET' });
}

export function createBooking(
  input: CreateBookingInput,
): Promise<BookingConfirmation> {
  return request<BookingConfirmation>(
    '/api/bookings',
    { method: 'POST', body: JSON.stringify(input) },
    CREATE_BOOKING_ERROR_STATUSES,
  );
}

export async function getCurrentStaff(): Promise<Staff | null> {
  try {
    return await request<Staff>(
      '/api/auth/me',
      { method: 'GET' },
      CURRENT_STAFF_ERROR_STATUSES,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await send('/api/auth/logout', { method: 'POST' });
}

export function getBookings(): Promise<Booking[]> {
  return request<Booking[]>('/api/bookings', { method: 'GET' });
}

export function cancelBooking(id: string): Promise<Booking> {
  return request<Booking>(
    `/api/bookings/${encodeURIComponent(id)}/cancel`,
    { method: 'POST' },
    CANCEL_BOOKING_ERROR_STATUSES,
  );
}
