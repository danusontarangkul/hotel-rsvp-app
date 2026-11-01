import {
  afterAvailabilityCheck,
  afterBooking,
  afterBookingFailed,
  answerBookingFlow,
  startBookingFlow,
  type BookingFlow,
} from './bookingFlow';
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
  dateNotUnderstood,
} from './chatCopy';

const TODAY = new Date(2026, 10, 1, 12);

const availability = {
  firstBookableDate: '2026-11-02',
  bookedNights: ['2026-11-20', '2026-11-21'],
};

const datesOnly = {
  checkIn: '2026-11-12',
  checkOut: '2026-11-14',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
};

const complete = {
  checkIn: '2026-11-12',
  checkOut: '2026-11-14',
  guestName: 'Ana Lopez',
  guestEmail: 'ana@example.com',
  guestPhone: '5550100123',
};

function at(step: BookingFlow['step'], draft = datesOnly): BookingFlow {
  return { step, draft };
}

describe('startBookingFlow', () => {
  it('asks for the check-in date first', () => {
    expect(startBookingFlow()).toEqual({
      flow: { step: 'checkIn', draft: expect.anything() as unknown },
      replies: [ASK_CHECK_IN],
      next: 'reply',
    });
  });
});

describe('answerBookingFlow', () => {
  describe('check-in', () => {
    it('saves the date and asks for check-out', () => {
      const result = answerBookingFlow(
        startBookingFlow().flow as BookingFlow,
        'Nov 12',
        TODAY,
      );

      expect(result.flow).toEqual(
        expect.objectContaining({
          step: 'checkOut',
          draft: expect.objectContaining({ checkIn: '2026-11-12' }) as unknown,
        }),
      );
      expect(result.replies).toEqual([ASK_CHECK_OUT]);
    });

    it('asks again when it cannot read the date', () => {
      const result = answerBookingFlow(at('checkIn'), 'soon', TODAY);

      expect(result.flow?.step).toBe('checkIn');
      expect(result.replies).toEqual([dateNotUnderstood(ASK_CHECK_IN)]);
    });
  });

  describe('check-out', () => {
    const afterCheckIn = at('checkOut', { ...datesOnly, checkOut: '' });

    it('saves the date and checks availability', () => {
      const result = answerBookingFlow(afterCheckIn, 'Nov 14', TODAY);

      expect(result.next).toBe('checkAvailability');
      expect(result.flow?.draft.checkOut).toBe('2026-11-14');
      expect(result.replies).toEqual([]);
    });

    it('asks again when check-out is not after check-in', () => {
      const result = answerBookingFlow(afterCheckIn, 'Nov 12', TODAY);

      expect(result.flow?.step).toBe('checkOut');
      expect(result.replies).toEqual([CHECK_OUT_NOT_AFTER_CHECK_IN]);
    });

    it('asks again when it cannot read the date', () => {
      const result = answerBookingFlow(afterCheckIn, 'later', TODAY);

      expect(result.replies).toEqual([dateNotUnderstood(ASK_CHECK_OUT)]);
    });
  });

  describe('confirming the dates', () => {
    it('asks for the name after yes', () => {
      const result = answerBookingFlow(at('confirmDates'), 'Yes', TODAY);

      expect(result.flow?.step).toBe('guestName');
      expect(result.replies).toEqual([ASK_NAME]);
    });

    it('starts the dates again after no', () => {
      const result = answerBookingFlow(at('confirmDates'), 'No', TODAY);

      expect(result.flow?.step).toBe('checkIn');
      expect(result.flow?.draft.checkIn).toBe('');
      expect(result.replies).toEqual([ASK_CHECK_IN]);
    });

    it('asks for yes or no after anything else', () => {
      const result = answerBookingFlow(at('confirmDates'), 'maybe', TODAY);

      expect(result.flow?.step).toBe('confirmDates');
      expect(result.replies).toEqual([ANSWER_YES_OR_NO]);
    });
  });

  describe('guest details', () => {
    it('saves the name and asks for the phone number', () => {
      const result = answerBookingFlow(at('guestName'), 'Ana Lopez', TODAY);

      expect(result.flow?.draft.guestName).toBe('Ana Lopez');
      expect(result.replies).toEqual([ASK_PHONE]);
    });

    it('asks for the name again when it is blank', () => {
      const result = answerBookingFlow(at('guestName'), '   ', TODAY);

      expect(result.flow?.step).toBe('guestName');
      expect(result.replies).toEqual([ASK_NAME]);
    });

    it('saves the phone as digits and asks for the email', () => {
      const result = answerBookingFlow(
        at('guestPhone'),
        '(555) 010-0123',
        TODAY,
      );

      expect(result.flow?.draft.guestPhone).toBe('5550100123');
      expect(result.replies).toEqual([ASK_EMAIL]);
    });

    it('asks for the phone again when it is not 10 digits', () => {
      const result = answerBookingFlow(at('guestPhone'), '555-0100', TODAY);

      expect(result.flow?.step).toBe('guestPhone');
      expect(result.replies).toEqual([PHONE_NOT_VALID]);
    });

    it('repeats every detail and asks to confirm after the email', () => {
      const result = answerBookingFlow(
        at('guestEmail', { ...complete, guestEmail: '' }),
        'ana@example.com',
        TODAY,
      );

      expect(result.flow?.step).toBe('confirmBooking');
      expect(result.replies).toEqual([
        [
          'Here are your details:',
          'Check-in: Thursday, November 12, 2026',
          'Check-out: Saturday, November 14, 2026',
          'Name: Ana Lopez',
          'Phone: (555) 010-0123',
          'Email: ana@example.com',
          'Shall I book it?',
        ].join('\n'),
      ]);
    });

    it('asks for the email again when it is not valid', () => {
      const result = answerBookingFlow(at('guestEmail'), 'ana@', TODAY);

      expect(result.flow?.step).toBe('guestEmail');
      expect(result.replies).toEqual([EMAIL_NOT_VALID]);
    });
  });

  describe('confirming the booking', () => {
    it('books after yes', () => {
      const result = answerBookingFlow(
        at('confirmBooking', complete),
        'yes',
        TODAY,
      );

      expect(result.next).toBe('book');
      expect(result.flow?.draft).toEqual(complete);
    });

    it('ends without booking after no', () => {
      expect(
        answerBookingFlow(at('confirmBooking', complete), 'no', TODAY),
      ).toEqual({ flow: null, replies: [NOTHING_BOOKED], next: 'reply' });
    });

    it('asks for yes or no after anything else', () => {
      const result = answerBookingFlow(
        at('confirmBooking', complete),
        'hmm',
        TODAY,
      );

      expect(result.replies).toEqual([ANSWER_YES_OR_NO]);
    });
  });
});

