import {
  canCheckIn,
  canCheckOut,
  canSelectDate,
  EMPTY_SELECTION,
  formatDisplayDate,
  isBooked,
  isUnavailable,
  nightsBetween,
  selectDate,
  stayIncludesBookedNight,
  toDateString,
} from './dates';

const availability = {
  firstBookableDate: '2026-10-26',
  bookedNights: ['2026-11-03', '2026-11-04', '2026-11-05'],
};

describe('toDateString', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 10, 8))).toBe('2026-11-08');
  });
});

describe('formatDisplayDate', () => {
  it('formats a date for display', () => {
    expect(formatDisplayDate('2026-11-08')).toBe('8 Nov 2026');
  });
});

describe('nightsBetween', () => {
  it('lists each night from check-in up to the night before check-out', () => {
    expect(nightsBetween('2026-11-08', '2026-11-11')).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
    ]);
  });

  it('crosses a month boundary', () => {
    expect(nightsBetween('2026-10-31', '2026-11-02')).toEqual([
      '2026-10-31',
      '2026-11-01',
    ]);
  });
});

describe('isUnavailable', () => {
  it('blocks today', () => {
    expect(isUnavailable('2026-10-25', availability)).toBe(true);
  });

  it('blocks a past date', () => {
    expect(isUnavailable('2026-10-01', availability)).toBe(true);
  });

  it('allows tomorrow', () => {
    expect(isUnavailable('2026-10-26', availability)).toBe(false);
  });
});

describe('isBooked', () => {
  it('blocks a booked night', () => {
    expect(isBooked('2026-11-04', availability)).toBe(true);
  });

  it('allows a night that is not booked', () => {
    expect(isBooked('2026-11-06', availability)).toBe(false);
  });
});

describe('canCheckIn', () => {
  it('does not allow checking in today', () => {
    expect(canCheckIn('2026-10-25', availability)).toBe(false);
  });

  it('does not allow checking in on a booked night', () => {
    expect(canCheckIn('2026-11-03', availability)).toBe(false);
  });

  it('allows checking in on the previous guest’s check-out day', () => {
    expect(canCheckIn('2026-11-06', availability)).toBe(true);
  });
});

describe('canCheckOut', () => {
  it('requires check-out to be after check-in', () => {
    expect(canCheckOut('2026-11-08', '2026-11-08', availability)).toBe(false);
    expect(canCheckOut('2026-11-08', '2026-11-07', availability)).toBe(false);
  });

  it('allows checking out on the next guest’s check-in day', () => {
    expect(canCheckOut('2026-11-01', '2026-11-03', availability)).toBe(true);
  });

  it('does not allow a stay that includes a booked night', () => {
    expect(canCheckOut('2026-11-01', '2026-11-04', availability)).toBe(false);
  });
});

describe('stayIncludesBookedNight', () => {
  it('is true when a booked night is inside the stay', () => {
    expect(
      stayIncludesBookedNight('2026-11-01', '2026-11-08', availability),
    ).toBe(true);
  });

  it('is false when the stay ends on a booked night', () => {
    expect(
      stayIncludesBookedNight('2026-11-01', '2026-11-03', availability),
    ).toBe(false);
  });
});

describe('selectDate', () => {
  it('picks the check-in first', () => {
    expect(selectDate(EMPTY_SELECTION, '2026-11-08', availability)).toEqual({
      checkIn: '2026-11-08',
      checkOut: null,
    });
  });

  it('picks the check-out next', () => {
    const selection = { checkIn: '2026-11-08', checkOut: null };

    expect(selectDate(selection, '2026-11-11', availability)).toEqual({
      checkIn: '2026-11-08',
      checkOut: '2026-11-11',
    });
  });

  it('starts again from a date before the check-in', () => {
    const selection = { checkIn: '2026-11-08', checkOut: null };

    expect(selectDate(selection, '2026-10-28', availability)).toEqual({
      checkIn: '2026-10-28',
      checkOut: null,
    });
  });

  it('starts again after a full stay is picked', () => {
    const selection = { checkIn: '2026-11-08', checkOut: '2026-11-11' };

    expect(selectDate(selection, '2026-11-20', availability)).toEqual({
      checkIn: '2026-11-20',
      checkOut: null,
    });
  });

  it('ignores a date that cannot be picked', () => {
    expect(selectDate(EMPTY_SELECTION, '2026-11-04', availability)).toBe(
      EMPTY_SELECTION,
    );
  });
});

describe('canSelectDate', () => {
  it('does not allow a booked night as check-in', () => {
    expect(canSelectDate(EMPTY_SELECTION, '2026-11-03', availability)).toBe(
      false,
    );
  });

  it('allows a booked night as check-out when the stay ends there', () => {
    const selection = { checkIn: '2026-11-01', checkOut: null };

    expect(canSelectDate(selection, '2026-11-03', availability)).toBe(true);
  });
});
