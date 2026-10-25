import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, signup } from '@/lib/api';
import SignupForm from './SignupForm';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  signup: jest.fn(),
}));

const mockSignup = jest.mocked(signup);

async function fillForm(password = 'at-least-8') {
  await userEvent.type(screen.getByLabelText('Full name'), 'Sam Lee');
  await userEvent.type(screen.getByLabelText('Email address'), 'sam@hotel.com');
  await userEvent.type(screen.getByLabelText('Password'), password);
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('SignupForm', () => {
  it('signs up and goes to the bookings page', async () => {
    mockSignup.mockResolvedValue({
      id: '1',
      name: 'Sam Lee',
      email: 'sam@hotel.com',
    });
    render(<SignupForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(mockSignup).toHaveBeenCalledWith({
      name: 'Sam Lee',
      email: 'sam@hotel.com',
      password: 'at-least-8',
    });
    expect(push).toHaveBeenCalledWith('/staff/bookings');
  });

  it('keeps the submit button disabled until every field is filled', async () => {
    render(<SignupForm />);
    const button = screen.getByRole('button', { name: 'Sign up' });

    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Full name'), 'Sam Lee');
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'sam@hotel.com',
    );
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Password'), 'at-least-8');
    expect(button).toBeEnabled();
  });

  it('keeps the submit button disabled while the email is not valid', async () => {
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText('Full name'), 'Sam Lee');
    await userEvent.type(screen.getByLabelText('Email address'), 'sam@hotel');
    await userEvent.type(screen.getByLabelText('Password'), 'at-least-8');

    expect(screen.getByRole('button', { name: 'Sign up' })).toBeDisabled();
  });

  it('keeps the submit button disabled while the password is under 8 characters', async () => {
    render(<SignupForm />);
    const button = screen.getByRole('button', { name: 'Sign up' });

    await fillForm('1234567');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Password'), '8');
    expect(button).toBeEnabled();
  });

  it('shows a password length error after leaving a short password', async () => {
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText('Password'), '12345');
    await userEvent.tab();

    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Password must be at least 8 characters.',
    );
  });

  it('does not show the password length error while still typing', async () => {
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText('Password'), '12345');

    expect(
      screen.queryByText('Password must be at least 8 characters.'),
    ).not.toBeInTheDocument();
  });

  it('shows a disabled loading button while signing up', async () => {
    mockSignup.mockReturnValue(new Promise(() => {}));
    render(<SignupForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(screen.getByRole('button', { name: 'Sign up' })).toBeDisabled();
  });

  it('shows an error under the email when it is already registered', async () => {
    mockSignup.mockRejectedValue(
      new ApiError(409, ['Email is already registered.']),
    );
    render(<SignupForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'Email is already registered.',
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('shows each validation message from a 400', async () => {
    mockSignup.mockRejectedValue(
      new ApiError(400, [
        'email must be an email',
        'password must be longer than or equal to 8 characters',
      ]),
    );
    render(<SignupForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(screen.getByText('email must be an email')).toBeInTheDocument();
    expect(
      screen.getByText('password must be longer than or equal to 8 characters'),
    ).toBeInTheDocument();
  });

  it('shows the API message for other errors and keeps the form filled in', async () => {
    mockSignup.mockRejectedValue(new ApiError(500, ['Internal server error']));
    render(<SignupForm />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(screen.getByText('Internal server error')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveValue('Sam Lee');
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeEnabled();
  });
});
