import type { Booking } from './types';

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: '6718f1d3a1b2c3d4e5f60701',
    bookingNumber: 'K7Q2MX',
    guestName: 'Elena Rossi',
    guestEmail: 'elena.rossi@example.com',
    guestPhone: '2125550142',
    checkIn: '2026-10-28',
    checkOut: '2026-10-30',
    status: 'active',
    createdAt: '2026-10-20T14:05:00.000Z',
    cancelledAt: null,
  },
  {
    id: '6718f1d3a1b2c3d4e5f60702',
    bookingNumber: 'P3W8LA',
    guestName: 'Noah Williams',
    guestEmail: 'noah.williams@example.com',
    guestPhone: '3105550245',
    checkIn: '2026-11-03',
    checkOut: '2026-11-06',
    status: 'active',
    createdAt: '2026-10-21T09:30:00.000Z',
    cancelledAt: null,
  },
  {
    id: '6718f1d3a1b2c3d4e5f60703',
    bookingNumber: 'M4T9QE',
    guestName: 'Maya Chen',
    guestEmail: 'maya.chen@example.com',
    guestPhone: '4155550349',
    checkIn: '2026-11-08',
    checkOut: '2026-11-11',
    status: 'cancelled',
    createdAt: '2026-10-21T18:12:00.000Z',
    cancelledAt: '2026-10-23T10:00:00.000Z',
  },
  {
    id: '6718f1d3a1b2c3d4e5f60704',
    bookingNumber: 'R2N6VB',
    guestName: 'Amira Patel',
    guestEmail: 'amira.patel@example.com',
    guestPhone: '6175550439',
    checkIn: '2026-11-12',
    checkOut: '2026-11-15',
    status: 'cancelled',
    createdAt: '2026-10-22T11:45:00.000Z',
    cancelledAt: '2026-10-24T16:20:00.000Z',
  },
  {
    id: '6718f1d3a1b2c3d4e5f60705',
    bookingNumber: 'H8C5ZD',
    guestName: 'Oliver James',
    guestEmail: 'oliver.james@example.com',
    guestPhone: '7735550551',
    checkIn: '2026-11-18',
    checkOut: '2026-11-21',
    status: 'active',
    createdAt: '2026-10-24T08:00:00.000Z',
    cancelledAt: null,
  },
];

let bookings: Booking[] = INITIAL_BOOKINGS.map((booking) => ({ ...booking }));

export function listMockBookings(): Booking[] {
  return bookings.map((booking) => ({ ...booking }));
}

export function cancelMockBooking(
  id: string,
): Booking | 'not-found' | 'already-cancelled' {
  const booking = bookings.find((candidate) => candidate.id === id);
  if (!booking) {
    return 'not-found';
  }
  if (booking.status === 'cancelled') {
    return 'already-cancelled';
  }
  booking.status = 'cancelled';
  booking.cancelledAt = new Date().toISOString();
  return { ...booking };
}

export function resetMockBookings(): void {
  bookings = INITIAL_BOOKINGS.map((booking) => ({ ...booking }));
}
