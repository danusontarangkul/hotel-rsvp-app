import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoadError from './LoadError';

afterEach(() => {
  jest.resetAllMocks();
});

describe('LoadError', () => {
  it('shows each error message', () => {
    render(
      <LoadError messages={['Server down', 'Try later']} onRetry={jest.fn()} />,
    );

    expect(screen.getByText('Server down')).toBeInTheDocument();
    expect(screen.getByText('Try later')).toBeInTheDocument();
  });

  it('tries again when Try again is clicked', async () => {
    const onRetry = jest.fn();
    render(<LoadError messages={['Server down']} onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
