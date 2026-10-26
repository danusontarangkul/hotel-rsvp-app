import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Night } from '../src/bookings/night.schema';
import { createTestApp } from './app.e2e';

const NOON_IN_LOS_ANGELES_ON_OCTOBER_25 = new Date('2026-10-25T19:00:00.000Z');

type AvailabilityBody = {
  firstBookableDate: string;
  bookedNights: string[];
};

describe('GET /api/availability', () => {
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

  function getAvailability() {
    return request(app.getHttpServer()).get('/api/availability');
  }

  function book(checkIn: string, checkOut: string) {
    return request(app.getHttpServer())
      .post('/api/bookings')
      .send({
        guestName: 'Maya Chen',
        guestEmail: 'maya.chen@example.com',
        guestPhone: '4155550349',
        checkIn,
        checkOut,
      })
      .expect(201);
  }

  it('returns 200 with tomorrow and no booked nights when nothing is booked', async () => {
    const response = await getAvailability().expect(200);

    expect(response.body).toEqual({
      firstBookableDate: '2026-10-26',
      bookedNights: [],
    });
  });

  it('lists every booked night in date order, without the check-out days', async () => {
    await book('2026-11-20', '2026-11-22');
    await book('2026-11-08', '2026-11-11');

    const response = await getAvailability().expect(200);

    expect((response.body as AvailabilityBody).bookedNights).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
      '2026-11-20',
      '2026-11-21',
    ]);
  });

  it('leaves out today and past nights', async () => {
    const nightModel = app.get<Model<Night>>(getModelToken(Night.name));
    const bookingId = new Types.ObjectId();
    await nightModel.insertMany([
      { _id: '2026-10-24', bookingId },
      { _id: '2026-10-25', bookingId },
      { _id: '2026-10-26', bookingId },
    ]);

    const response = await getAvailability().expect(200);

    expect((response.body as AvailabilityBody).bookedNights).toEqual([
      '2026-10-26',
    ]);
  });

  it('needs no login', async () => {
    await getAvailability().expect(200);
  });
});
