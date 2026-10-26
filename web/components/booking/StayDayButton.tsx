'use client';

import { useEffect, useRef } from 'react';
import type { DayButtonProps, Modifiers } from 'react-day-picker';
import { toDateString } from '@/lib/dates';

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

export default function StayDayButton({
  day,
  modifiers,
  ...props
}: DayButtonProps) {
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
