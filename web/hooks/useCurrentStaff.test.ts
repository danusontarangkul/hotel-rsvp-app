import { renderHook, waitFor } from '@testing-library/react';
import { getCurrentStaff } from '@/lib/api';
import { useCurrentStaff } from './useCurrentStaff';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getCurrentStaff: jest.fn(),
}));

const mockGetCurrentStaff = jest.mocked(getCurrentStaff);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useCurrentStaff', () => {
  it('loads the logged-in staff member', async () => {
    const staff = { id: '1', name: 'Sam Lee', email: 'sam@hotel.com' };
    mockGetCurrentStaff.mockResolvedValue(staff);
    const { result } = renderHook(() => useCurrentStaff());

    await waitFor(() => expect(result.current.data).toEqual(staff));
  });

  it('gives null when nobody is logged in', async () => {
    mockGetCurrentStaff.mockResolvedValue(null);
    const { result } = renderHook(() => useCurrentStaff());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });
});
