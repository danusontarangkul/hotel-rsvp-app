import { renderHook, waitFor } from '@testing-library/react';
import { getBookings } from '@/lib/api';
import { useBookings } from './useBookings';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getBookings: jest.fn(),
}));

const mockGetBookings = jest.mocked(getBookings);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useBookings', () => {
  it('loads the bookings', async () => {
    mockGetBookings.mockResolvedValue([]);
    const { result } = renderHook(() => useBookings());

    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
