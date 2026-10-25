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

  it('shows its navigation links', () => {
    render(<SiteHeader nav={<a href="/staff/bookings">Bookings</a>} />);

    expect(screen.getByRole('navigation')).toHaveTextContent('Bookings');
  });

  it('has no navigation when none is given', () => {
    render(<SiteHeader />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows its actions', () => {
    render(<SiteHeader actions={<button type="button">Log out</button>} />);

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });
});
