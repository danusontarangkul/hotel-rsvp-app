import type { BookingRecord, BookingResponse } from './bookings.types';

export function toBookingResponse(booking: BookingRecord): BookingResponse {
  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
  };
}
