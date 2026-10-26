import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingsTable from './BookingsTable';
import { activeBooking, cancelledBooking } from './testBookings';

afterEach(() => {
  jest.resetAllMocks();
});

describe('BookingsTable', () => {
  it('shows each booking’s guest, contact, dates and booking number', () => {
    render(<BookingsTable bookings={[activeBooking]} onCancel={jest.fn()} />);

    const row = screen.getByRole('row', { name: /Elena Rossi/ });
    expect(row).toHaveTextContent('elena.rossi@example.com');
    expect(row).toHaveTextContent('(212) 555-0142');
    expect(row).toHaveTextContent('28 Oct 2026');
    expect(row).toHaveTextContent('30 Oct 2026');
    expect(row).toHaveTextContent('K7Q2MX');
    expect(row).toHaveTextContent('Active');
  });

  it('shows cancelled bookings marked as cancelled with no cancel button', () => {
    render(
      <BookingsTable bookings={[cancelledBooking]} onCancel={jest.fn()} />,
    );

    const row = screen.getByRole('row', { name: /Maya Chen/ });
    expect(row).toHaveTextContent('Cancelled');
    expect(
      within(row).queryByRole('button', { name: /Cancel booking/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the bookings in the order given', () => {
    render(
      <BookingsTable
        bookings={[activeBooking, cancelledBooking]}
        onCancel={jest.fn()}
      />,
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Elena Rossi');
    expect(rows[1]).toHaveTextContent('Maya Chen');
  });

  it('asks to cancel the booking whose button is clicked', async () => {
    const onCancel = jest.fn();
    render(
      <BookingsTable
        bookings={[activeBooking, cancelledBooking]}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel booking K7Q2MX' }),
    );

    expect(onCancel).toHaveBeenCalledWith(activeBooking);
  });

  it('shows No bookings when there are none', () => {
    render(<BookingsTable bookings={[]} onCancel={jest.fn()} />);

    expect(screen.getByText('No bookings')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
