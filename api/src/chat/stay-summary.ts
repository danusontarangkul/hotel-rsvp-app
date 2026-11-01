import {
  CHECK_IN_TOO_EARLY,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
} from '../bookings/bookings.constants';
import { formatLongDate, nightsBetween } from '../common/dates';
import { joinWithAnd } from '../common/text';
import {
  STAY_CHECK_OUT_NOT_AFTER_CHECK_IN,
  nightsFromTo,
  oneNight,
  oneNightBooked,
  stayAvailable,
  stayNightsBooked,
  stayOneNightBooked,
  stayTooEarly,
} from './chat.constants';
import type { StayCheck } from './chat.types';

export type StayDates = {
  checkIn: string;
  checkOut: string;
  firstBookableDate: string;
};

export function staySummary(check: StayCheck, dates: StayDates): string {
  const isOneNight = nightsBetween(dates.checkIn, dates.checkOut).length === 1;
  const stay = isOneNight
    ? oneNight(formatLongDate(dates.checkIn))
    : nightsFromTo(
        formatLongDate(dates.checkIn),
        formatLongDate(dates.checkOut),
      );
  if (check.available) {
    return stayAvailable(stay);
  }
  if (check.reason === CHECK_IN_TOO_EARLY) {
    return stayTooEarly(stay, formatLongDate(dates.firstBookableDate));
  }
  if (check.reason === CHECK_OUT_NOT_AFTER_CHECK_IN) {
    return STAY_CHECK_OUT_NOT_AFTER_CHECK_IN;
  }
  if (isOneNight) {
    return oneNightBooked(formatLongDate(dates.checkIn));
  }
  const bookedNights = (check.bookedNightsInStay ?? []).map(formatLongDate);
  if (bookedNights.length === 1) {
    return stayOneNightBooked(stay, bookedNights[0]);
  }
  return stayNightsBooked(stay, joinWithAnd(bookedNights));
}
