'use client';

import { useState } from 'react';
import LoadError from '@/components/shared/LoadError';
import { useBookings } from '@/hooks/useBookings';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { useRedirectOnUnauthorized } from '@/hooks/useRedirectOnUnauthorized';
import type { Booking } from '@/lib/types';
import BookingsTable, { BookingsTableSkeleton } from './BookingsTable';
import CancelBookingModal from './CancelBookingModal';

export default function BookingsSection() {
  const bookings = useBookings();
  const cancel = useCancelBooking();
  const [selected, setSelected] = useState<Booking | null>(null);

  useRedirectOnUnauthorized(bookings.error, cancel.error);

  async function handleConfirm() {
    if (!selected) {
      return;
    }
    const cancelled = await cancel.run(selected.id);
    if (cancelled) {
      setSelected(null);
      cancel.reset();
      bookings.refetch();
    }
  }

  function handleClose() {
    setSelected(null);
    cancel.reset();
  }

  if (bookings.loading && !bookings.data) {
    return <BookingsTableSkeleton />;
  }

  if (bookings.error) {
    return (
      <LoadError
        messages={bookings.error.messages}
        onRetry={bookings.refetch}
      />
    );
  }

  return (
    <>
      <BookingsTable bookings={bookings.data ?? []} onCancel={setSelected} />
      {selected && (
        <CancelBookingModal
          booking={selected}
          loading={cancel.loading}
          error={cancel.error}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      )}
    </>
  );
}
