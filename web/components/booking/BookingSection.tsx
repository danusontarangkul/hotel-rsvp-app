'use client';

import { useState } from 'react';
import Card from '@/components/shared/Card';
import LoadError from '@/components/shared/LoadError';
import LoadingMessage from '@/components/shared/LoadingMessage';
import SectionHeading from '@/components/shared/SectionHeading';
import { useAvailability } from '@/hooks/useAvailability';
import { useCreateBooking } from '@/hooks/useCreateBooking';
import { EMPTY_SELECTION, selectDate, type StaySelection } from '@/lib/dates';
import type { ApiError } from '@/lib/api';
import type { BookingConfirmation, GuestDetails } from '@/lib/types';
import AvailabilityCalendar from './AvailabilityCalendar';
import BookingForm from './BookingForm';
import BookingModal, { type BookingResult } from './BookingModal';

function toBookingResult(
  confirmation: BookingConfirmation | null,
  conflict: ApiError | null,
): BookingResult | null {
  if (confirmation) {
    return { status: 'confirmed', booking: confirmation };
  }
  if (conflict) {
    return { status: 'unavailable', messages: conflict.messages };
  }
  return null;
}

export default function BookingSection() {
  const availability = useAvailability();
  const booking = useCreateBooking();
  const [selection, setSelection] = useState<StaySelection>(EMPTY_SELECTION);
  const [formKey, setFormKey] = useState<number>(0);

  const unavailable = booking.error?.status === 409;
  const result = toBookingResult(
    booking.data,
    unavailable ? booking.error : null,
  );

  function handleSelect(date: string) {
    const data = availability.data;
    if (data) {
      setSelection((current) => selectDate(current, date, data));
    }
  }

  async function handleBook(details: GuestDetails) {
    const { checkIn, checkOut } = selection;
    if (checkIn && checkOut) {
      const confirmation = await booking.run({ ...details, checkIn, checkOut });
      if (confirmation) {
        setFormKey((current) => current + 1);
        setSelection(EMPTY_SELECTION);
      }
    }
  }

  function handleCloseResult() {
    booking.reset();
    setSelection(EMPTY_SELECTION);
    availability.refetch();
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card>
        <SectionHeading variant="label">Select dates</SectionHeading>
        {availability.loading && !availability.data && (
          <LoadingMessage>Loading available dates…</LoadingMessage>
        )}
        {availability.error && (
          <LoadError
            messages={availability.error.messages}
            onRetry={availability.refetch}
          />
        )}
        {availability.data && (
          <AvailabilityCalendar
            availability={availability.data}
            selection={selection}
            onSelect={handleSelect}
          />
        )}
      </Card>
      <Card>
        <BookingForm
          key={formKey}
          selection={selection}
          loading={booking.loading}
          error={unavailable ? null : booking.error}
          onBook={handleBook}
        />
      </Card>
      {result && <BookingModal result={result} onClose={handleCloseResult} />}
    </div>
  );
}
