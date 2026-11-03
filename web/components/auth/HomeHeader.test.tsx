import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, getCurrentStaff, logout } from '@/lib/api';
import HomeHeader from './HomeHeader';

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

const STAFF = { id: '1', name: 'Sam Lee', email: 'sam@hotel.com' };

afterEach(() => {
  jest.resetAllMocks();
});

describe('HomeHeader', () => {
  it('shows a skeleton while checking who is logged in', () => {
    mockGetCurrentStaff.mockReturnValue(new Promise(() => {}));
    render(<HomeHeader />);

    expect(
      screen.getByRole('status', { name: 'Checking staff log in' }),
    ).toBeInTheDocument();
  });

  it('shows no Bookings link while checking who is logged in', () => {
    mockGetCurrentStaff.mockReturnValue(new Promise(() => {}));
    render(<HomeHeader />);

    expect(
      screen.queryByRole('link', { name: 'Bookings' }),
    ).not.toBeInTheDocument();
  });

  it('shows a Bookings link to the staff bookings page when staff are logged in', async () => {
    mockGetCurrentStaff.mockResolvedValue(STAFF);
    render(<HomeHeader />);

    const link = await screen.findByRole('link', { name: 'Bookings' });
    expect(link).toHaveAttribute('href', '/staff/bookings');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('shows the log out button when staff are logged in', async () => {
    mockGetCurrentStaff.mockResolvedValue(STAFF);
    render(<HomeHeader />);

    expect(
      await screen.findByRole('button', { name: 'Log out' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Staff log in' }),
    ).not.toBeInTheDocument();
  });

  it('hides the Bookings link and shows the staff log in link after logging out', async () => {
    mockGetCurrentStaff
      .mockResolvedValueOnce(STAFF)
      .mockResolvedValueOnce(null);
    mockLogout.mockResolvedValue(undefined);
    render(<HomeHeader />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Log out' }),
    );

    expect(
      await screen.findByRole('link', { name: 'Staff log in' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Bookings' }),
    ).not.toBeInTheDocument();
  });

  it('shows the staff log in link and no Bookings link when nobody is logged in', async () => {
    mockGetCurrentStaff.mockResolvedValue(null);
    render(<HomeHeader />);

    expect(
      await screen.findByRole('link', { name: 'Staff log in' }),
    ).toHaveAttribute('href', '/staff/login');
    expect(
      screen.queryByRole('link', { name: 'Bookings' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument();
  });

  it('shows the staff log in link and no Bookings link when the check fails', async () => {
    mockGetCurrentStaff.mockRejectedValue(new ApiError(500, ['Server down']));
    render(<HomeHeader />);

    expect(
      await screen.findByRole('link', { name: 'Staff log in' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Bookings' }),
    ).not.toBeInTheDocument();
  });
});
