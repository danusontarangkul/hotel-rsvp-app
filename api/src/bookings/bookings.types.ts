import type { Types } from 'mongoose';
import type { Booking } from './booking.schema';

export type BookingStatus = 'active' | 'cancelled';

export type BookingRecord = Booking & { _id: Types.ObjectId };

export type NewBooking = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
};

export type AvailabilityResponse = {
  firstBookableDate: string;
  bookedNights: string[];
};

export type CreateBookingResponse = {
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
};

export type BookingResponse = {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt: string | null;
};
