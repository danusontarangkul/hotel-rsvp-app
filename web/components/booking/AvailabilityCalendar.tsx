'use client';

import { DayPicker } from 'react-day-picker';
import {
  canSelectDate,
  fromDateString,
  isBooked,
  isUnavailable,
  toDateString,
  type StaySelection,
} from '@/lib/dates';
import type { Availability } from '@/lib/types';
import CalendarLegend from './CalendarLegend';
import { MONTHS_SHOWN } from './calendarLayout';
import StayDayButton from './StayDayButton';

type AvailabilityCalendarProps = {
  availability: Availability;
  selection: StaySelection;
  onSelect: (date: string) => void;
};

export default function AvailabilityCalendar({
  availability,
  selection,
  onSelect,
}: AvailabilityCalendarProps) {
  const firstMonth = fromDateString(availability.firstBookableDate);
  const { checkIn, checkOut } = selection;

  return (
    <div>
      <DayPicker
        numberOfMonths={MONTHS_SHOWN}
        weekStartsOn={1}
        defaultMonth={firstMonth}
        startMonth={firstMonth}
        onDayClick={(date) => onSelect(toDateString(date))}
        disabled={(date) =>
          !canSelectDate(selection, toDateString(date), availability)
        }
        modifiers={{
          unavailable: (date) =>
            isUnavailable(toDateString(date), availability) ||
            isBooked(toDateString(date), availability),
          stayStart: (date) => toDateString(date) === checkIn,
          stayEnd: (date) => toDateString(date) === checkOut,
          inStay: (date) =>
            checkIn !== null &&
            checkOut !== null &&
            toDateString(date) > checkIn &&
            toDateString(date) < checkOut,
        }}
        components={{ DayButton: StayDayButton }}
        classNames={{
          root: 'relative',
          months: 'flex flex-col gap-6 sm:flex-row sm:gap-8',
          month: 'flex flex-col gap-3',
          month_caption: 'flex h-8 items-center',
          caption_label: 'font-heading text-lg text-foreground',
          nav: 'absolute right-0 top-0 flex gap-1',
          button_previous:
            'flex size-8 cursor-pointer items-center justify-center rounded text-muted transition-opacity enabled:hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30',
          button_next:
            'flex size-8 cursor-pointer items-center justify-center rounded text-muted transition-opacity enabled:hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30',
          chevron: 'size-4 fill-current',
          month_grid: 'border-separate border-spacing-1',
          weekday: 'text-xs font-normal text-muted',
          day: 'p-0',
        }}
      />
      <CalendarLegend />
    </div>
  );
}
