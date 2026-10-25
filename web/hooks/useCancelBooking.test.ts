import { act, renderHook } from '@testing-library/react';
import { cancelBooking } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { useCancelBooking } from './useCancelBooking';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  cancelBooking: jest.fn(),
}));

const mockCancelBooking = jest.mocked(cancelBooking);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useCancelBooking', () => {
  it('cancels the booking by id and returns it', async () => {
    const booking: Booking = {
      id: 'b1',
      bookingNumber: 'K7Q2MX',
      guestName: 'Maya Chen',
      guestEmail: 'maya.chen@example.com',
      guestPhone: '4155550349',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
      status: 'cancelled',
      createdAt: '2026-10-21T18:12:00.000Z',
      cancelledAt: '2026-10-25T10:00:00.000Z',
    };
    mockCancelBooking.mockResolvedValue(booking);
    const { result } = renderHook(() => useCancelBooking());

    await act(async () => {
      await result.current.run('b1');
    });

    expect(mockCancelBooking).toHaveBeenCalledWith('b1');
    expect(result.current.data).toEqual(booking);
  });
});
