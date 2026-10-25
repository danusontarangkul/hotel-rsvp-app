import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('shows its message', () => {
    render(<EmptyState>No bookings</EmptyState>);

    expect(screen.getByText('No bookings')).toBeInTheDocument();
  });
});
