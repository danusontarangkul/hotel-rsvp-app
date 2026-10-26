import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDay, type Modifiers } from 'react-day-picker';
import StayDayButton from './StayDayButton';

const november8 = new CalendarDay(new Date(2026, 10, 8), new Date(2026, 10, 1));

function renderDay(modifiers: Modifiers, onClick = jest.fn()) {
  render(
    <StayDayButton day={november8} modifiers={modifiers} onClick={onClick}>
      8
    </StayDayButton>,
  );
  return screen.getByRole('button', { name: '8' });
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('StayDayButton', () => {
  it('can be clicked', async () => {
    const onClick = jest.fn();
    const button = renderDay({}, onClick);

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is pressed when it is the check-in', () => {
    expect(renderDay({ stayStart: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('is pressed when it is the check-out', () => {
    expect(renderDay({ stayEnd: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('is not pressed inside the stay', () => {
    expect(renderDay({ inStay: true })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('takes focus when the calendar focuses its day', () => {
    expect(renderDay({ focused: true })).toHaveFocus();
  });
});
