import { render, screen } from '@testing-library/react';
import CalendarLegend from './CalendarLegend';

describe('CalendarLegend', () => {
  it('explains each kind of day', () => {
    render(<CalendarLegend />);

    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['Available', 'Unavailable', 'Selected']);
  });
});
