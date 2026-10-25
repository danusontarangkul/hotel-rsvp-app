import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, logout } from '@/lib/api';
import LogoutButton from './LogoutButton';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  logout: jest.fn(),
}));

const mockLogout = jest.mocked(logout);

afterEach(() => {
  jest.resetAllMocks();
});

describe('LogoutButton', () => {
  it('logs out and goes to the log in page', async () => {
    mockLogout.mockResolvedValue(undefined);
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/staff/login');
  });

  it('still goes to the log in page when the request fails', async () => {
    mockLogout.mockRejectedValue(new ApiError(500, ['Server down']));
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(push).toHaveBeenCalledWith('/staff/login');
  });

  it('shows a disabled loading button while logging out', async () => {
    mockLogout.mockReturnValue(new Promise(() => {}));
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(screen.getByRole('button', { name: 'Log out' })).toBeDisabled();
  });
});
