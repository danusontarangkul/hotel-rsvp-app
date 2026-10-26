import {
  ApiError,
  GENERIC_ERROR_MESSAGE,
  cancelBooking,
  createBooking,
  getAvailability,
  getBookings,
  login,
  logout,
  signup,
  toApiError,
} from './api';

const input = {
  name: 'Sam Lee',
  email: 'sam@hotel.com',
  password: 'at-least-8',
};

function mockFetch(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

let consoleError: jest.SpyInstance;

beforeEach(() => {
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

describe('signup', () => {
  it('posts the details to the sign up endpoint and returns the staff member', async () => {
    const staff = { id: '1', name: 'Sam Lee', email: 'sam@hotel.com' };
    mockFetch(201, staff);

    await expect(signup(input)).resolves.toEqual(staff);
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws an ApiError with the message on a 409', async () => {
    mockFetch(409, {
      statusCode: 409,
      message: 'Email is already registered',
      error: 'Conflict',
    });

    await expect(signup(input)).rejects.toEqual(
      new ApiError(409, ['Email is already registered']),
    );
  });

  it('throws an ApiError with every message on a 400', async () => {
    const messages = ['email must be an email', 'password is too short'];
    mockFetch(400, {
      statusCode: 400,
      message: messages,
      error: 'Bad Request',
    });

    await expect(signup(input)).rejects.toMatchObject({
      status: 400,
      messages,
    });
  });

  it('throws a generic message when the error body is not JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new SyntaxError('bad json')),
    });

    await expect(signup(input)).rejects.toMatchObject({
      status: 500,
      messages: ['Something went wrong. Please try again.'],
    });
  });
});

describe('login', () => {
  it('posts the details to the log in endpoint and returns the staff member', async () => {
    const staff = { id: '1', name: 'Sam Lee', email: 'sam@hotel.com' };
    const details = { email: 'sam@hotel.com', password: 'at-least-8' };
    mockFetch(200, staff);

    await expect(login(details)).resolves.toEqual(staff);
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(details),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws an ApiError with the message on a 401', async () => {
    mockFetch(401, {
      statusCode: 401,
      message: 'Wrong email or password',
      error: 'Unauthorized',
    });

    await expect(
      login({ email: 'sam@hotel.com', password: 'nope' }),
    ).rejects.toEqual(new ApiError(401, ['Wrong email or password']));
  });
});

