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
