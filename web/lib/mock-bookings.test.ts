import {
  cancelMockBooking,
  listMockBookings,
  resetMockBookings,
} from './mock-bookings';

afterEach(() => {
  resetMockBookings();
});

describe('mock bookings', () => {
  it('lists active and cancelled bookings sorted by check-in', () => {
    const bookings = listMockBookings();
    const checkIns = bookings.map((booking) => booking.checkIn);

    expect(checkIns).toEqual([...checkIns].sort());
    expect(bookings.some((booking) => booking.status === 'active')).toBe(true);
    expect(bookings.some((booking) => booking.status === 'cancelled')).toBe(
      true,
    );
  });

  it('stores phone numbers as 10 digits', () => {
    for (const booking of listMockBookings()) {
      expect(booking.guestPhone).toMatch(/^\d{10}$/);
    }
  });

  it('cancels an active booking', () => {
    const active = listMockBookings().find(
      (booking) => booking.status === 'active',
    )!;

    const result = cancelMockBooking(active.id);

    expect(result).toMatchObject({ id: active.id, status: 'cancelled' });
    expect(
      listMockBookings().find((booking) => booking.id === active.id)?.status,
    ).toBe('cancelled');
  });

  it('reports an unknown booking', () => {
    expect(cancelMockBooking('missing')).toBe('not-found');
  });

  it('reports a booking that is already cancelled', () => {
    const cancelled = listMockBookings().find(
      (booking) => booking.status === 'cancelled',
    )!;

    expect(cancelMockBooking(cancelled.id)).toBe('already-cancelled');
  });
});
