import { render, screen } from '@testing-library/react';
import BookingConfirmation from './BookingConfirmation';

describe('BookingConfirmation', () => {
  it('shows the booking number', () => {
    render(
      <BookingConfirmation
        booking={{
          bookingNumber: 'K7Q2MX',
          checkIn: '2026-11-08',
          checkOut: '2026-11-11',
        }}
      />,
    );

    expect(screen.getByText('K7Q2MX')).toBeInTheDocument();
  });

  it('shows the dates and number of nights', () => {
    render(
      <BookingConfirmation
        booking={{
          bookingNumber: 'K7Q2MX',
          checkIn: '2026-11-08',
          checkOut: '2026-11-11',
        }}
      />,
    );

    expect(
      screen.getByText('8 Nov 2026 – 11 Nov 2026 · 3 nights'),
    ).toBeInTheDocument();
  });

  it('says night for a one night stay', () => {
    render(
      <BookingConfirmation
        booking={{
          bookingNumber: 'K7Q2MX',
          checkIn: '2026-11-08',
          checkOut: '2026-11-09',
        }}
      />,
    );

    expect(
      screen.getByText('8 Nov 2026 – 9 Nov 2026 · 1 night'),
    ).toBeInTheDocument();
  });
});
