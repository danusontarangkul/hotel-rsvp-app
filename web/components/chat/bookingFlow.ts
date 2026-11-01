import { isNo, isYes } from '@/lib/chat-answers';
import {
  formatLongDate,
  parseChatDate,
  stayIncludesBookedNight,
} from '@/lib/dates';
import { formatPhone, isValidPhone, toPhoneDigits } from '@/lib/phone';
import type {
  Availability,
  BookingConfirmation,
  CreateBookingInput,
} from '@/lib/types';
import { isFilled, isValidEmail } from '@/lib/validation';
import {
  ANSWER_YES_OR_NO,
  ASK_CHECK_IN,
  ASK_CHECK_OUT,
  ASK_EMAIL,
  ASK_NAME,
  ASK_PHONE,
  AVAILABILITY_CHECK_FAILED,
  BOOKING_FAILED,
  CHECK_OUT_NOT_AFTER_CHECK_IN,
  DATES_JUST_TAKEN,
  EMAIL_NOT_VALID,
  NOTHING_BOOKED,
  PHONE_NOT_VALID,
  bookingConfirmed,
  bookingSummary,
  checkInTooEarly,
  dateNotUnderstood,
  stayAvailable,
  stayDates,
  stayNotAvailable,
} from './chatCopy';

export type BookingStep =
  | 'checkIn'
  | 'checkOut'
  | 'confirmDates'
  | 'guestName'
  | 'guestPhone'
  | 'guestEmail'
  | 'confirmBooking';

export type BookingFlow = {
  step: BookingStep;
  draft: CreateBookingInput;
};

export type BookingFlowNext = 'reply' | 'checkAvailability' | 'book';

export type BookingFlowResult = {
  flow: BookingFlow | null;
  replies: string[];
  next: BookingFlowNext;
};

export const YES_NO_STEPS: BookingStep[] = ['confirmDates', 'confirmBooking'];

const EMPTY_DRAFT: CreateBookingInput = {
  checkIn: '',
  checkOut: '',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
};

function goTo(
  step: BookingStep,
  draft: CreateBookingInput,
  reply: string,
): BookingFlowResult {
  return { flow: { step, draft }, replies: [reply], next: 'reply' };
}

function stayOf(draft: CreateBookingInput): string {
  return stayDates(
    formatLongDate(draft.checkIn),
    formatLongDate(draft.checkOut),
  );
}

export function startBookingFlow(): BookingFlowResult {
  return goTo('checkIn', EMPTY_DRAFT, ASK_CHECK_IN);
}

function answerCheckIn(
  draft: CreateBookingInput,
  text: string,
  today: Date,
): BookingFlowResult {
  const checkIn = parseChatDate(text, today);
  if (!checkIn) {
    return goTo('checkIn', draft, dateNotUnderstood(ASK_CHECK_IN));
  }
  return goTo('checkOut', { ...draft, checkIn }, ASK_CHECK_OUT);
}

function answerCheckOut(
  draft: CreateBookingInput,
  text: string,
  today: Date,
): BookingFlowResult {
  const checkOut = parseChatDate(text, today);
  if (!checkOut) {
    return goTo('checkOut', draft, dateNotUnderstood(ASK_CHECK_OUT));
  }
  if (checkOut <= draft.checkIn) {
    return goTo('checkOut', draft, CHECK_OUT_NOT_AFTER_CHECK_IN);
  }
  return {
    flow: { step: 'checkOut', draft: { ...draft, checkOut } },
    replies: [],
    next: 'checkAvailability',
  };
}

function answerConfirmDates(
  draft: CreateBookingInput,
  text: string,
): BookingFlowResult {
  if (isYes(text)) {
    return goTo('guestName', draft, ASK_NAME);
  }
  if (isNo(text)) {
    return goTo('checkIn', EMPTY_DRAFT, ASK_CHECK_IN);
  }
  return goTo('confirmDates', draft, ANSWER_YES_OR_NO);
}

