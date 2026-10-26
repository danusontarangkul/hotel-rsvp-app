import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Types, type Model } from 'mongoose';
import { CLOCK, type Clock } from '../common/clock';
import { generateBookingNumber } from './booking-number';
import { Booking, BookingSchema } from './booking.schema';
import {
  BOOKING_ALREADY_CANCELLED,
  BOOKING_NOT_FOUND,
  CHECK_IN_TOO_EARLY,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
  DATES_TAKEN,
  MAX_BOOKING_NUMBER_ATTEMPTS,
} from './bookings.constants';
import { BookingsService } from './bookings.service';
import type { BookingRecord, NewBooking } from './bookings.types';
import { Night, NightSchema } from './night.schema';

jest.mock('./booking-number', () => ({
  generateBookingNumber: jest.fn(),
}));

const mockGenerateBookingNumber = jest.mocked(generateBookingNumber);
const { generateBookingNumber: realGenerateBookingNumber } =
  jest.requireActual<typeof import('./booking-number')>('./booking-number');

const DATABASE_TIMEOUT_MS = 60_000;
const NOON_IN_LOS_ANGELES_ON_OCTOBER_25 = new Date('2026-10-25T19:00:00.000Z');
const STAFF_ID = '6718f0c2a1b2c3d4e5f60718';

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

  async function savedBooking(bookingNumber: string): Promise<BookingRecord> {
    const booking = await bookingModel
      .findOne({ bookingNumber })
      .lean<BookingRecord>()
      .exec();
    if (!booking) {
      throw new Error(`No booking saved with number ${bookingNumber}`);
    }
    return booking;
  }

  async function bookedNightIds(): Promise<string[]> {
    const nights = await nightModel
      .find()
      .sort({ _id: 1 })
      .lean<Night[]>()
      .exec();
    return nights.map((night) => night._id);
  }

  describe('getAvailability', () => {
    it('gives tomorrow in Los Angeles as the first bookable date', async () => {
      await expect(service.getAvailability()).resolves.toEqual({
        firstBookableDate: '2026-10-26',
        bookedNights: [],
      });
    });

    it('lists the booked nights in date order', async () => {
      await service.create({
        ...stay,
        checkIn: '2026-11-20',
        checkOut: '2026-11-22',
      });
      await service.create(stay);

      const { bookedNights } = await service.getAvailability();

      expect(bookedNights).toEqual([
        '2026-11-08',
        '2026-11-09',
        '2026-11-10',
        '2026-11-20',
        '2026-11-21',
      ]);
    });

    it('does not list a check-out day, so it stays open for check-in', async () => {
      await service.create(stay);

      const { bookedNights } = await service.getAvailability();

      expect(bookedNights).not.toContain('2026-11-11');
    });

    it('leaves out today and past nights', async () => {
      const { bookingNumber } = await service.create(stay);
      const { _id: bookingId } = await savedBooking(bookingNumber);
      await nightModel.insertMany([
        { _id: '2026-10-24', bookingId },
        { _id: '2026-10-25', bookingId },
        { _id: '2026-10-26', bookingId },
      ]);

      const { bookedNights } = await service.getAvailability();

      expect(bookedNights).toEqual([
        '2026-10-26',
        '2026-11-08',
        '2026-11-09',
        '2026-11-10',
      ]);
    });
  });

  describe('findAll', () => {
    it('returns no bookings when there are none', async () => {
      await expect(service.findAll()).resolves.toEqual([]);
    });

    it('returns each booking in the API shape', async () => {
      const { bookingNumber } = await service.create(stay);
      const saved = await savedBooking(bookingNumber);

      await expect(service.findAll()).resolves.toEqual([
        {
          id: saved._id.toString(),
          bookingNumber,
          guestName: 'Maya Chen',
          guestEmail: 'maya.chen@example.com',
          guestPhone: '4155550349',
          checkIn: '2026-11-08',
          checkOut: '2026-11-11',
          status: 'active',
          createdAt: saved.createdAt.toISOString(),
          cancelledAt: null,
        },
      ]);
    });

    it('sorts by check-in, then by when the booking was made', async () => {
      await bookingModel.collection.insertMany([
        {
          ...stay,
          bookingNumber: 'LATER2',
          checkIn: '2026-11-20',
          checkOut: '2026-11-22',
          status: 'active',
          cancelledAt: null,
          createdAt: new Date('2026-10-20T10:00:00.000Z'),
        },
        {
          ...stay,
          bookingNumber: 'SECOND',
          status: 'active',
          cancelledAt: null,
          createdAt: new Date('2026-10-22T10:00:00.000Z'),
        },
        {
          ...stay,
          bookingNumber: 'FIRST3',
          status: 'cancelled',
          cancelledAt: new Date('2026-10-21T10:00:00.000Z'),
          createdAt: new Date('2026-10-21T09:00:00.000Z'),
        },
      ]);

      const bookings = await service.findAll();

      expect(bookings.map((booking) => booking.bookingNumber)).toEqual([
        'FIRST3',
        'SECOND',
        'LATER2',
      ]);
    });

    it('includes cancelled bookings with their cancelled time', async () => {
      const { bookingNumber } = await service.create(stay);
      await bookingModel.updateOne(
        { bookingNumber },
        {
          status: 'cancelled',
          cancelledAt: new Date('2026-10-25T20:00:00.000Z'),
        },
      );

      await expect(service.findAll()).resolves.toMatchObject([
        { status: 'cancelled', cancelledAt: '2026-10-25T20:00:00.000Z' },
      ]);
    });
  });

  describe('cancel', () => {
    async function bookedId(booking: NewBooking = stay): Promise<string> {
      const { bookingNumber } = await service.create(booking);
      return (await savedBooking(bookingNumber))._id.toString();
    }

    it('returns the booking as cancelled, with the time it was cancelled', async () => {
      const id = await bookedId();

      await expect(service.cancel(id, STAFF_ID)).resolves.toMatchObject({
        id,
        status: 'cancelled',
        cancelledAt: NOON_IN_LOS_ANGELES_ON_OCTOBER_25.toISOString(),
        checkIn: '2026-11-08',
        checkOut: '2026-11-11',
      });
    });

    it('saves who cancelled the booking and keeps the booking', async () => {
      const id = await bookedId();

      await service.cancel(id, STAFF_ID);

      const saved = await bookingModel.findById(id).lean<BookingRecord>();
      expect(saved).toMatchObject({
        status: 'cancelled',
        cancelledAt: NOON_IN_LOS_ANGELES_ON_OCTOBER_25,
        cancelledBy: new Types.ObjectId(STAFF_ID),
      });
    });

    it('frees the booking’s nights so the dates can be booked again', async () => {
      const id = await bookedId();

      await service.cancel(id, STAFF_ID);

      expect(await bookedNightIds()).toEqual([]);
      await expect(service.create(stay)).resolves.toMatchObject({
        checkIn: '2026-11-08',
      });
    });

    it('leaves the nights of other bookings alone', async () => {
      const id = await bookedId();
      await bookedId({
        ...stay,
        checkIn: '2026-11-20',
        checkOut: '2026-11-22',
      });

      await service.cancel(id, STAFF_ID);

      expect(await bookedNightIds()).toEqual(['2026-11-20', '2026-11-21']);
    });

    it('rejects a booking that is already cancelled', async () => {
      const id = await bookedId();
      await service.cancel(id, STAFF_ID);

      await expect(service.cancel(id, STAFF_ID)).rejects.toEqual(
        new ConflictException(BOOKING_ALREADY_CANCELLED),
      );
    });

    it('lets only one of two cancels at the same time succeed', async () => {
      const id = await bookedId();

      const results = await Promise.allSettled([
        service.cancel(id, STAFF_ID),
        service.cancel(id, STAFF_ID),
      ]);

      expect(results.map((result) => result.status).sort()).toEqual([
        'fulfilled',
        'rejected',
      ]);
    });

    it('rejects an id with no booking', async () => {
      await expect(
        service.cancel(new Types.ObjectId().toString(), STAFF_ID),
      ).rejects.toEqual(new NotFoundException(BOOKING_NOT_FOUND));
    });

    it('rejects an id that is not a valid id', async () => {
      await expect(service.cancel('not-an-id', STAFF_ID)).rejects.toEqual(
        new NotFoundException(BOOKING_NOT_FOUND),
      );
    });
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

      expect(await savedBooking(bookingNumber)).toMatchObject({
        guestName: 'Maya Chen',
        guestEmail: 'maya.chen@example.com',
        guestPhone: '4155550349',
        status: 'active',
        cancelledAt: null,
      });
    });

    it('saves one night per night of the stay, linked to the booking', async () => {
      const { bookingNumber } = await service.create(stay);

      const booking = await savedBooking(bookingNumber);
      const nights = await nightModel.find().lean<Night[]>().exec();
      expect(await bookedNightIds()).toEqual([
        '2026-11-08',
        '2026-11-09',
        '2026-11-10',
      ]);
      expect(nights.every((night) => night.bookingId.equals(booking._id))).toBe(
        true,
      );
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