describe('afterAvailabilityCheck', () => {
  it('repeats the dates and asks if they are right when the stay is free', () => {
    const result = afterAvailabilityCheck(at('checkOut'), availability);

    expect(result.flow?.step).toBe('confirmDates');
    expect(result.replies).toEqual([
      'Thursday, November 12, 2026 to Saturday, November 14, 2026 is available. Is that right?',
    ]);
  });

  it('asks for new dates when a night is booked', () => {
    const result = afterAvailabilityCheck(
      at('checkOut', {
        ...datesOnly,
        checkIn: '2026-11-19',
        checkOut: '2026-11-22',
      }),
      availability,
    );

    expect(result.flow?.step).toBe('checkIn');
    expect(result.replies).toEqual([
      "Sorry, Thursday, November 19, 2026 to Sunday, November 22, 2026 isn't available. What check-in date would you like instead?",
    ]);
  });

  it('allows checking out on a booked night', () => {
    const result = afterAvailabilityCheck(
      at('checkOut', {
        ...datesOnly,
        checkIn: '2026-11-18',
        checkOut: '2026-11-20',
      }),
      availability,
    );

    expect(result.flow?.step).toBe('confirmDates');
  });

  it('gives the earliest check-in when check-in is too soon', () => {
    const result = afterAvailabilityCheck(
      at('checkOut', {
        ...datesOnly,
        checkIn: '2026-11-01',
        checkOut: '2026-11-03',
      }),
      availability,
    );

    expect(result.flow?.step).toBe('checkIn');
    expect(result.replies).toEqual([
      'The earliest check-in is Monday, November 2, 2026. What is your check-in date?',
    ]);
  });

  it('asks for check-out again when availability could not be loaded', () => {
    const result = afterAvailabilityCheck(at('checkOut'), null);

    expect(result.flow?.step).toBe('checkOut');
    expect(result.replies).toEqual([AVAILABILITY_CHECK_FAILED]);
  });
});

describe('afterBooking', () => {
  it('shows the booking number and ends the flow', () => {
    expect(
      afterBooking({
        bookingNumber: 'K7Q2MX',
        checkIn: '2026-11-12',
        checkOut: '2026-11-14',
      }),
    ).toEqual({
      flow: null,
      replies: [
        "You're booked from Thursday, November 12, 2026 to Saturday, November 14, 2026. Your booking number is K7Q2MX.",
      ],
      next: 'reply',
    });
  });
});

describe('afterBookingFailed', () => {
  it('asks for new dates when someone else just booked them', () => {
    const result = afterBookingFailed(at('confirmBooking', complete), {
      ...availability,
      bookedNights: ['2026-11-13'],
    });

    expect(result.flow?.step).toBe('checkIn');
    expect(result.replies).toEqual([DATES_JUST_TAKEN]);
  });

  it('offers to try again for any other failure', () => {
    const result = afterBookingFailed(
      at('confirmBooking', complete),
      availability,
    );

    expect(result.flow).toEqual(at('confirmBooking', complete));
    expect(result.replies).toEqual([BOOKING_FAILED]);
  });

  it('offers to try again when availability could not be loaded either', () => {
    const result = afterBookingFailed(at('confirmBooking', complete), null);

    expect(result.replies).toEqual([BOOKING_FAILED]);
  });
});
