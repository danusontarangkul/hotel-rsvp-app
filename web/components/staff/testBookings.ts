import type { Booking } from '@/lib/types';

export const activeBooking: Booking = {
  id: 'b1',
  bookingNumber: 'K7Q2MX',
  guestName: 'Elena Rossi',
  guestEmail: 'elena.rossi@example.com',
  guestPhone: '2125550142',
  checkIn: '2026-10-28',
  checkOut: '2026-10-30',
  status: 'active',
  createdAt: '2026-10-20T14:05:00.000Z',
  cancelledAt: null,
};

export const cancelledBooking: Booking = {
  id: 'b2',
  bookingNumber: 'M4T9QE',
  guestName: 'Maya Chen',
  guestEmail: 'maya.chen@example.com',
  guestPhone: '4155550349',
  checkIn: '2026-11-08',
  checkOut: '2026-11-11',
  status: 'cancelled',
  createdAt: '2026-10-21T18:12:00.000Z',
  cancelledAt: '2026-10-23T10:00:00.000Z',
};
