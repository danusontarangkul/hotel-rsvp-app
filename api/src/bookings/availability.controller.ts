import { Controller, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { AvailabilityResponse } from './bookings.types';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  getAvailability(): Promise<AvailabilityResponse> {
    return this.bookingsService.getAvailability();
  }
}
