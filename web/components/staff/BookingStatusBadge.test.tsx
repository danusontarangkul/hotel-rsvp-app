import { render, screen } from '@testing-library/react';
import BookingStatusBadge from './BookingStatusBadge';

describe('BookingStatusBadge', () => {
  it('shows Active for an active booking', () => {
    render(<BookingStatusBadge status="active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Cancelled for a cancelled booking', () => {
    render(<BookingStatusBadge status="cancelled" />);

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});
