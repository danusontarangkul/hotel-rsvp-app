import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, createBooking, getAvailability } from '@/lib/api';
import BookingSection from './BookingSection';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getAvailability: jest.fn(),
  createBooking: jest.fn(),
}));

const mockGetAvailability = jest.mocked(getAvailability);
const mockCreateBooking = jest.mocked(createBooking);

const availability = {
  firstBookableDate: '2026-10-26',
  bookedNights: ['2026-11-03', '2026-11-04'],
};

type User = ReturnType<typeof userEvent.setup>;

function day(name: string) {
  return screen.getByRole('button', { name: new RegExp(`^${name}`) });
}

async function pickStayAndDetails(user: User) {
  await user.click(
    await screen.findByRole('button', { name: /^Sunday, November 8th, 2026/ }),
  );
  await user.click(day('Wednesday, November 11th, 2026'));
  await user.type(screen.getByLabelText('Full name'), 'Maya Chen');
  await user.type(screen.getByLabelText('Phone number'), '5551234567');
  await user.type(
    screen.getByLabelText('Email address'),
    'maya.chen@example.com',
  );
}

let user: User;

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 25, 12));
  user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
});

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

describe('BookingSection', () => {
  it('shows a loading message until the dates arrive', () => {
    mockGetAvailability.mockReturnValue(new Promise(() => {}));
    render(<BookingSection />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading available dates…',
    );
  });

  it('shows the error and tries again when loading the dates fails', async () => {
    mockGetAvailability
      .mockRejectedValueOnce(new ApiError(500, ['Server down']))
      .mockResolvedValue(availability);
    render(<BookingSection />);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('November 2026')).toBeInTheDocument();
  });

  it('fills in the stay as dates are picked', async () => {
    mockGetAvailability.mockResolvedValue(availability);
    render(<BookingSection />);

    await user.click(
      await screen.findByRole('button', {
        name: /^Sunday, November 8th, 2026/,
      }),
    );
    await user.click(day('Wednesday, November 11th, 2026'));

    expect(screen.getByLabelText('Check-in')).toHaveValue('8 Nov 2026');
    expect(screen.getByLabelText('Check-out')).toHaveValue('11 Nov 2026');
  });

  it('books the stay and shows the booking number', async () => {
    mockGetAvailability.mockResolvedValue(availability);
    mockCreateBooking.mockResolvedValue({
      bookingNumber: 'K7Q2MX',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    });
    render(<BookingSection />);

    await pickStayAndDetails(user);
    await user.click(screen.getByRole('button', { name: 'Book' }));

    expect(mockCreateBooking).toHaveBeenCalledWith({
      guestName: 'Maya Chen',
      guestPhone: '5551234567',
      guestEmail: 'maya.chen@example.com',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    });
    expect(
      await screen.findByRole('dialog', { name: 'Booking confirmed' }),
    ).toHaveTextContent('K7Q2MX');
  });

  it('clears the dates and guest details as soon as the booking succeeds', async () => {
    mockGetAvailability.mockResolvedValue(availability);
    mockCreateBooking.mockResolvedValue({
      bookingNumber: 'K7Q2MX',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    });
    render(<BookingSection />);

    await pickStayAndDetails(user);
    await user.click(screen.getByRole('button', { name: 'Book' }));

    expect(
      await screen.findByRole('dialog', { name: 'Booking confirmed' }),
    ).toHaveTextContent('K7Q2MX');
    expect(screen.getByLabelText('Check-in')).toHaveValue('');
    expect(screen.getByLabelText('Check-out')).toHaveValue('');
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();
  });

  it('reloads the dates after closing the confirmation', async () => {
    mockGetAvailability.mockResolvedValue(availability);
    mockCreateBooking.mockResolvedValue({
      bookingNumber: 'K7Q2MX',
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    });
    render(<BookingSection />);

    await pickStayAndDetails(user);
    await user.click(screen.getByRole('button', { name: 'Book' }));
    await user.click(await screen.findByRole('button', { name: 'Done' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Check-in')).toHaveValue('');
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(2));
  });

  it('shows that the dates are no longer available and keeps the details', async () => {
    mockGetAvailability.mockResolvedValue(availability);
    mockCreateBooking.mockRejectedValue(
      new ApiError(409, ['Those dates are no longer available']),
    );
    render(<BookingSection />);

    await pickStayAndDetails(user);
    await user.click(screen.getByRole('button', { name: 'Book' }));

    expect(
      await screen.findByRole('dialog', { name: 'Dates no longer available' }),
    ).toHaveTextContent('Those dates are no longer available');

    await user.click(screen.getByRole('button', { name: 'Choose new dates' }));

    expect(screen.getByLabelText('Check-in')).toHaveValue('');
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(2));
    await user.click(day('Sunday, November 8th, 2026'));
    await user.click(day('Wednesday, November 11th, 2026'));
    expect(screen.getByLabelText('Full name')).toHaveValue('Maya Chen');
  });
});
