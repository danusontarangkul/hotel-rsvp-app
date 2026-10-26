import { cancelMockBooking, listMockBookings } from './mock-bookings';
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
  return caught instanceof ApiError
    ? caught
    : new ApiError(0, [GENERIC_ERROR_MESSAGE]);
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

async function send(path: string, init: RequestInit): Promise<void> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessages(response));
  }
}

export function signup(input: SignupInput): Promise<Staff> {
  return request<Staff>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput): Promise<Staff> {
  return request<Staff>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getAvailability(): Promise<Availability> {
  return request<Availability>('/api/availability', { method: 'GET' });
}

export function createBooking(
  input: CreateBookingInput,
): Promise<BookingConfirmation> {
  return request<BookingConfirmation>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<void> {
  return send('/api/auth/logout', { method: 'POST' });
}

export function getBookings(): Promise<Booking[]> {
  return Promise.resolve(listMockBookings());
}

export function cancelBooking(id: string): Promise<Booking> {
  const result = cancelMockBooking(id);
  if (result === 'not-found') {
    return Promise.reject(new ApiError(404, ['Booking not found']));
  }
  if (result === 'already-cancelled') {
    return Promise.reject(new ApiError(409, ['Booking is already cancelled']));
  }
  return Promise.resolve(result);
}
