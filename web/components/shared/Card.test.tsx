import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('shows its content', () => {
    render(<Card>Inside</Card>);

    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('shows its footer', () => {
    render(<Card footer="Below">Inside</Card>);

    expect(screen.getByText('Below')).toBeInTheDocument();
  });
});
