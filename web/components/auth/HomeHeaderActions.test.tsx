import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, getCurrentStaff, logout } from '@/lib/api';
import HomeHeaderActions from './HomeHeaderActions';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getCurrentStaff: jest.fn(),
  logout: jest.fn(),
}));

const mockGetCurrentStaff = jest.mocked(getCurrentStaff);
const mockLogout = jest.mocked(logout);

afterEach(() => {
  jest.resetAllMocks();
});

describe('HomeHeaderActions', () => {
  it('shows a skeleton while checking who is logged in', () => {
    mockGetCurrentStaff.mockReturnValue(new Promise(() => {}));
    render(<HomeHeaderActions />);

    expect(
      screen.getByRole('status', { name: 'Checking staff log in' }),
    ).toBeInTheDocument();
  });

  it('shows the log out button when staff are logged in', async () => {
    mockGetCurrentStaff.mockResolvedValue({
      id: '1',
      name: 'Sam Lee',
      email: 'sam@hotel.com',
    });
    render(<HomeHeaderActions />);

    expect(
      await screen.findByRole('button', { name: 'Log out' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Staff log in' }),
    ).not.toBeInTheDocument();
  });

  it('switches to the staff log in link after logging out', async () => {
    mockGetCurrentStaff
      .mockResolvedValueOnce({
        id: '1',
        name: 'Sam Lee',
        email: 'sam@hotel.com',
      })
      .mockResolvedValueOnce(null);
    mockLogout.mockResolvedValue(undefined);
    render(<HomeHeaderActions />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Log out' }),
    );

    expect(
      await screen.findByRole('link', { name: 'Staff log in' }),
    ).toBeInTheDocument();
  });

  it('shows the staff log in link when nobody is logged in', async () => {
    mockGetCurrentStaff.mockResolvedValue(null);
    render(<HomeHeaderActions />);

    expect(
      await screen.findByRole('link', { name: 'Staff log in' }),
    ).toHaveAttribute('href', '/staff/login');
    expect(
      screen.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument();
  });

  it('shows the staff log in link when the check fails', async () => {
    mockGetCurrentStaff.mockRejectedValue(new ApiError(500, ['Server down']));
    render(<HomeHeaderActions />);

    expect(
      await screen.findByRole('link', { name: 'Staff log in' }),
    ).toBeInTheDocument();
  });
});
