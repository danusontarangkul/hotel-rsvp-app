import { ApiError, login, signup } from './api';

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

afterEach(() => {
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
