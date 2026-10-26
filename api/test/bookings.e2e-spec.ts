import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './app.e2e';

type ErrorBody = { statusCode: number; message: string | string[] };

const NOON_IN_LOS_ANGELES_ON_OCTOBER_25 = new Date('2026-10-25T19:00:00.000Z');

const validBooking = {
  guestName: 'Maya Chen',
  guestEmail: 'maya.chen@example.com',
  guestPhone: '4155550349',
  checkIn: '2026-11-08',
  checkOut: '2026-11-11',
};

describe('POST /api/bookings', () => {
  let app: INestApplication<App>;
  let clearDatabase: () => Promise<void>;

  beforeAll(async () => {
    ({ app, clearDatabase } = await createTestApp({
      now: NOON_IN_LOS_ANGELES_ON_OCTOBER_25,
    }));
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  function book(body: object) {
    return request(app.getHttpServer()).post('/api/bookings').send(body);
  }

  it('returns 201 with the booking number and dates', async () => {
    const response = await book(validBooking).expect(201);

    expect(response.body).toEqual({
      bookingNumber: expect.stringMatching(/^[A-Z2-9]{6}$/) as string,
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    });
  });

  it('gives each booking its own booking number', async () => {
    const first = await book(validBooking).expect(201);
    const second = await book({
      ...validBooking,
      checkIn: '2026-11-20',
      checkOut: '2026-11-22',
    }).expect(201);

    expect((first.body as { bookingNumber: string }).bookingNumber).not.toBe(
      (second.body as { bookingNumber: string }).bookingNumber,
    );
  });

  it('accepts a check-in of tomorrow', async () => {
    await book({
      ...validBooking,
      checkIn: '2026-10-26',
      checkOut: '2026-10-27',
    }).expect(201);
  });

  it('returns 409 when a night of the stay is already booked', async () => {
    await book(validBooking).expect(201);

    const response = await book({
      ...validBooking,
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
    }).expect(409);

    expect((response.body as ErrorBody).message).toBe(
      'Those dates are no longer available.',
    );
  });

  it('allows same-day turnover', async () => {
    await book(validBooking).expect(201);

    await book({
      ...validBooking,
      checkIn: '2026-11-11',
      checkOut: '2026-11-12',
    }).expect(201);
  });

  it('books the same night only once when two requests race', async () => {
    const responses = await Promise.all([
      book(validBooking),
      book({ ...validBooking, guestName: 'Noah Williams' }),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
  });

  it.each([
    ['the name is missing', { guestName: undefined }, 'Name is required.'],
    ['the name is blank', { guestName: '  ' }, 'Name is required.'],
    [
      'the email is not valid',
      { guestEmail: 'maya@example' },
      'Email must be a valid email address.',
    ],
    [
      'the phone is missing',
      { guestPhone: undefined },
      'Phone number is required.',
    ],
    ['the phone is blank', { guestPhone: ' ' }, 'Phone number is required.'],
    [
      'the check-in is missing',
      { checkIn: undefined },
      'Check-in must be a date (YYYY-MM-DD).',
    ],
    [
      'the check-in is not YYYY-MM-DD',
      { checkIn: '11/08/2026' },
      'Check-in must be a date (YYYY-MM-DD).',
    ],
    [
      'the check-out is not a real date',
      { checkOut: '2026-02-30' },
      'Check-out must be a date (YYYY-MM-DD).',
    ],
    [
      'the check-in is today',
      { checkIn: '2026-10-25', checkOut: '2026-10-27' },
      'Check-in must be tomorrow or later.',
    ],
    [
      'the check-out is not after check-in',
      { checkOut: '2026-11-08' },
      'Check-out must be after check-in.',
    ],
  ])('returns 400 when %s', async (_, change, message) => {
    const response = await book({ ...validBooking, ...change }).expect(400);

    expect((response.body as ErrorBody).message).toEqual([message]);
  });

  it('returns 400 for an unknown field', async () => {
    await book({ ...validBooking, roomId: 'suite' }).expect(400);
  });

  it('saves nothing when the booking is rejected', async () => {
    await book({ ...validBooking, checkIn: '2026-10-25' }).expect(400);

    await book(validBooking).expect(201);
  });
});

describe('GET /api/bookings', () => {
  let app: INestApplication<App>;
  let clearDatabase: () => Promise<void>;

  beforeAll(async () => {
    ({ app, clearDatabase } = await createTestApp({
      now: NOON_IN_LOS_ANGELES_ON_OCTOBER_25,
    }));
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  async function staffCookie(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ name: 'Sam Lee', email: 'sam@hotel.com', password: 'at-least-8' })
      .expect(201);
    const [cookie] = response.get('Set-Cookie') ?? [];
    return cookie.split(';')[0];
  }

  function book(body: object) {
    return request(app.getHttpServer())
      .post('/api/bookings')
      .send(body)
      .expect(201);
  }

  function listBookings(cookie?: string) {
    const call = request(app.getHttpServer()).get('/api/bookings');
    return cookie ? call.set('Cookie', cookie) : call;
  }

  it('returns 200 with every booking for a logged-in staff member', async () => {
    const cookie = await staffCookie();
    const booked = await book(validBooking);

    const response = await listBookings(cookie).expect(200);

    expect(response.body).toEqual([
      {
        id: expect.stringMatching(/^[a-f0-9]{24}$/) as string,
        bookingNumber: (booked.body as { bookingNumber: string }).bookingNumber,
        guestName: 'Maya Chen',
        guestEmail: 'maya.chen@example.com',
        guestPhone: '4155550349',
        checkIn: '2026-11-08',
        checkOut: '2026-11-11',
        status: 'active',
        createdAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ) as string,
        cancelledAt: null,
      },
    ]);
  });

  it('returns the bookings sorted by check-in', async () => {
    const cookie = await staffCookie();
    await book({
      ...validBooking,
      checkIn: '2026-11-20',
      checkOut: '2026-11-22',
    });
    await book(validBooking);

    const response = await listBookings(cookie).expect(200);

    expect(
      (response.body as { checkIn: string }[]).map(
        (booking) => booking.checkIn,
      ),
    ).toEqual(['2026-11-08', '2026-11-20']);
  });

  it('returns an empty list when there are no bookings', async () => {
    const cookie = await staffCookie();

    const response = await listBookings(cookie).expect(200);

    expect(response.body).toEqual([]);
  });

  it('returns 401 when not logged in', async () => {
    await book(validBooking);

    const response = await listBookings().expect(401);

    expect((response.body as ErrorBody).statusCode).toBe(401);
    expect(response.body).not.toHaveProperty('0');
  });

  it('returns 401 for a token cookie that is not valid', async () => {
    await listBookings('token=not-a-real-token').expect(401);
  });

  it('returns 401 after logging out', async () => {
    const cookie = await staffCookie();
    const logout = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(204);
    const [clearedCookie] = logout.get('Set-Cookie') ?? [];

    await listBookings(clearedCookie.split(';')[0]).expect(401);
  });
});

describe('POST /api/bookings/:id/cancel', () => {
  let app: INestApplication<App>;
  let clearDatabase: () => Promise<void>;

  beforeAll(async () => {
    ({ app, clearDatabase } = await createTestApp({
      now: NOON_IN_LOS_ANGELES_ON_OCTOBER_25,
    }));
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  async function staffCookie(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ name: 'Sam Lee', email: 'sam@hotel.com', password: 'at-least-8' })
      .expect(201);
    const [cookie] = response.get('Set-Cookie') ?? [];
    return cookie.split(';')[0];
  }

  async function bookedId(cookie: string): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/bookings')
      .send(validBooking)
      .expect(201);
    const list = await request(app.getHttpServer())
      .get('/api/bookings')
      .set('Cookie', cookie)
      .expect(200);
    return (list.body as { id: string }[])[0].id;
  }

  function cancel(id: string, cookie?: string) {
    const call = request(app.getHttpServer()).post(
      `/api/bookings/${id}/cancel`,
    );
    return cookie ? call.set('Cookie', cookie) : call;
  }

  it('returns 200 with the booking marked cancelled', async () => {
    const cookie = await staffCookie();
    const id = await bookedId(cookie);

    const response = await cancel(id, cookie).expect(200);

    expect(response.body).toEqual({
      id,
      bookingNumber: expect.stringMatching(/^[A-Z2-9]{6}$/) as string,
      guestName: 'Maya Chen',
      guestEmail: 'maya.chen@example.com',
      guestPhone: '4155550349',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
      status: 'cancelled',
      createdAt: expect.any(String) as string,
      cancelledAt: '2026-10-25T19:00:00.000Z',
    });
  });

  it('frees the nights so the dates show as available again', async () => {
    const cookie = await staffCookie();
    const id = await bookedId(cookie);

    await cancel(id, cookie).expect(200);

    const availability = await request(app.getHttpServer())
      .get('/api/availability')
      .expect(200);
    expect(
      (availability.body as { bookedNights: string[] }).bookedNights,
    ).toEqual([]);
  });

  it('keeps the booking in the staff list as cancelled', async () => {
    const cookie = await staffCookie();
    const id = await bookedId(cookie);

    await cancel(id, cookie).expect(200);

    const list = await request(app.getHttpServer())
      .get('/api/bookings')
      .set('Cookie', cookie)
      .expect(200);
    expect(list.body).toMatchObject([{ id, status: 'cancelled' }]);
  });

  it('returns 409 when the booking is already cancelled', async () => {
    const cookie = await staffCookie();
    const id = await bookedId(cookie);
    await cancel(id, cookie).expect(200);

    const response = await cancel(id, cookie).expect(409);

    expect((response.body as ErrorBody).message).toBe(
      'Booking is already cancelled.',
    );
  });

  it('returns 404 when no booking has that id', async () => {
    const cookie = await staffCookie();

    const response = await cancel('6718f1d3a1b2c3d4e5f60719', cookie).expect(
      404,
    );

    expect((response.body as ErrorBody).message).toBe('Booking not found.');
  });

  it('returns 404 for an id that is not a valid id', async () => {
    const cookie = await staffCookie();

    await cancel('not-an-id', cookie).expect(404);
  });

  it('returns 401 and cancels nothing when not logged in', async () => {
    const cookie = await staffCookie();
    const id = await bookedId(cookie);

    await cancel(id).expect(401);

    const list = await request(app.getHttpServer())
      .get('/api/bookings')
      .set('Cookie', cookie)
      .expect(200);
    expect(list.body).toMatchObject([{ id, status: 'active' }]);
  });

  it('returns 401 for a token cookie that is not valid', async () => {
    const cookie = await staffCookie();
    const id = await bookedId(cookie);

    await cancel(id, 'token=not-a-real-token').expect(401);
  });

  it('ignores a request body', async () => {
    const cookie = await staffCookie();
    const id = await bookedId(cookie);

    await cancel(id, cookie).send({ status: 'active' }).expect(200);
  });
});
