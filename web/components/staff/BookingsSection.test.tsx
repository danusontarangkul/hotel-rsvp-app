import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, cancelBooking, getBookings } from '@/lib/api';
import BookingsSection from './BookingsSection';
import { activeBooking, cancelledBooking } from './testBookings';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getBookings: jest.fn(),
  cancelBooking: jest.fn(),
}));

const mockGetBookings = jest.mocked(getBookings);
const mockCancelBooking = jest.mocked(cancelBooking);

afterEach(() => {
  jest.resetAllMocks();
});

describe('BookingsSection', () => {
  it('shows a loading skeleton until the bookings arrive', () => {
    mockGetBookings.mockReturnValue(new Promise(() => {}));
    render(<BookingsSection />);

    expect(
      screen.getByRole('status', { name: 'Loading bookings' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Elena Rossi')).not.toBeInTheDocument();
  });

  it('shows the bookings', async () => {
    mockGetBookings.mockResolvedValue([activeBooking, cancelledBooking]);
    render(<BookingsSection />);

    expect(
      await screen.findByRole('row', { name: /Elena Rossi/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Maya Chen/ })).toBeInTheDocument();
  });

  it('shows No bookings when there are none', async () => {
    mockGetBookings.mockResolvedValue([]);
    render(<BookingsSection />);

    expect(await screen.findByText('No bookings')).toBeInTheDocument();
  });

  it('shows the error and tries again when loading fails', async () => {
    mockGetBookings
      .mockRejectedValueOnce(new ApiError(500, ['Server down']))
      .mockResolvedValue([activeBooking]);
    render(<BookingsSection />);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('row', { name: /Elena Rossi/ }),
    ).toBeInTheDocument();
  });

  it('goes to the log in page when not logged in', async () => {
    mockGetBookings.mockRejectedValue(new ApiError(401, ['Unauthorized']));
    render(<BookingsSection />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/staff/login'));
  });

  it('cancels a booking after confirming and shows it as cancelled', async () => {
    mockGetBookings
      .mockResolvedValueOnce([activeBooking])
      .mockResolvedValue([{ ...activeBooking, status: 'cancelled' }]);
    mockCancelBooking.mockResolvedValue({
      ...activeBooking,
      status: 'cancelled',
    });
    render(<BookingsSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel booking K7Q2MX' }),
    );
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancel booking',
      }),
    );

    expect(mockCancelBooking).toHaveBeenCalledWith('b1');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByText('Cancelled', { selector: 'span' }),
    ).toBeInTheDocument();
  });

  it('keeps the booking when Keep booking is clicked', async () => {
    mockGetBookings.mockResolvedValue([activeBooking]);
    render(<BookingsSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel booking K7Q2MX' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Keep booking' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockCancelBooking).not.toHaveBeenCalled();
  });

  it('shows the error in the modal when cancelling fails', async () => {
    mockGetBookings.mockResolvedValue([activeBooking]);
    mockCancelBooking.mockRejectedValue(
      new ApiError(409, ['Booking is already cancelled.']),
    );
    render(<BookingsSection />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel booking K7Q2MX' }),
    );
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancel booking',
      }),
    );

    expect(
      await within(screen.getByRole('dialog')).findByText(
        'Booking is already cancelled.',
      ),
    ).toBeInTheDocument();
  });
});
