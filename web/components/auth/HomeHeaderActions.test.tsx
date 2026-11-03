import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logout } from '@/lib/api';
import HomeHeaderActions from './HomeHeaderActions';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  logout: jest.fn(),
}));

const mockLogout = jest.mocked(logout);

afterEach(() => {
  jest.resetAllMocks();
});

describe('HomeHeaderActions', () => {
  it('shows a skeleton while loading', () => {
    render(
      <HomeHeaderActions loading isStaff={false} onLoggedOut={jest.fn()} />,
    );

    expect(
      screen.getByRole('status', { name: 'Checking staff log in' }),
    ).toBeInTheDocument();
  });

  it('shows the log out button for staff', () => {
    render(
      <HomeHeaderActions loading={false} isStaff onLoggedOut={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('calls onLoggedOut after logging out', async () => {
    mockLogout.mockResolvedValue(undefined);
    const onLoggedOut = jest.fn();
    render(
      <HomeHeaderActions loading={false} isStaff onLoggedOut={onLoggedOut} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(onLoggedOut).toHaveBeenCalledTimes(1);
  });

  it('shows the staff log in link when not staff', () => {
    render(
      <HomeHeaderActions
        loading={false}
        isStaff={false}
        onLoggedOut={jest.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Staff log in' })).toHaveAttribute(
      'href',
      '/staff/login',
    );
  });
});
