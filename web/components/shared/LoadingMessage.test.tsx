import { render, screen } from '@testing-library/react';
import LoadingMessage from './LoadingMessage';

describe('LoadingMessage', () => {
  it('announces its message as a status', () => {
    render(<LoadingMessage>Loading available dates…</LoadingMessage>);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading available dates…',
    );
  });
});
