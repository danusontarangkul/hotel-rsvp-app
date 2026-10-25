'use client';

import Button from '@/components/shared/Button';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Modal from '@/components/shared/Modal';
import type { ApiError } from '@/lib/api';
import { formatDateRange } from '@/lib/dates';
import type { Booking } from '@/lib/types';

type CancelBookingModalProps = {
  booking: Booking;
  loading: boolean;
  error: ApiError | null;
  onConfirm: () => void;
  onClose: () => void;
};

export default function CancelBookingModal({
  booking,
  loading,
  error,
  onConfirm,
  onClose,
}: CancelBookingModalProps) {
  return (
    <Modal
      title="Cancel this booking?"
      onClose={onClose}
      closeDisabled={loading}
      actions={
        <>
          <Button variant="secondary" disabled={loading} onClick={onClose}>
            Keep booking
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            Cancel booking
          </Button>
        </>
      }
    >
      <div className="rounded-lg bg-surface-muted p-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-semibold text-foreground">
            {booking.guestName}
          </p>
          <p className="text-xs text-muted">{booking.bookingNumber}</p>
        </div>
        <p className="mt-1 font-heading text-xl text-foreground">
          {formatDateRange(booking.checkIn, booking.checkOut)}
        </p>
      </div>
      <ErrorMessage messages={error?.messages ?? []} />
    </Modal>
  );
}
