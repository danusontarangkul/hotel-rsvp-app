import { toBookingNumber } from '@/lib/booking-number';
import { formatLongDate } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import type { Booking, BookingLookup } from '@/lib/types';
import {
  ASK_CONFIRMATION_ID,
  CONFIRMATION_ID_MISSING,
  CONFIRM_WORD,
  LOOKUP_FAILED,
  NOTHING_CANCELLED,
  bookingAlreadyCancelled,
  bookingCancelled,
  bookingNotFound,
  cancelDetails,
  cancelFailed,
} from './chatCopy';

export type CancelFlow =
  | { step: 'bookingNumber' }
  | { step: 'lookingUp'; bookingNumber: string }
  | { step: 'confirmCancel'; booking: Booking };

export type CancelFlowNext = 'reply' | 'lookUp' | 'cancel';

export type CancelFlowResult = {
  flow: CancelFlow | null;
  replies: string[];
  next: CancelFlowNext;
};

function reply(flow: CancelFlow | null, text: string): CancelFlowResult {
  return { flow, replies: [text], next: 'reply' };
}

export function startCancelFlow(): CancelFlowResult {
  return reply({ step: 'bookingNumber' }, ASK_CONFIRMATION_ID);
}

export function answerCancelFlow(
  flow: CancelFlow,
  text: string,
): CancelFlowResult {
  if (flow.step === 'confirmCancel') {
    if (text === CONFIRM_WORD) {
      return { flow, replies: [], next: 'cancel' };
    }
    return reply(null, NOTHING_CANCELLED);
  }
  const bookingNumber = toBookingNumber(text);
  if (bookingNumber === '') {
    return reply({ step: 'bookingNumber' }, CONFIRMATION_ID_MISSING);
  }
  return {
    flow: { step: 'lookingUp', bookingNumber },
    replies: [],
    next: 'lookUp',
  };
}

export function afterLookUp(
  bookingNumber: string,
  lookup: BookingLookup | null,
): CancelFlowResult {
  if (!lookup) {
    return reply({ step: 'bookingNumber' }, LOOKUP_FAILED);
  }
  const { booking } = lookup;
  if (!booking) {
    return reply({ step: 'bookingNumber' }, bookingNotFound(bookingNumber));
  }
  if (booking.status === 'cancelled') {
    return reply(null, bookingAlreadyCancelled(booking.bookingNumber));
  }
  return reply(
    { step: 'confirmCancel', booking },
    cancelDetails({
      bookingNumber: booking.bookingNumber,
      guestName: booking.guestName,
      guestPhone: formatPhone(booking.guestPhone),
      guestEmail: booking.guestEmail,
      checkIn: formatLongDate(booking.checkIn),
      checkOut: formatLongDate(booking.checkOut),
    }),
  );
}

export function afterCancel(
  booking: Booking,
  cancelled: Booking | null,
): CancelFlowResult {
  if (!cancelled) {
    return reply(null, cancelFailed(booking.bookingNumber));
  }
  return reply(null, bookingCancelled(cancelled.bookingNumber));
}
