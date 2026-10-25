import { act, renderHook } from '@testing-library/react';
import { logout } from '@/lib/api';
import { useLogout } from './useLogout';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  logout: jest.fn(),
}));

const mockLogout = jest.mocked(logout);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useLogout', () => {
  it('logs out', async () => {
    mockLogout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.run();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
