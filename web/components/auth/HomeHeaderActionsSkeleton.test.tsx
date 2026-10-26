import { render, screen } from '@testing-library/react';
import HomeHeaderActionsSkeleton from './HomeHeaderActionsSkeleton';

describe('HomeHeaderActionsSkeleton', () => {
  it('tells screen readers the log in check is loading', () => {
    render(<HomeHeaderActionsSkeleton />);

    expect(
      screen.getByRole('status', { name: 'Checking staff log in' }),
    ).toHaveAttribute('aria-busy', 'true');
  });
});
