import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextInput from './TextInput';

describe('TextInput', () => {
  it('can be typed into through its label', async () => {
    render(<TextInput label="Name" />);

    await userEvent.type(screen.getByLabelText('Name'), 'Sam');

    expect(screen.getByLabelText('Name')).toHaveValue('Sam');
  });

  it('shows its errors under the field and marks it invalid', () => {
    render(<TextInput label="Email" errors={['email must be an email']} />);

    const input = screen.getByLabelText('Email');
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('email must be an email');
  });
});
