import { act, renderHook } from '@testing-library/react';
import { createBooking } from '@/lib/api';
import { useCreateBooking } from './useCreateBooking';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  createBooking: jest.fn(),
}));

const mockCreateBooking = jest.mocked(createBooking);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useCreateBooking', () => {
  it('books the stay and returns the confirmation', async () => {
    const input = {
      guestName: 'Maya Chen',
      guestEmail: 'maya.chen@example.com',
      guestPhone: '5551234567',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    };
    const confirmation = {
      bookingNumber: 'K7Q2MX',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    };
    mockCreateBooking.mockResolvedValue(confirmation);
    const { result } = renderHook(() => useCreateBooking());

    await act(async () => {
      await result.current.run(input);
    });

    expect(mockCreateBooking).toHaveBeenCalledWith(input);
    expect(result.current.data).toEqual(confirmation);
  });
});
