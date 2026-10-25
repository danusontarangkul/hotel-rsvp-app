import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, login } from '@/lib/api';
import LoginForm from './LoginForm';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  login: jest.fn(),
}));

const mockLogin = jest.mocked(login);

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Email address'), 'sam@hotel.com');
  await userEvent.type(screen.getByLabelText('Password'), 'at-least-8');
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('LoginForm', () => {
  it('logs in and goes to the bookings page', async () => {
    mockLogin.mockResolvedValue({
      id: '1',
      name: 'Sam Lee',
      email: 'sam@hotel.com',
    });
    render(<LoginForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'sam@hotel.com',
      password: 'at-least-8',
    });
    expect(push).toHaveBeenCalledWith('/staff/bookings');
  });

  it('keeps the submit button disabled until both fields are filled', async () => {
    render(<LoginForm />);
    const button = screen.getByRole('button', { name: 'Log in' });

    expect(button).toBeDisabled();
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'sam@hotel.com',
    );
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Password'), 'at-least-8');
    expect(button).toBeEnabled();
  });

  it('keeps the submit button disabled while the password is under 8 characters', async () => {
    render(<LoginForm />);
    const button = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(
      screen.getByLabelText('Email address'),
      'sam@hotel.com',
    );
    await userEvent.type(screen.getByLabelText('Password'), '1234567');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Password'), '8');
    expect(button).toBeEnabled();
  });

  it('keeps the submit button disabled while the email is not valid', async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email address'), 'sam@hotel');
    await userEvent.type(screen.getByLabelText('Password'), 'at-least-8');

    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
  });

  it('shows a disabled loading button while logging in', async () => {
    mockLogin.mockReturnValue(new Promise(() => {}));
    render(<LoginForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
  });

  it('shows the error message for a wrong email or password and keeps the form filled in', async () => {
    mockLogin.mockRejectedValue(new ApiError(401, ['Wrong email or password']));
    render(<LoginForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Wrong email or password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveValue('sam@hotel.com');
    expect(push).not.toHaveBeenCalled();
  });

  it('shows each validation message from a 400 under its field', async () => {
    mockLogin.mockRejectedValue(new ApiError(400, ['email must be an email']));
    render(<LoginForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'email must be an email',
    );
  });
});
