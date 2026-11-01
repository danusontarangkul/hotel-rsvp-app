import type { Booking } from '@/lib/types';
import {
  afterCancel,
  afterLookUp,
  answerCancelFlow,
  startCancelFlow,
} from './cancelFlow';
import {
  ASK_CONFIRMATION_ID,
  CONFIRMATION_ID_MISSING,
  LOOKUP_FAILED,
  NOTHING_CANCELLED,
} from './chatCopy';

const booking: Booking = {
  id: '6718f1d3a1b2c3d4e5f60719',
  bookingNumber: 'K7Q2MX',
  guestName: 'Ana Lopez',
  guestEmail: 'ana@example.com',
  guestPhone: '5550100123',
  checkIn: '2026-11-12',
  checkOut: '2026-11-14',
  status: 'active',
  createdAt: '2026-11-01T19:00:00.000Z',
  cancelledAt: null,
};

describe('startCancelFlow', () => {
  it('asks for the confirmation ID', () => {
    expect(startCancelFlow()).toEqual({
      flow: { step: 'bookingNumber' },
      replies: [ASK_CONFIRMATION_ID],
      next: 'reply',
    });
  });
});

describe('answerCancelFlow', () => {
  describe('confirmation ID', () => {
    it('looks up the booking number, uppercased', () => {
      expect(answerCancelFlow({ step: 'bookingNumber' }, ' k7q2mx ')).toEqual({
        flow: { step: 'lookingUp', bookingNumber: 'K7Q2MX' },
        replies: [],
        next: 'lookUp',
      });
    });

    it('asks again for a blank answer', () => {
      expect(answerCancelFlow({ step: 'bookingNumber' }, '   ')).toEqual({
        flow: { step: 'bookingNumber' },
        replies: [CONFIRMATION_ID_MISSING],
        next: 'reply',
      });
    });
  });

  describe('confirming', () => {
    const confirming = { step: 'confirmCancel' as const, booking };

    it('cancels after exactly CONFIRM', () => {
      expect(answerCancelFlow(confirming, 'CONFIRM')).toEqual({
        flow: confirming,
        replies: [],
        next: 'cancel',
      });
    });

    it.each(['confirm', 'Confirm', 'CONFIRM ', 'yes', 'CONFIRMED'])(
      'keeps the booking after "%s"',
      (text) => {
        expect(answerCancelFlow(confirming, text)).toEqual({
          flow: null,
          replies: [NOTHING_CANCELLED],
          next: 'reply',
        });
      },
    );
  });
});

describe('afterLookUp', () => {
  it('shows the details with a warning and asks for CONFIRM', () => {
    const result = afterLookUp('K7Q2MX', { booking });

    expect(result.flow).toEqual({ step: 'confirmCancel', booking });
    expect(result.replies).toEqual([
      [
        'Booking K7Q2MX:',
        'Name: Ana Lopez',
        'Phone: (555) 010-0123',
        'Email: ana@example.com',
        'Check-in: Thursday, November 12, 2026',
        'Check-out: Saturday, November 14, 2026',
        '',
        "Warning: cancelling can't be undone. The booking will be cancelled and its dates opened to other guests.",
        'To cancel it, type CONFIRM exactly. Anything else keeps the booking.',
      ].join('\n'),
    ]);
  });

  it('asks again when there is no booking with that number', () => {
    expect(afterLookUp('ZZZZZZ', { booking: null })).toEqual({
      flow: { step: 'bookingNumber' },
      replies: [
        "I couldn't find a booking with confirmation ID ZZZZZZ. What is the confirmation ID?",
      ],
      next: 'reply',
    });
  });

  it('ends when the booking is already cancelled', () => {
    expect(
      afterLookUp('K7Q2MX', { booking: { ...booking, status: 'cancelled' } }),
    ).toEqual({
      flow: null,
      replies: ['Booking K7Q2MX is already cancelled. Nothing was changed.'],
      next: 'reply',
    });
  });

  it('asks again when the lookup failed', () => {
    expect(afterLookUp('K7Q2MX', null)).toEqual({
      flow: { step: 'bookingNumber' },
      replies: [LOOKUP_FAILED],
      next: 'reply',
    });
  });
});

describe('afterCancel', () => {
  it('says the booking is cancelled', () => {
    expect(afterCancel(booking, { ...booking, status: 'cancelled' })).toEqual({
      flow: null,
      replies: ['Booking K7Q2MX is cancelled. Its dates are open again.'],
      next: 'reply',
    });
  });

  it('says nothing changed when cancelling failed', () => {
    expect(afterCancel(booking, null)).toEqual({
      flow: null,
      replies: [
        "Sorry, I couldn't cancel booking K7Q2MX. Nothing was changed.",
      ],
      next: 'reply',
    });
  });
});
