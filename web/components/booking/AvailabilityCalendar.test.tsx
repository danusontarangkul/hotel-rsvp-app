import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EMPTY_SELECTION } from '@/lib/dates';
import AvailabilityCalendar from './AvailabilityCalendar';

const availability = {
  firstBookableDate: '2026-10-26',
  bookedNights: ['2026-11-03', '2026-11-04'],
};

function day(name: string) {
  return screen.getByRole('button', { name: new RegExp(`^${name}`) });
}

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 25, 12));
});

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

describe('AvailabilityCalendar', () => {
  it('shows this month and next month', () => {
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={EMPTY_SELECTION}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('October 2026')).toBeInTheDocument();
    expect(screen.getByText('November 2026')).toBeInTheDocument();
  });

  it('blocks today and past dates', () => {
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={EMPTY_SELECTION}
        onSelect={jest.fn()}
      />,
    );

    expect(day('Today, Sunday, October 25th, 2026')).toBeDisabled();
    expect(day('Saturday, October 24th, 2026')).toBeDisabled();
  });

  it('blocks booked nights as a check-in', () => {
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={EMPTY_SELECTION}
        onSelect={jest.fn()}
      />,
    );

    expect(day('Tuesday, November 3rd, 2026')).toBeDisabled();
  });

  it('picks an open date', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={EMPTY_SELECTION}
        onSelect={onSelect}
      />,
    );

    await user.click(day('Monday, October 26th, 2026'));

    expect(onSelect).toHaveBeenCalledWith('2026-10-26');
  });

  it('allows checking out on a booked night when the stay ends there', () => {
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={{ checkIn: '2026-11-01', checkOut: null }}
        onSelect={jest.fn()}
      />,
    );

    expect(day('Tuesday, November 3rd, 2026')).toBeEnabled();
    expect(day('Wednesday, November 4th, 2026')).toBeDisabled();
  });

  it('marks the check-in and check-out as pressed', () => {
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={{ checkIn: '2026-11-08', checkOut: '2026-11-11' }}
        onSelect={jest.fn()}
      />,
    );

    expect(day('Sunday, November 8th, 2026')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(day('Wednesday, November 11th, 2026')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(day('Monday, November 9th, 2026')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows the legend', () => {
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={EMPTY_SELECTION}
        onSelect={jest.fn()}
      />,
    );

    for (const label of ['Available', 'Unavailable', 'Selected']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('does not show a separate booked state in the legend', () => {
    render(
      <AvailabilityCalendar
        availability={availability}
        selection={EMPTY_SELECTION}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.queryByText('Booked')).not.toBeInTheDocument();
  });
});
