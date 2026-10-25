import { act, renderHook } from '@testing-library/react';
import { login } from '@/lib/api';
import { useLogin } from './useLogin';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  login: jest.fn(),
}));

const mockLogin = jest.mocked(login);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useLogin', () => {
  it('logs in with the given details and returns the staff member', async () => {
    const staff = { id: '1', name: 'Sam Lee', email: 'sam@hotel.com' };
    const input = { email: 'sam@hotel.com', password: 'at-least-8' };
    mockLogin.mockResolvedValue(staff);
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.run(input);
    });

    expect(mockLogin).toHaveBeenCalledWith(input);
    expect(result.current.data).toEqual(staff);
  });
});
