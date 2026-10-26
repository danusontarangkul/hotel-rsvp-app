import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CLOCK, systemClock } from '../common/clock';
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
  controllers: [BookingsController],
  providers: [BookingsService, { provide: CLOCK, useValue: systemClock }],
})
export class BookingsModule {}
