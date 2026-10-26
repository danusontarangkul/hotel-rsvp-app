import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CLOCK, systemClock } from '../common/clock';
import { AvailabilityController } from './availability.controller';
import { Booking, BookingSchema } from './booking.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Night, NightSchema } from './night.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Night.name, schema: NightSchema },
    ]),
  ],
  controllers: [AvailabilityController, BookingsController],
  providers: [BookingsService, { provide: CLOCK, useValue: systemClock }],
})
export class BookingsModule {}
