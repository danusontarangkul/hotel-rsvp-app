import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { BookingsService } from './bookings.service';
import type { BookingResponse, CreateBookingResponse } from './bookings.types';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(): Promise<BookingResponse[]> {
    return this.bookingsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateBookingDto): Promise<CreateBookingResponse> {
    return this.bookingsService.create(dto);
  }
}
