'use client';

import Button from '@/components/shared/Button';
import Modal from '@/components/shared/Modal';
import type { BookingConfirmation as Confirmation } from '@/lib/types';
import BookingConfirmation from './BookingConfirmation';

export type BookingResult =
  | { status: 'confirmed'; booking: Confirmation }
  | { status: 'unavailable'; messages: string[] };

type BookingModalProps = {
  result: BookingResult;
  onClose: () => void;
};

export default function BookingModal({ result, onClose }: BookingModalProps) {
  if (result.status === 'confirmed') {
    return (
      <Modal
        title="Booking confirmed"
        onClose={onClose}
        actions={<Button onClick={onClose}>Done</Button>}
      >
        <BookingConfirmation booking={result.booking} />
      </Modal>
    );
  }
  return (
    <Modal
      title="Dates no longer available"
      onClose={onClose}
      actions={<Button onClick={onClose}>Choose new dates</Button>}
    >
      <div className="flex flex-col gap-2 text-sm text-foreground">
        {result.messages.map((message) => (
          <p key={message}>{message}</p>
        ))}
        <p>Please choose different dates.</p>
      </div>
    </Modal>
  );
}
