import { render, screen } from '@testing-library/react';
import EmailInput from './EmailInput';

describe('EmailInput', () => {
  it('is an email field labelled Email address', () => {
    render(<EmailInput />);

    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('can use a different label', () => {
    render(<EmailInput label="Guest email" />);

    expect(screen.getByLabelText('Guest email')).toBeInTheDocument();
  });

  it('shows its errors under the field', () => {
    render(<EmailInput errors={['email must be an email']} />);

    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'email must be an email',
    );
  });
});
