import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('shows each message', () => {
    render(<ErrorMessage messages={['First problem', 'Second problem']} />);

    expect(screen.getByText('First problem')).toBeInTheDocument();
    expect(screen.getByText('Second problem')).toBeInTheDocument();
  });

  it('renders an empty slot when there are no messages', () => {
    render(<ErrorMessage />);

    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });
});
