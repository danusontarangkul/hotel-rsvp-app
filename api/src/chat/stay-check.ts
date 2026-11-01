import {
  CHECK_IN_TOO_EARLY,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
} from '../bookings/bookings.constants';
import type { AvailabilityResponse } from '../bookings/bookings.types';
import { nightsBetween } from '../common/dates';
import { STAY_NIGHTS_BOOKED } from './chat.constants';
import type { StayCheck } from './chat.types';

export function checkStay(
  availability: AvailabilityResponse,
  checkIn: string,
  checkOut: string,
): StayCheck {
  if (checkIn < availability.firstBookableDate) {
    return { available: false, reason: CHECK_IN_TOO_EARLY };
  }
  if (checkOut <= checkIn) {
    return { available: false, reason: CHECK_OUT_NOT_AFTER_CHECK_IN };
  }
  const booked = new Set(availability.bookedNights);
  const bookedNightsInStay = nightsBetween(checkIn, checkOut).filter((night) =>
    booked.has(night),
  );
  if (bookedNightsInStay.length > 0) {
    return { available: false, reason: STAY_NIGHTS_BOOKED, bookedNightsInStay };
  }
  return { available: true };
}
