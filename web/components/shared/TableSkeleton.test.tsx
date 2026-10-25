import { render, screen } from '@testing-library/react';
import TableSkeleton from './TableSkeleton';

describe('TableSkeleton', () => {
  it('announces that it is loading', () => {
    render(<TableSkeleton label="Loading bookings" columns={['Guest']} />);

    expect(
      screen.getByRole('status', { name: 'Loading bookings' }),
    ).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the real column headers', () => {
    render(
      <TableSkeleton label="Loading bookings" columns={['Guest', 'Status']} />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Guest' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument();
  });

  it('shows five placeholder rows by default', () => {
    render(<TableSkeleton label="Loading bookings" columns={['Guest']} />);

    expect(screen.getAllByRole('row')).toHaveLength(6);
  });

  it('shows the number of rows asked for', () => {
    render(
      <TableSkeleton label="Loading bookings" columns={['Guest']} rows={2} />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});
