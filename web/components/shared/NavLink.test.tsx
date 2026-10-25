import { render, screen } from '@testing-library/react';
import NavLink from './NavLink';

describe('NavLink', () => {
  it('links to its href', () => {
    render(<NavLink href="/staff/bookings">Bookings</NavLink>);

    expect(screen.getByRole('link', { name: 'Bookings' })).toHaveAttribute(
      'href',
      '/staff/bookings',
    );
  });

  it('marks the current page', () => {
    render(
      <NavLink href="/staff/bookings" active>
        Bookings
      </NavLink>,
    );

    expect(screen.getByRole('link', { name: 'Bookings' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('is not marked as current by default', () => {
    render(<NavLink href="/staff/bookings">Bookings</NavLink>);

    expect(screen.getByRole('link', { name: 'Bookings' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