function answerGuestName(
  draft: CreateBookingInput,
  text: string,
): BookingFlowResult {
  if (!isFilled(text)) {
    return goTo('guestName', draft, ASK_NAME);
  }
  return goTo('guestPhone', { ...draft, guestName: text }, ASK_PHONE);
}

function answerGuestPhone(
  draft: CreateBookingInput,
  text: string,
): BookingFlowResult {
  const guestPhone = toPhoneDigits(text);
  if (!isValidPhone(guestPhone)) {
    return goTo('guestPhone', draft, PHONE_NOT_VALID);
  }
  return goTo('guestEmail', { ...draft, guestPhone }, ASK_EMAIL);
}

function answerGuestEmail(
  draft: CreateBookingInput,
  text: string,
): BookingFlowResult {
  if (!isValidEmail(text)) {
    return goTo('guestEmail', draft, EMAIL_NOT_VALID);
  }
  const complete = { ...draft, guestEmail: text };
  return goTo(
    'confirmBooking',
    complete,
    bookingSummary({
      checkIn: formatLongDate(complete.checkIn),
      checkOut: formatLongDate(complete.checkOut),
      guestName: complete.guestName,
      guestPhone: formatPhone(complete.guestPhone),
      guestEmail: complete.guestEmail,
    }),
  );
}

function answerConfirmBooking(
  draft: CreateBookingInput,
  text: string,
): BookingFlowResult {
  if (isYes(text)) {
    return {
      flow: { step: 'confirmBooking', draft },
      replies: [],
      next: 'book',
    };
  }
  if (isNo(text)) {
    return { flow: null, replies: [NOTHING_BOOKED], next: 'reply' };
  }
  return goTo('confirmBooking', draft, ANSWER_YES_OR_NO);
}

export function answerBookingFlow(
  flow: BookingFlow,
  text: string,
  today: Date,
): BookingFlowResult {
  const { step, draft } = flow;
  if (step === 'checkIn') {
    return answerCheckIn(draft, text, today);
  }
  if (step === 'checkOut') {
    return answerCheckOut(draft, text, today);
  }
  if (step === 'confirmDates') {
    return answerConfirmDates(draft, text);
  }
  if (step === 'guestName') {
    return answerGuestName(draft, text);
  }
  if (step === 'guestPhone') {
    return answerGuestPhone(draft, text);
  }
  if (step === 'guestEmail') {
    return answerGuestEmail(draft, text);
  }
  return answerConfirmBooking(draft, text);
}

export function afterAvailabilityCheck(
  flow: BookingFlow,
  availability: Availability | null,
): BookingFlowResult {
  const { draft } = flow;
  if (!availability) {
    return goTo('checkOut', draft, AVAILABILITY_CHECK_FAILED);
  }
  if (draft.checkIn < availability.firstBookableDate) {
    return goTo(
      'checkIn',
      EMPTY_DRAFT,
      checkInTooEarly(formatLongDate(availability.firstBookableDate)),
    );
  }
  if (stayIncludesBookedNight(draft.checkIn, draft.checkOut, availability)) {
    return goTo('checkIn', EMPTY_DRAFT, stayNotAvailable(stayOf(draft)));
  }
  return goTo('confirmDates', draft, stayAvailable(stayOf(draft)));
}

export function afterBooking(
  confirmation: BookingConfirmation,
): BookingFlowResult {
  return {
    flow: null,
    replies: [
      bookingConfirmed(
        stayDates(
          formatLongDate(confirmation.checkIn),
          formatLongDate(confirmation.checkOut),
        ),
        confirmation.bookingNumber,
      ),
    ],
    next: 'reply',
  };
}

export function afterBookingFailed(
  flow: BookingFlow,
  availability: Availability | null,
): BookingFlowResult {
  const { draft } = flow;
  const taken =
    availability !== null &&
    stayIncludesBookedNight(draft.checkIn, draft.checkOut, availability);
  if (taken) {
    return goTo('checkIn', EMPTY_DRAFT, DATES_JUST_TAKEN);
  }
  return goTo('confirmBooking', draft, BOOKING_FAILED);
}
