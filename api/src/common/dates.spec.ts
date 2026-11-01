import {
  addDays,
  formatLongDate,
  isCalendarDate,
  nightsBetween,
  todayIn,
} from './dates';

describe('formatLongDate', () => {
  it('writes the weekday, month, day and year', () => {
    expect(formatLongDate('2026-11-20')).toBe('Friday, November 20, 2026');
  });

  it('keeps the same day whatever the server time zone', () => {
    expect(formatLongDate('2026-01-01')).toBe('Thursday, January 1, 2026');
  });
});

describe('isCalendarDate', () => {
  it('accepts a real date in YYYY-MM-DD form', () => {
    expect(isCalendarDate('2026-11-08')).toBe(true);
  });

  it('accepts Feb 29 in a leap year', () => {
    expect(isCalendarDate('2028-02-29')).toBe(true);
  });

  it('rejects a date that does not exist', () => {
    expect(isCalendarDate('2026-02-30')).toBe(false);
  });

  it('rejects another format', () => {
    expect(isCalendarDate('Nov 8 2026')).toBe(false);
  });

  it('rejects a date with a time', () => {
    expect(isCalendarDate('2026-11-08T10:00')).toBe(false);
  });

  it('rejects values that are not strings', () => {
    expect(isCalendarDate(20261108)).toBe(false);
  });
});

describe('todayIn', () => {
  it('gives the date in the given time zone', () => {
    expect(
      todayIn('America/Los_Angeles', new Date('2026-10-25T19:00:00.000Z')),
    ).toBe('2026-10-25');
  });

  it('is still yesterday in Los Angeles when UTC has moved on to the next day', () => {
    expect(
      todayIn('America/Los_Angeles', new Date('2026-10-26T06:30:00.000Z')),
    ).toBe('2026-10-25');
  });

  it('rolls over at midnight in the given time zone', () => {
    expect(
      todayIn('America/Los_Angeles', new Date('2026-10-26T07:00:00.000Z')),
    ).toBe('2026-10-26');
  });
});

describe('addDays', () => {
  it('adds days within a month', () => {
    expect(addDays('2026-11-08', 3)).toBe('2026-11-11');
  });

  it('crosses a month and a year', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('is not thrown off by a daylight saving change', () => {
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02');
    expect(addDays('2027-03-14', 1)).toBe('2027-03-15');
  });

  it('subtracts days with a negative number', () => {
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
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

  it('has one night for a one-night stay', () => {
    expect(nightsBetween('2026-11-08', '2026-11-09')).toEqual(['2026-11-08']);
  });

  it('has no nights when check-out is not after check-in', () => {
    expect(nightsBetween('2026-11-08', '2026-11-08')).toEqual([]);
  });
});
