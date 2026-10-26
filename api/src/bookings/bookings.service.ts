import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { ClientSession, Connection, Model } from 'mongoose';
import { CLOCK, type Clock } from '../common/clock';
import { HOTEL_TIME_ZONE } from '../common/constants';
import { addDays, nightsBetween, todayIn } from '../common/dates';
import { normalizeEmail } from '../common/email';
import { isDuplicateKeyError } from '../common/mongo-errors';
import { generateBookingNumber } from './booking-number';
import { toBookingResponse } from './booking-response';
import { Booking } from './booking.schema';
import {
  CHECK_IN_TOO_EARLY,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
  DATES_TAKEN,
  MAX_BOOKING_NUMBER_ATTEMPTS,
} from './bookings.constants';
import type {
  AvailabilityResponse,
  BookingRecord,
  BookingResponse,
  CreateBookingResponse,
  NewBooking,
} from './bookings.types';
import { Night } from './night.schema';

class BookingNumberTakenError extends Error {}

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Night.name) private readonly nightModel: Model<Night>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async getAvailability(): Promise<AvailabilityResponse> {
    const firstBookableDate = this.tomorrow();
    const nights = await this.nightModel
      .find({ _id: { $gte: firstBookableDate } })
      .sort({ _id: 1 })
      .select({ _id: 1 })
      .lean<{ _id: string }[]>()
      .exec();
    return {
      firstBookableDate,
      bookedNights: nights.map((night) => night._id),
    };
  }

  async findAll(): Promise<BookingResponse[]> {
    const bookings = await this.bookingModel
      .find()
      .sort({ checkIn: 1, createdAt: 1 })
      .lean<BookingRecord[]>()
      .exec();
    return bookings.map(toBookingResponse);
  }

  async create(booking: NewBooking): Promise<CreateBookingResponse> {
    this.checkDates(booking.checkIn, booking.checkOut);
    const saved = await this.saveWithUniqueNumber({
      ...booking,
      guestEmail: normalizeEmail(booking.guestEmail),
    });
    return {
      bookingNumber: saved.bookingNumber,
      checkIn: saved.checkIn,
      checkOut: saved.checkOut,
    };
  }

  private tomorrow(): string {
    return addDays(todayIn(HOTEL_TIME_ZONE, this.clock.now()), 1);
  }

  private checkDates(checkIn: string, checkOut: string): void {
    const tomorrow = this.tomorrow();
    const problems: string[] = [];
    if (checkIn < tomorrow) {
      problems.push(CHECK_IN_TOO_EARLY);
    }
    if (checkOut <= checkIn) {
      problems.push(CHECK_OUT_NOT_AFTER_CHECK_IN);
    }
    if (problems.length > 0) {
      throw new BadRequestException(problems);
    }
  }

  private async saveWithUniqueNumber(
    booking: NewBooking,
  ): Promise<BookingRecord> {
    for (let attempt = 0; attempt < MAX_BOOKING_NUMBER_ATTEMPTS; attempt += 1) {
      try {
        return await this.saveInTransaction(booking, generateBookingNumber());
      } catch (error) {
        if (!(error instanceof BookingNumberTakenError)) {
          throw error;
        }
      }
    }
    throw new InternalServerErrorException();
  }

  private async saveInTransaction(
    booking: NewBooking,
    bookingNumber: string,
  ): Promise<BookingRecord> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const saved = await this.insertBooking(booking, bookingNumber, session);
        await this.insertNights(saved, session);
        return saved;
      });
    } finally {
      await session.endSession();
    }
  }

  private async insertBooking(
    booking: NewBooking,
    bookingNumber: string,
    session: ClientSession,
  ): Promise<BookingRecord> {
    try {
      const [created] = await this.bookingModel.create(
        [{ ...booking, bookingNumber }],
        { session },
      );
      return created.toObject<BookingRecord>();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new BookingNumberTakenError();
      }
      throw error;
    }
  }

  private async insertNights(
    booking: BookingRecord,
    session: ClientSession,
  ): Promise<void> {
    const nights = nightsBetween(booking.checkIn, booking.checkOut).map(
      (night) => ({ _id: night, bookingId: booking._id }),
    );
    try {
      await this.nightModel.insertMany(nights, { session });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(DATES_TAKEN);
      }
      throw error;
    }
  }
}
