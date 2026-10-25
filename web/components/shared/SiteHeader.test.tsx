import { render, screen } from '@testing-library/react';
import SiteHeader from './SiteHeader';

describe('SiteHeader', () => {
  it('links the hotel name to the home page', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('link', { name: 'Hotel RSVP' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('links to the staff log in page', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('link', { name: 'Staff log in' })).toHaveAttribute(
      'href',
      '/staff/login',
    );
  });
});