describe('getAvailability', () => {
  it('gets the first bookable date and booked nights from the API', async () => {
    const availability = {
      firstBookableDate: '2026-10-26',
      bookedNights: ['2026-11-08', '2026-11-09'],
    };
    mockFetch(200, availability);

    await expect(getAvailability()).resolves.toEqual(availability);
    expect(global.fetch).toHaveBeenCalledWith('/api/availability', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws the generic message instead of the server’s text when the request fails', async () => {
    mockFetch(500, { statusCode: 500, message: 'Internal server error' });

    await expect(getAvailability()).rejects.toEqual(
      new ApiError(500, [GENERIC_ERROR_MESSAGE]),
    );
  });
});

describe('createBooking', () => {
  const booking = {
    guestName: 'Maya Chen',
    guestEmail: 'maya.chen@example.com',
    guestPhone: '5551234567',
    checkIn: '2026-11-08',
    checkOut: '2026-11-11',
  };

  it('posts the booking and returns the confirmation', async () => {
    const confirmation = {
      bookingNumber: 'K7Q2MX',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    };
    mockFetch(201, confirmation);

    await expect(createBooking(booking)).resolves.toEqual(confirmation);
    expect(global.fetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws an ApiError with the message on a 409', async () => {
    mockFetch(409, {
      statusCode: 409,
      message: 'Those dates are no longer available',
      error: 'Conflict',
    });

    await expect(createBooking(booking)).rejects.toEqual(
      new ApiError(409, ['Those dates are no longer available']),
    );
  });
});

describe('toApiError', () => {
  it('keeps an ApiError as it is', () => {
    const error = new ApiError(409, ['Taken']);

    expect(toApiError(error)).toBe(error);
  });

  it('turns any other error into an ApiError with a generic message', () => {
    expect(toApiError(new TypeError('Failed to fetch'))).toEqual(
      new ApiError(0, ['Something went wrong. Please try again.']),
    );
  });

  it('logs the original error to the console', () => {
    const networkError = new TypeError('Failed to fetch');

    toApiError(networkError);

    expect(consoleError).toHaveBeenCalledWith(
      'Request failed before a response arrived:',
      networkError,
    );
  });
});

describe('logout', () => {
  it('posts to the log out endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 });

    await expect(logout()).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws an ApiError when the request fails', async () => {
    mockFetch(500, { statusCode: 500, message: 'Server down' });

    await expect(logout()).rejects.toEqual(
      new ApiError(500, [GENERIC_ERROR_MESSAGE]),
    );
  });
});

describe('getBookings', () => {
  it('gets every booking from the API', async () => {
    const bookings = [
      {
        id: '6718f1d3a1b2c3d4e5f60719',
        bookingNumber: 'K7Q2MX',
        guestName: 'Ana Lopez',
        guestEmail: 'ana@example.com',
        guestPhone: '5550100123',
        checkIn: '2026-10-27',
        checkOut: '2026-10-29',
        status: 'active',
        createdAt: '2026-10-24T19:30:00.000Z',
        cancelledAt: null,
      },
    ];
    mockFetch(200, bookings);

    await expect(getBookings()).resolves.toEqual(bookings);
    expect(global.fetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws a 401 ApiError with the generic message when not logged in', async () => {
    mockFetch(401, { statusCode: 401, message: 'Unauthorized' });

    await expect(getBookings()).rejects.toEqual(
      new ApiError(401, [GENERIC_ERROR_MESSAGE]),
    );
  });
});

describe('cancelBooking', () => {
  it('cancels the booking through the API and returns it', async () => {
    const cancelled = {
      id: '6718f1d3a1b2c3d4e5f60719',
      bookingNumber: 'K7Q2MX',
      guestName: 'Ana Lopez',
      guestEmail: 'ana@example.com',
      guestPhone: '5550100123',
      checkIn: '2026-10-27',
      checkOut: '2026-10-29',
      status: 'cancelled',
      createdAt: '2026-10-24T19:30:00.000Z',
      cancelledAt: '2026-10-25T19:00:00.000Z',
    };
    mockFetch(200, cancelled);

    await expect(cancelBooking('6718f1d3a1b2c3d4e5f60719')).resolves.toEqual(
      cancelled,
    );
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bookings/6718f1d3a1b2c3d4e5f60719/cancel',
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    );
  });

  it('keeps the id inside its own part of the path', async () => {
    mockFetch(200, {});

    await cancelBooking('a/b');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bookings/a%2Fb/cancel',
      expect.anything(),
    );
  });

  it('throws the generic message for an error the contract does not list, like an unknown route', async () => {
    mockFetch(404, {
      statusCode: 404,
      message: 'Cannot POST /api/bookings/6adec6acfac186eda06e125f/cancel',
      error: 'Not Found',
    });

    await expect(cancelBooking('6adec6acfac186eda06e125f')).rejects.toEqual(
      new ApiError(404, [GENERIC_ERROR_MESSAGE]),
    );
  });

  it('logs the real status and message of a hidden error to the console', async () => {
    mockFetch(404, {
      statusCode: 404,
      message: 'Cannot POST /api/bookings/6adec6acfac186eda06e125f/cancel',
    });

    await expect(cancelBooking('6adec6acfac186eda06e125f')).rejects.toThrow();

    expect(consoleError).toHaveBeenCalledWith(
      'API 404 from /api/bookings/6adec6acfac186eda06e125f/cancel:',
      ['Cannot POST /api/bookings/6adec6acfac186eda06e125f/cancel'],
    );
  });

  it('does not log an error whose message is shown', async () => {
    mockFetch(409, {
      statusCode: 409,
      message: 'Booking is already cancelled.',
    });

    await expect(cancelBooking('6adec6acfac186eda06e125f')).rejects.toThrow();

    expect(consoleError).not.toHaveBeenCalled();
  });

  it('throws a 409 ApiError for a booking that is already cancelled', async () => {
    mockFetch(409, {
      statusCode: 409,
      message: 'Booking is already cancelled.',
    });

    await expect(cancelBooking('6718f1d3a1b2c3d4e5f60719')).rejects.toEqual(
      new ApiError(409, ['Booking is already cancelled.']),
    );
  });
});
