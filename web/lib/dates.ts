import { addDays, format, parseISO } from 'date-fns';
import type { Availability } from './types';

export type StaySelection = {
  checkIn: string | null;
  checkOut: string | null;
};

export const EMPTY_SELECTION: StaySelection = { checkIn: null, checkOut: null };

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromDateString(value: string): Date {
  return parseISO(value);
}

export function formatDisplayDate(value: string): string {
  return format(parseISO(value), 'd MMM yyyy');
}

export function nightsBetween(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  for (
    let night = fromDateString(checkIn);
    toDateString(night) < checkOut;
    night = addDays(night, 1)
  ) {
    nights.push(toDateString(night));
  }
  return nights;
}

export function isUnavailable(
  date: string,
  availability: Availability,
): boolean {
  return date < availability.firstBookableDate;
}

export function isBooked(date: string, availability: Availability): boolean {
  return availability.bookedNights.includes(date);
}

export function stayIncludesBookedNight(
  checkIn: string,
  checkOut: string,
  availability: Availability,
): boolean {
  return nightsBetween(checkIn, checkOut).some((night) =>
    isBooked(night, availability),
  );
}

export function canCheckIn(date: string, availability: Availability): boolean {
  return !isUnavailable(date, availability) && !isBooked(date, availability);
}

export function canCheckOut(
  checkIn: string,
  date: string,
  availability: Availability,
): boolean {
  return (
    date > checkIn && !stayIncludesBookedNight(checkIn, date, availability)
  );
}

function isPickingCheckOut(selection: StaySelection): selection is {
  checkIn: string;
  checkOut: null;
} {
  return selection.checkIn !== null && selection.checkOut === null;
}

export function canSelectDate(
  selection: StaySelection,
  date: string,
  availability: Availability,
): boolean {
  if (
    isPickingCheckOut(selection) &&
    canCheckOut(selection.checkIn, date, availability)
  ) {
    return true;
  }
  return canCheckIn(date, availability);
}

export function selectDate(
  selection: StaySelection,
  date: string,
  availability: Availability,
): StaySelection {
  if (
    isPickingCheckOut(selection) &&
    canCheckOut(selection.checkIn, date, availability)
  ) {
    return { checkIn: selection.checkIn, checkOut: date };
  }
  if (canCheckIn(date, availability)) {
    return { checkIn: date, checkOut: null };
  }
  return selection;
}
