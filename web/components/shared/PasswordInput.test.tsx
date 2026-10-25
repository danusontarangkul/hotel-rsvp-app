import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from './PasswordInput';

describe('PasswordInput', () => {
  it('hides the password by default', () => {
    render(<PasswordInput label="Password" />);

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });

  it('shows the password when the show button is clicked', async () => {
    render(<PasswordInput label="Password" />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Show password' }),
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('hides the password again when the hide button is clicked', async () => {
    render(<PasswordInput label="Password" />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Show password' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Hide password' }),
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });

  it('shows its errors under the field', () => {
    render(<PasswordInput label="Password" errors={['Too short']} />);

    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Too short',
    );
  });
});
