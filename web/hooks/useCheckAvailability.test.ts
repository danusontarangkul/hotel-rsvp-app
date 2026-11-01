import { act, renderHook } from '@testing-library/react';
import { getAvailability } from '@/lib/api';
import { useCheckAvailability } from './useCheckAvailability';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getAvailability: jest.fn(),
}));

const mockGetAvailability = jest.mocked(getAvailability);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useCheckAvailability', () => {
  it('does not load until asked', () => {
    renderHook(() => useCheckAvailability());

    expect(mockGetAvailability).not.toHaveBeenCalled();
  });

  it('loads the availability when run', async () => {
    const availability = {
      firstBookableDate: '2026-11-02',
      bookedNights: ['2026-11-20'],
    };
    mockGetAvailability.mockResolvedValue(availability);
    const { result } = renderHook(() => useCheckAvailability());

    let loaded: unknown = null;
    await act(async () => {
      loaded = await result.current.run(undefined);
    });

    expect(loaded).toEqual(availability);
  });
});
