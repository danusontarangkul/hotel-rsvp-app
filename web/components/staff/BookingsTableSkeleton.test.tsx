import { render, screen } from '@testing-library/react';
import BookingsTableSkeleton from './BookingsTableSkeleton';
import { BOOKING_COLUMNS } from './bookingColumns';

describe('BookingsTableSkeleton', () => {
  it('announces that the bookings are loading', () => {
    render(<BookingsTableSkeleton />);

    expect(
      screen.getByRole('status', { name: 'Loading bookings' }),
    ).toHaveAttribute('aria-busy', 'true');
  });

  it('uses the same columns as the bookings table', () => {
    render(<BookingsTableSkeleton />);

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual(BOOKING_COLUMNS);
  });
});
