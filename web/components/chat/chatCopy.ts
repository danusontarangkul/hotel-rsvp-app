import { PHONE_DIGITS } from '@/lib/phone';

export const CHAT_GREETING = 'How can I help you today?';
export const CHAT_TITLE = 'Chat';
export const OPEN_CHAT_LABEL = 'Open chat';
export const MINIMIZE_CHAT_LABEL = 'Minimize chat';
export const MESSAGES_LABEL = 'Messages';
export const MESSAGE_INPUT_LABEL = 'Message';
export const MESSAGE_PLACEHOLDER = 'Ask about dates or booking';
export const SEND_LABEL = 'Send';
export const TYPING_LABEL = 'Assistant is typing';
export const SENDER_LABELS = {
  user: 'You',
  assistant: 'Assistant',
} as const;

export const QUICK_REPLIES_LABEL = 'Suggested questions';

export const AVAILABILITY_OPTION = 'Availability';
export const BOOK_STAY_OPTION = 'Book';
export const FAQ_OPTION = 'FAQs';
export const START_OPTIONS = [
  AVAILABILITY_OPTION,
  BOOK_STAY_OPTION,
  FAQ_OPTION,
];
export const YES_OPTION = 'Yes';
export const NO_OPTION = 'No';
export const YES_NO_OPTIONS = [YES_OPTION, NO_OPTION];

export const AVAILABILITY_QUESTION =
  'What date(s) are you asking about availability for?';
export const FAQ_QUESTION = 'What would you like to know?';

export const FIXED_REPLIES: Record<string, string> = {
  [AVAILABILITY_OPTION]: AVAILABILITY_QUESTION,
  [FAQ_OPTION]: FAQ_QUESTION,
};

export const ASK_CHECK_IN = 'What is your check-in date?';
export const ASK_CHECK_OUT = 'What is your check-out date?';
export const dateNotUnderstood = (question: string): string =>
  `Sorry, I couldn't read that date. ${question} You can write it like "Nov 12".`;
export const CHECK_OUT_NOT_AFTER_CHECK_IN = `Check-out has to be after check-in. ${ASK_CHECK_OUT}`;
export const checkInTooEarly = (earliest: string): string =>
  `The earliest check-in is ${earliest}. ${ASK_CHECK_IN}`;
export const stayDates = (checkIn: string, checkOut: string): string =>
  `${checkIn} to ${checkOut}`;
export const stayNotAvailable = (stay: string): string =>
  `Sorry, ${stay} isn't available. What check-in date would you like instead?`;
export const stayAvailable = (stay: string): string =>
  `${stay} is available. Is that right?`;
export const AVAILABILITY_CHECK_FAILED = `Sorry, I couldn't check availability just now. ${ASK_CHECK_OUT}`;
export const ASK_NAME = 'What is your full name?';
export const ASK_PHONE = 'What is your phone number?';
export const PHONE_NOT_VALID = `Please enter a ${PHONE_DIGITS}-digit phone number. ${ASK_PHONE}`;
export const ASK_EMAIL = 'What is your email address?';
export const EMAIL_NOT_VALID = `That email address doesn't look right. ${ASK_EMAIL}`;
export const bookingSummary = (details: {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
}): string =>
  [
    'Here are your details:',
    `Check-in: ${details.checkIn}`,
    `Check-out: ${details.checkOut}`,
    `Name: ${details.guestName}`,
    `Phone: ${details.guestPhone}`,
    `Email: ${details.guestEmail}`,
    'Shall I book it?',
  ].join('\n');
export const ANSWER_YES_OR_NO = 'Please answer yes or no.';
export const NOTHING_BOOKED = 'No problem, nothing was booked.';
export const bookingConfirmed = (stay: string, bookingNumber: string): string =>
  `You're booked from ${stay}. Your booking number is ${bookingNumber}.`;
export const DATES_JUST_TAKEN =
  'Sorry, those dates were just booked by someone else. What check-in date would you like instead?';
export const BOOKING_FAILED =
  'Sorry, something went wrong and nothing was booked. Shall I try again?';
