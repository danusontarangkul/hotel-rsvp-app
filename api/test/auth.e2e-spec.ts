import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './app.e2e';

type ErrorBody = { statusCode: number; message: string | string[] };

const validSignup = {
  name: 'Sam Lee',
  email: 'sam@hotel.com',
  password: 'at-least-8',
};

describe('POST /api/auth/signup', () => {
  let app: INestApplication<App>;
  let clearDatabase: () => Promise<void>;

  beforeAll(async () => {
    ({ app, clearDatabase } = await createTestApp());
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  function signup(body: object) {
    return request(app.getHttpServer()).post('/api/auth/signup').send(body);
  }

  it('creates the staff member and returns 201 with their id, name and email', async () => {
    const response = await signup(validSignup).expect(201);

    expect(response.body).toEqual({
      id: expect.stringMatching(/^[a-f0-9]{24}$/) as string,
      name: 'Sam Lee',
      email: 'sam@hotel.com',
    });
  });

  it('logs the new staff member in with an httpOnly token cookie for 7 days', async () => {
    const response = await signup(validSignup).expect(201);

    const [cookie] = response.get('Set-Cookie') ?? [];
    expect(cookie).toMatch(/^token=[^;]+;/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=604800');
    expect(cookie).toContain('Path=/');
  });

  it('never returns the password or its hash', async () => {
    const response = await signup(validSignup).expect(201);

    expect(JSON.stringify(response.body)).not.toContain('password');
    expect(JSON.stringify(response.body)).not.toContain('at-least-8');
  });

  it('stores the email in lowercase and trims the name', async () => {
    const response = await signup({
      ...validSignup,
      name: '  Sam Lee  ',
      email: '  Sam@Hotel.COM ',
    }).expect(201);

    expect(response.body).toMatchObject({
      name: 'Sam Lee',
      email: 'sam@hotel.com',
    });
  });

  it('returns 409 when the email is already registered', async () => {
    await signup(validSignup).expect(201);

    const response = await signup({ ...validSignup, name: 'Sam Two' }).expect(
      409,
    );

    expect((response.body as ErrorBody).message).toBe(
      'Email is already registered.',
    );
  });

  it('returns 409 for the same email in different case', async () => {
    await signup(validSignup).expect(201);

    await signup({ ...validSignup, email: 'SAM@HOTEL.COM' }).expect(409);
  });

  it.each([
    ['the name is missing', { name: undefined }, 'Name is required.'],
    ['the name is blank', { name: '   ' }, 'Name is required.'],
    [
      'the email is not valid',
      { email: 'sam@hotel' },
      'Email must be a valid email address.',
    ],
    [
      'the email is missing',
      { email: undefined },
      'Email must be a valid email address.',
    ],
    [
      'the password is under 8 characters',
      { password: '1234567' },
      'Password must be at least 8 characters.',
    ],
    [
      'the password is missing',
      { password: undefined },
      'Password must be at least 8 characters.',
    ],
  ])('returns 400 when %s', async (_, change, message) => {
    const response = await signup({ ...validSignup, ...change }).expect(400);

    expect((response.body as ErrorBody).message).toEqual([message]);
  });

  it('returns 400 with every problem when several fields are wrong', async () => {
    const response = await signup({
      name: '',
      email: 'x',
      password: 'x',
    }).expect(400);

    expect((response.body as ErrorBody).message).toEqual([
      'Name is required.',
      'Email must be a valid email address.',
      'Password must be at least 8 characters.',
    ]);
  });

  it('returns 400 for an unknown field', async () => {
    await signup({ ...validSignup, role: 'admin' }).expect(400);
  });

  it('does not set a cookie when sign up fails', async () => {
    const response = await signup({ ...validSignup, password: 'x' }).expect(
      400,
    );

    expect(response.get('Set-Cookie')).toBeUndefined();
  });
});

describe('POST /api/auth/logout', () => {
  let app: INestApplication<App>;
  let clearDatabase: () => Promise<void>;

  beforeAll(async () => {
    ({ app, clearDatabase } = await createTestApp());
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  function logout(cookie?: string) {
    const call = request(app.getHttpServer()).post('/api/auth/logout');
    return cookie ? call.set('Cookie', cookie) : call;
  }

  it('returns 204 with no body', async () => {
    const response = await logout().expect(204);

    expect(response.text).toBe('');
  });

  it('clears the token cookie with the same settings it was set with', async () => {
    const signedUp = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(validSignup)
      .expect(201);
    const [loginCookie] = signedUp.get('Set-Cookie') ?? [];

    const response = await logout(loginCookie.split(';')[0]).expect(204);

    const [cookie] = response.get('Set-Cookie') ?? [];
    expect(cookie).toMatch(/^token=;/);
    expect(cookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('works when not logged in', async () => {
    const response = await logout().expect(204);

    const [cookie] = response.get('Set-Cookie') ?? [];
    expect(cookie).toMatch(/^token=;/);
  });
});
