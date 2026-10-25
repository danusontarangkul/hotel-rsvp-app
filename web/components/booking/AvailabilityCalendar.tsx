'use client';

import { useEffect, useRef } from 'react';
import {
  DayPicker,
  type DayButtonProps,
  type Modifiers,
} from 'react-day-picker';
import {
  canSelectDate,
  fromDateString,
  isBooked,
  isUnavailable,
  toDateString,
  type StaySelection,
} from '@/lib/dates';
import type { Availability } from '@/lib/types';

type AvailabilityCalendarProps = {
  availability: Availability;
  selection: StaySelection;
  onSelect: (date: string) => void;
};

const DAY_BUTTON_BASE =
  'flex size-9 cursor-pointer items-center transition-opacity enabled:hover:opacity-80 justify-center rounded-md border text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed sm:size-10';

function dayButtonClassName(modifiers: Modifiers): string {
  if (modifiers.stayStart || modifiers.stayEnd) {
    return `${DAY_BUTTON_BASE} border-primary bg-primary font-semibold text-on-primary`;
  }
  if (modifiers.unavailable) {
    return `${DAY_BUTTON_BASE} border-transparent bg-surface-muted text-muted line-through`;
  }
  if (modifiers.inStay) {
    return `${DAY_BUTTON_BASE} border-transparent bg-accent-soft text-foreground`;
  }
  return `${DAY_BUTTON_BASE} border-border bg-surface text-foreground`;
}

function StayDayButton({ day, modifiers, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus();
    }
  }, [modifiers.focused]);

  return (
    <button
      {...props}
      ref={ref}
      data-date={toDateString(day.date)}
      aria-pressed={Boolean(modifiers.stayStart || modifiers.stayEnd)}
      className={dayButtonClassName(modifiers)}
    />
  );
}

const LEGEND = [
  { label: 'Available', swatch: 'border border-border bg-surface' },
  { label: 'Unavailable', swatch: 'border border-muted/50 bg-surface-muted' },
  { label: 'Selected', swatch: 'bg-primary' },
];

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
        numberOfMonths={2}
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
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        {LEGEND.map(({ label, swatch }) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-sm ${swatch}`} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
