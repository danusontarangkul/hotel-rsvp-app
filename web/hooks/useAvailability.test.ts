import { renderHook, waitFor } from '@testing-library/react';
import { getAvailability } from '@/lib/api';
import { useAvailability } from './useAvailability';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getAvailability: jest.fn(),
}));

const mockGetAvailability = jest.mocked(getAvailability);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useAvailability', () => {
  it('loads the availability', async () => {
    const availability = {
      firstBookableDate: '2026-10-26',
      bookedNights: ['2026-11-03'],
    };
    mockGetAvailability.mockResolvedValue(availability);
    const { result } = renderHook(() => useAvailability());

    await waitFor(() => expect(result.current.data).toEqual(availability));
  });
});
