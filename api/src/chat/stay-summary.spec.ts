import {
  CHECK_IN_TOO_EARLY,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
} from '../bookings/bookings.constants';
import {
  STAY_CHECK_OUT_NOT_AFTER_CHECK_IN,
  STAY_NIGHTS_BOOKED,
} from './chat.constants';
import { staySummary } from './stay-summary';

const FIRST_BOOKABLE_DATE = '2026-11-02';

function dates(checkIn: string, checkOut: string) {
  return { checkIn, checkOut, firstBookableDate: FIRST_BOOKABLE_DATE };
}

describe('staySummary', () => {
  it('says a stay is available, with full dates', () => {
    expect(
      staySummary({ available: true }, dates('2026-11-12', '2026-11-14')),
    ).toBe(
      'Thursday, November 12, 2026 to Saturday, November 14, 2026 is available.',
    );
  });

  it('says one night is available', () => {
    expect(
      staySummary({ available: true }, dates('2026-11-24', '2026-11-25')),
    ).toBe('The night of Tuesday, November 24, 2026 is available.');
  });

  it('says one night is already booked', () => {
    expect(
      staySummary(
        {
          available: false,
          reason: STAY_NIGHTS_BOOKED,
          bookedNightsInStay: ['2026-11-20'],
        },
        dates('2026-11-20', '2026-11-21'),
      ),
    ).toBe('The night of Friday, November 20, 2026 is already booked.');
  });

  it('says which night makes a longer stay unavailable', () => {
    expect(
      staySummary(
        {
          available: false,
          reason: STAY_NIGHTS_BOOKED,
          bookedNightsInStay: ['2026-11-20'],
        },
        dates('2026-11-19', '2026-11-21'),
      ),
    ).toBe(
      'Thursday, November 19, 2026 to Saturday, November 21, 2026 is not available because the night of Friday, November 20, 2026 is already booked.',
    );
  });

  it('lists every booked night in a longer stay', () => {
    expect(
      staySummary(
        {
          available: false,
          reason: STAY_NIGHTS_BOOKED,
          bookedNightsInStay: ['2026-11-20', '2026-11-21'],
        },
        dates('2026-11-19', '2026-11-23'),
      ),
    ).toBe(
      'Thursday, November 19, 2026 to Monday, November 23, 2026 is not available because the nights of Friday, November 20, 2026 and Saturday, November 21, 2026 are already booked.',
    );
  });

  it('gives the earliest check-in for a stay that starts too soon', () => {
    expect(
      staySummary(
        { available: false, reason: CHECK_IN_TOO_EARLY },
        dates('2026-11-01', '2026-11-02'),
      ),
    ).toBe(
      "The night of Sunday, November 1, 2026 can't be booked. The earliest check-in is Monday, November 2, 2026.",
    );
  });

  it('says check-out has to be after check-in', () => {
    expect(
      staySummary(
        { available: false, reason: CHECK_OUT_NOT_AFTER_CHECK_IN },
        dates('2026-11-14', '2026-11-12'),
      ),
    ).toBe(STAY_CHECK_OUT_NOT_AFTER_CHECK_IN);
  });
});
