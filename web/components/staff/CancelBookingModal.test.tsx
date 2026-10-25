import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/api';
import CancelBookingModal from './CancelBookingModal';
import { activeBooking } from './testBookings';

afterEach(() => {
  jest.resetAllMocks();
});

describe('CancelBookingModal', () => {
  it('asks to confirm with the guest, booking number and dates', () => {
    render(
      <CancelBookingModal
        booking={{
          ...activeBooking,
          checkIn: '2026-11-08',
          checkOut: '2026-11-11',
        }}
        loading={false}
        error={null}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Cancel this booking?' });
    expect(dialog).toHaveTextContent('Elena Rossi');
    expect(dialog).toHaveTextContent('K7Q2MX');
    expect(dialog).toHaveTextContent('8–11 November 2026');
  });

  it('confirms with Cancel booking', async () => {
    const onConfirm = jest.fn();
    render(
      <CancelBookingModal
        booking={activeBooking}
        loading={false}
        error={null}
        onConfirm={onConfirm}
        onClose={jest.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel booking' }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes with Keep booking', async () => {
    const onClose = jest.fn();
    render(
      <CancelBookingModal
        booking={activeBooking}
        loading={false}
        error={null}
        onConfirm={jest.fn()}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Keep booking' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons and closing while cancelling', async () => {
    const onClose = jest.fn();
    render(
      <CancelBookingModal
        booking={activeBooking}
        loading
        error={null}
        onConfirm={jest.fn()}
        onClose={onClose}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Cancel booking' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Keep booking' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows the API message when cancelling fails', () => {
    render(
      <CancelBookingModal
        booking={activeBooking}
        loading={false}
        error={new ApiError(409, ['Booking is already cancelled'])}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(
      screen.getByText('Booking is already cancelled'),
    ).toBeInTheDocument();
  });
});
