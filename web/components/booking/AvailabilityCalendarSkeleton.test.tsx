import { render, screen } from '@testing-library/react';
import AvailabilityCalendarSkeleton from './AvailabilityCalendarSkeleton';

describe('AvailabilityCalendarSkeleton', () => {
  it('announces that the dates are loading', () => {
    render(<AvailabilityCalendarSkeleton />);

    expect(
      screen.getByRole('status', { name: 'Loading available dates' }),
    ).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the legend but no days to click', () => {
    render(<AvailabilityCalendarSkeleton />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
