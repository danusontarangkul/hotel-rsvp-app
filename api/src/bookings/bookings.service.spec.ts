import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import type { Model } from 'mongoose';
import { CLOCK, type Clock } from '../common/clock';
import { generateBookingNumber } from './booking-number';
import { Booking, BookingSchema } from './booking.schema';
import {
  CHECK_IN_TOO_EARLY,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
  DATES_TAKEN,
  MAX_BOOKING_NUMBER_ATTEMPTS,
} from './bookings.constants';
import { BookingsService } from './bookings.service';
import type { NewBooking } from './bookings.types';
import { Night, NightSchema } from './night.schema';

jest.mock('./booking-number', () => ({
  generateBookingNumber: jest.fn(),
}));

const mockGenerateBookingNumber = jest.mocked(generateBookingNumber);
const { generateBookingNumber: realGenerateBookingNumber } =
  jest.requireActual<typeof import('./booking-number')>('./booking-number');

const DATABASE_TIMEOUT_MS = 60_000;
const NOON_IN_LOS_ANGELES_ON_OCTOBER_25 = new Date('2026-10-25T19:00:00.000Z');

const stay: NewBooking = {
  guestName: 'Maya Chen',
  guestEmail: 'Maya.Chen@Example.com',
  guestPhone: '4155550349',
  checkIn: '2026-11-08',
  checkOut: '2026-11-11',
};

