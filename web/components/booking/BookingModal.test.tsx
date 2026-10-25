import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingModal from './BookingModal';

const booking = {
  bookingNumber: 'K7Q2MX',
  checkIn: '2026-11-08',
  checkOut: '2026-11-11',
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('BookingModal', () => {
  it('shows the confirmation with the booking number', () => {
    render(
      <BookingModal
        result={{ status: 'confirmed', booking }}
        onClose={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: 'Booking confirmed' }),
    ).toHaveTextContent('K7Q2MX');
  });

  it('closes the confirmation with Done', async () => {
    const onClose = jest.fn();
    render(
      <BookingModal
        result={{ status: 'confirmed', booking }}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the API message when the dates are no longer available', () => {
    render(
      <BookingModal
        result={{
          status: 'unavailable',
          messages: ['Those dates are no longer available'],
        }}
        onClose={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: 'Dates no longer available' }),
    ).toHaveTextContent('Those dates are no longer available');
  });

  it('closes the unavailable message with Choose new dates', async () => {
    const onClose = jest.fn();
    render(
      <BookingModal
        result={{ status: 'unavailable', messages: ['Taken'] }}
        onClose={onClose}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose new dates' }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
