import { isBookingRequest, isCancelRequest, isNo, isYes } from './chat-answers';

describe('isCancelRequest', () => {
  it.each([
    'Cancel',
    'cancel a booking',
    'Cancel booking K7Q2MX',
    'I want to cancel a booking',
    "I'd like to cancel a reservation",
    'I need to cancel',
    'Can I cancel my booking?',
    'Help me cancel a booking',
  ])('reads "%s" as a cancel request', (text) => {
    expect(isCancelRequest(text)).toBe(true);
  });

  it.each([
    'How do I cancel a booking?',
    'What is the cancellation policy?',
    'Is there a cancellation fee?',
    'Do I need to cancel in writing?',
    'I want to book',
    'cancellation',
    '',
  ])('does not read "%s" as a cancel request', (text) => {
    expect(isCancelRequest(text)).toBe(false);
  });
});

describe('isBookingRequest', () => {
  it.each([
    'Book',
    'book a room',
    'Book Nov 12 to Nov 14',
    'I want to book',
    'I want to book a room please',
    "I'd like to make a reservation",
    'I would like to book the room',
    'Can I book the room?',
    'could we make a booking',
    'I need a booking',
    'Help me book',
    'Reserve the room for me',
    'wanna book',
  ])('reads "%s" as a booking request', (text) => {
    expect(isBookingRequest(text)).toBe(true);
  });

  it.each([
    'Do I need to book in advance?',
    'How do I book?',
    'Is breakfast included?',
    'Can I cancel my booking?',
    'What is the booking number?',
    'Is Nov 12 free?',
    'facebook',
    '',
  ])('does not read "%s" as a booking request', (text) => {
    expect(isBookingRequest(text)).toBe(false);
  });
});

describe('isYes', () => {
  it.each(['Yes', 'yes!', ' YES ', 'y', 'yep', 'Sure', 'ok', 'Yes, please'])(
    'reads "%s" as yes',
    (text) => {
      expect(isYes(text)).toBe(true);
    },
  );

  it.each(['no', 'maybe', 'yes but change the dates', ''])(
    'does not read "%s" as yes',
    (text) => {
      expect(isYes(text)).toBe(false);
    },
  );
});

describe('isNo', () => {
  it.each(['No', 'no.', 'NOPE', 'n', 'cancel', 'No thanks'])(
    'reads "%s" as no',
    (text) => {
      expect(isNo(text)).toBe(true);
    },
  );

  it.each(['yes', 'not sure', ''])('does not read "%s" as no', (text) => {
    expect(isNo(text)).toBe(false);
  });
});
