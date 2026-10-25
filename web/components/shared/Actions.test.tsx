import { render, screen } from '@testing-library/react';
import Actions from './Actions';

describe('Actions', () => {
  it('shows its buttons', () => {
    render(
      <Actions>
        <button type="button">Keep booking</button>
        <button type="button">Cancel booking</button>
      </Actions>,
    );

    expect(
      screen.getByRole('button', { name: 'Keep booking' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel booking' }),
    ).toBeInTheDocument();
  });
});
