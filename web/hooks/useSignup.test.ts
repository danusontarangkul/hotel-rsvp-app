import { act, renderHook } from '@testing-library/react';
import { signup } from '@/lib/api';
import { useSignup } from './useSignup';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  signup: jest.fn(),
}));

const mockSignup = jest.mocked(signup);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useSignup', () => {
  it('signs up with the given details and returns the staff member', async () => {
    const staff = { id: '1', name: 'Sam Lee', email: 'sam@hotel.com' };
    const input = {
      name: 'Sam Lee',
      email: 'sam@hotel.com',
      password: 'at-least-8',
    };
    mockSignup.mockResolvedValue(staff);
    const { result } = renderHook(() => useSignup());

    await act(async () => {
      await result.current.run(input);
    });

    expect(mockSignup).toHaveBeenCalledWith(input);
    expect(result.current.data).toEqual(staff);
  });
});
