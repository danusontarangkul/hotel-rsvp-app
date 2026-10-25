import { render, screen } from '@testing-library/react';
import TextLink from './TextLink';

describe('TextLink', () => {
  it('links to its href', () => {
    render(<TextLink href="/staff/login">Log in</TextLink>);

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/staff/login',
    );
  });
});
