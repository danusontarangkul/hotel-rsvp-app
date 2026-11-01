import {
  CHECK_IN_TOO_EARLY,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
} from '../bookings/bookings.constants';
import type { AvailabilityResponse } from '../bookings/bookings.types';
import { STAY_NIGHTS_BOOKED } from './chat.constants';
import { checkStay } from './stay-check';

const availability: AvailabilityResponse = {
  firstBookableDate: '2026-11-02',
  bookedNights: ['2026-11-05', '2026-11-06'],
};

describe('checkStay', () => {
  it('is available when no night of the stay is booked', () => {
    expect(checkStay(availability, '2026-11-02', '2026-11-05')).toEqual({
      available: true,
    });
  });

  it('allows checking out on a booked night (same-day turnover)', () => {
    expect(checkStay(availability, '2026-11-03', '2026-11-05')).toEqual({
      available: true,
    });
  });

  it('allows checking in on the day the previous guest checks out', () => {
    expect(checkStay(availability, '2026-11-07', '2026-11-09')).toEqual({
      available: true,
    });
  });

  it('is not available when a night of the stay is booked', () => {
    expect(checkStay(availability, '2026-11-04', '2026-11-06')).toEqual({
      available: false,
      reason: STAY_NIGHTS_BOOKED,
      bookedNightsInStay: ['2026-11-05'],
    });
  });

  it('lists every booked night in the stay', () => {
    expect(checkStay(availability, '2026-11-04', '2026-11-08')).toEqual({
      available: false,
      reason: STAY_NIGHTS_BOOKED,
      bookedNightsInStay: ['2026-11-05', '2026-11-06'],
    });
  });

  it('is not available before the first bookable date', () => {
    expect(checkStay(availability, '2026-11-01', '2026-11-03')).toEqual({
      available: false,
      reason: CHECK_IN_TOO_EARLY,
    });
  });

  it('is not available when check-out is not after check-in', () => {
    expect(checkStay(availability, '2026-11-03', '2026-11-03')).toEqual({
      available: false,
      reason: CHECK_OUT_NOT_AFTER_CHECK_IN,
    });
  });
});
