import { Types } from 'mongoose';
import { toBookingResponse } from './booking-response';
import type { BookingRecord } from './bookings.types';

const booking: BookingRecord = {
  _id: new Types.ObjectId('6718f1d3a1b2c3d4e5f60719'),
  bookingNumber: 'K7Q2MX',
  guestName: 'Ana Lopez',
  guestEmail: 'ana@example.com',
  guestPhone: '5550100123',
  checkIn: '2026-10-27',
  checkOut: '2026-10-29',
  status: 'active',
  createdAt: new Date('2026-10-24T19:30:00.000Z'),
  cancelledAt: null,
  cancelledBy: null,
};

describe('toBookingResponse', () => {
  it('gives the booking in the API shape with a string id and ISO dates', () => {
    expect(toBookingResponse(booking)).toEqual({
      id: '6718f1d3a1b2c3d4e5f60719',
      bookingNumber: 'K7Q2MX',
      guestName: 'Ana Lopez',
      guestEmail: 'ana@example.com',
      guestPhone: '5550100123',
      checkIn: '2026-10-27',
      checkOut: '2026-10-29',
      status: 'active',
      createdAt: '2026-10-24T19:30:00.000Z',
      cancelledAt: null,
    });
  });

  it('gives the cancelled time of a cancelled booking', () => {
    const cancelled: BookingRecord = {
      ...booking,
      status: 'cancelled',
      cancelledAt: new Date('2026-10-25T08:00:00.000Z'),
      cancelledBy: new Types.ObjectId('6718f0c2a1b2c3d4e5f60718'),
    };

    expect(toBookingResponse(cancelled)).toMatchObject({
      status: 'cancelled',
      cancelledAt: '2026-10-25T08:00:00.000Z',
    });
  });

  it('does not include who cancelled the booking', () => {
    expect(toBookingResponse(booking)).not.toHaveProperty('cancelledBy');
  });
});