describe('BookingsService', () => {
  let replSet: MongoMemoryReplSet;
  let moduleRef: TestingModule;
  let service: BookingsService;
  let bookingModel: Model<Booking>;
  let nightModel: Model<Night>;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const clock: Clock = { now: () => NOON_IN_LOS_ANGELES_ON_OCTOBER_25 };
    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(replSet.getUri('bookings-unit')),
        MongooseModule.forFeature([
          { name: Booking.name, schema: BookingSchema },
          { name: Night.name, schema: NightSchema },
        ]),
      ],
      providers: [BookingsService, { provide: CLOCK, useValue: clock }],
    }).compile();
    service = moduleRef.get(BookingsService);
    bookingModel = moduleRef.get(getModelToken(Booking.name));
    nightModel = moduleRef.get(getModelToken(Night.name));
    await bookingModel.syncIndexes();
    await nightModel.syncIndexes();
  }, DATABASE_TIMEOUT_MS);

  beforeEach(() => {
    mockGenerateBookingNumber.mockImplementation(realGenerateBookingNumber);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await bookingModel.deleteMany({});
    await nightModel.deleteMany({});
  });

  afterAll(async () => {
    await moduleRef.close();
    await replSet.stop();
  });

  describe('create', () => {
    it('returns the booking number and dates', async () => {
      const result = await service.create(stay);

      expect(result).toEqual({
        bookingNumber: expect.stringMatching(/^[A-Z2-9]{6}$/) as string,
        checkIn: '2026-11-08',
        checkOut: '2026-11-11',
      });
    });

    it('saves an active booking with a lowercase email', async () => {
      const { bookingNumber } = await service.create(stay);

      const saved = await bookingModel.findOne({ bookingNumber }).lean();
      expect(saved).toMatchObject({
        guestName: 'Maya Chen',
        guestEmail: 'maya.chen@example.com',
        guestPhone: '4155550349',
        status: 'active',
        cancelledAt: null,
      });
    });

    it('saves one night per night of the stay, linked to the booking', async () => {
      const { bookingNumber } = await service.create(stay);

      const booking = await bookingModel.findOne({ bookingNumber }).lean();
      const nights = await nightModel.find().sort({ _id: 1 }).lean();
      expect(nights.map((night) => night._id)).toEqual([
        '2026-11-08',
        '2026-11-09',
        '2026-11-10',
      ]);
      expect(
        nights.every((night) => night.bookingId.equals(booking!._id)),
      ).toBe(true);
    });

    it('accepts a check-in of tomorrow in Los Angeles', async () => {
      await expect(
        service.create({
          ...stay,
          checkIn: '2026-10-26',
          checkOut: '2026-10-27',
        }),
      ).resolves.toMatchObject({ checkIn: '2026-10-26' });
    });

    it('rejects a check-in of today in Los Angeles', async () => {
      await expect(
        service.create({
          ...stay,
          checkIn: '2026-10-25',
          checkOut: '2026-10-27',
        }),
      ).rejects.toEqual(new BadRequestException([CHECK_IN_TOO_EARLY]));
    });

    it('rejects a check-in in the past', async () => {
      await expect(
        service.create({
          ...stay,
          checkIn: '2026-10-01',
          checkOut: '2026-10-03',
        }),
      ).rejects.toEqual(new BadRequestException([CHECK_IN_TOO_EARLY]));
    });

    it('rejects a check-out that is not after check-in', async () => {
      await expect(
        service.create({
          ...stay,
          checkIn: '2026-11-08',
          checkOut: '2026-11-08',
        }),
      ).rejects.toEqual(
        new BadRequestException([CHECK_OUT_NOT_AFTER_CHECK_IN]),
      );
    });

    it('lists every date problem at once', async () => {
      await expect(
        service.create({
          ...stay,
          checkIn: '2026-10-20',
          checkOut: '2026-10-19',
        }),
      ).rejects.toEqual(
        new BadRequestException([
          CHECK_IN_TOO_EARLY,
          CHECK_OUT_NOT_AFTER_CHECK_IN,
        ]),
      );
    });

    it('rejects a stay that includes a booked night', async () => {
      await service.create(stay);

      await expect(
        service.create({
          ...stay,
          checkIn: '2026-11-10',
          checkOut: '2026-11-12',
        }),
      ).rejects.toEqual(new ConflictException(DATES_TAKEN));
    });

    it('saves nothing from a rejected stay', async () => {
      await service.create(stay);

      await expect(
        service.create({
          ...stay,
          checkIn: '2026-11-10',
          checkOut: '2026-11-12',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(await bookingModel.countDocuments()).toBe(1);
      expect(await nightModel.exists({ _id: '2026-11-11' })).toBeNull();
    });

    it('allows a check-in on the previous guest’s check-out day', async () => {
      await service.create(stay);

      await expect(
        service.create({
          ...stay,
          checkIn: '2026-11-11',
          checkOut: '2026-11-13',
        }),
      ).resolves.toMatchObject({ checkIn: '2026-11-11' });
    });

    it('allows a check-out on the next guest’s check-in day', async () => {
      await service.create(stay);

      await expect(
        service.create({
          ...stay,
          checkIn: '2026-11-06',
          checkOut: '2026-11-08',
        }),
      ).resolves.toMatchObject({ checkOut: '2026-11-08' });
    });

    it('lets only one of two bookings for the same night through', async () => {
      const results = await Promise.allSettled([
        service.create(stay),
        service.create({ ...stay, guestName: 'Noah Williams' }),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await bookingModel.countDocuments()).toBe(1);
    });

    it('tries a new booking number when one is already taken', async () => {
      mockGenerateBookingNumber.mockReturnValue('TAKEN2');
      await service.create(stay);
      mockGenerateBookingNumber
        .mockReturnValueOnce('TAKEN2')
        .mockReturnValueOnce('FRESH3');

      const result = await service.create({
        ...stay,
        checkIn: '2026-11-20',
        checkOut: '2026-11-22',
      });

      expect(result.bookingNumber).toBe('FRESH3');
      expect(await bookingModel.countDocuments()).toBe(2);
    });

    it('gives up after too many taken booking numbers', async () => {
      mockGenerateBookingNumber.mockReturnValue('TAKEN2');
      await service.create(stay);

      await expect(
        service.create({
          ...stay,
          checkIn: '2026-11-20',
          checkOut: '2026-11-22',
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
      expect(mockGenerateBookingNumber).toHaveBeenCalledTimes(
        1 + MAX_BOOKING_NUMBER_ATTEMPTS,
      );
    });
  });
});
