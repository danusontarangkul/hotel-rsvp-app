import { act, renderHook } from '@testing-library/react';
import { findBookingByNumber } from '@/lib/api';
import { useFindBooking } from './useFindBooking';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  findBookingByNumber: jest.fn(),
}));

const mockFindBookingByNumber = jest.mocked(findBookingByNumber);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useFindBooking', () => {
  it('looks the booking up by its number', async () => {
    mockFindBookingByNumber.mockResolvedValue({ booking: null });
    const { result } = renderHook(() => useFindBooking());

    await act(async () => {
      await result.current.run('K7Q2MX');
    });

    expect(mockFindBookingByNumber).toHaveBeenCalledWith('K7Q2MX');
    expect(result.current.data).toEqual({ booking: null });
  });
});
