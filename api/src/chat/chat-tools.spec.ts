import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CHECK_IN_TOO_EARLY,
  DATES_TAKEN,
  PHONE_REQUIRED,
} from '../bookings/bookings.constants';
import type { BookingsService } from '../bookings/bookings.service';
import type {
  AvailabilityResponse,
  CreateBookingResponse,
  NewBooking,
} from '../bookings/bookings.types';
import { EMAIL_INVALID, NAME_REQUIRED } from '../common/constants';
import {
  CREATE_BOOKING_TOOL,
  GET_AVAILABILITY_TOOL,
  STAY_NIGHTS_BOOKED,
  TOOL_DATES_INVALID,
  TOOL_PHONE_INVALID,
  UNKNOWN_TOOL,
  guestDetailsNotGiven,
} from './chat.constants';
import { CHAT_TOOLS, ChatTools } from './chat-tools';

const availability: AvailabilityResponse = {
  firstBookableDate: '2026-11-02',
  bookedNights: ['2026-11-05', '2026-11-06'],
};

const confirmation: CreateBookingResponse = {
  bookingNumber: 'K7Q2MX',
  checkIn: '2026-11-12',
  checkOut: '2026-11-14',
};

const guest = {
  checkIn: '2026-11-12',
  checkOut: '2026-11-14',
  guestName: 'Ana Lopez',
  guestEmail: 'ana@example.com',
  guestPhone: '5550100123',
};

const GUEST_TYPED =
  'Book Nov 12 to Nov 14 for Ana Lopez, ana@example.com, (555) 010-0123';

const getAvailability = jest.fn<Promise<AvailabilityResponse>, []>();
const create = jest.fn<Promise<CreateBookingResponse>, [NewBooking]>();
const bookingsService = {
  getAvailability,
  create,
} as unknown as BookingsService;
const tools = new ChatTools(bookingsService);

async function availabilityCall(args: Record<string, unknown>) {
  const outcome = await tools.run(
    { name: GET_AVAILABILITY_TOOL, arguments: args },
    '',
  );
  return outcome.content;
}

function bookingCall(args: Record<string, unknown>, typed = GUEST_TYPED) {
  return tools.run({ name: CREATE_BOOKING_TOOL, arguments: args }, typed);
}

beforeEach(() => {
  getAvailability.mockResolvedValue(availability);
  create.mockResolvedValue(confirmation);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('ChatTools', () => {
  describe('get_availability', () => {
    it('returns the first bookable date and the booked nights', async () => {
      const result: unknown = JSON.parse(await availabilityCall({}));

      expect(result).toEqual(availability);
    });

    it('also checks a stay when given dates', async () => {
      const result: unknown = JSON.parse(
        await availabilityCall({
          checkIn: '2026-11-02',
          checkOut: '2026-11-05',
        }),
      );

      expect(result).toEqual({
        ...availability,
        stay: {
          summary:
            'Monday, November 2, 2026 to Thursday, November 5, 2026 is available.',
          checkIn: 'Monday, November 2, 2026',
          checkOut: 'Thursday, November 5, 2026',
          available: true,
        },
      });
    });

    it('says which nights of a stay are booked', async () => {
      const result: unknown = JSON.parse(
        await availabilityCall({
          checkIn: '2026-11-04',
          checkOut: '2026-11-07',
        }),
      );

      expect(result).toEqual({
        ...availability,
        stay: {
          summary:
            'Wednesday, November 4, 2026 to Saturday, November 7, 2026 is not available because the nights of Thursday, November 5, 2026 and Friday, November 6, 2026 are already booked.',
          checkIn: 'Wednesday, November 4, 2026',
          checkOut: 'Saturday, November 7, 2026',
          available: false,
          reason: STAY_NIGHTS_BOOKED,
          bookedNightsInStay: ['2026-11-05', '2026-11-06'],
        },
      });
    });

    it('returns an error for a date that is not YYYY-MM-DD', async () => {
      const result: unknown = JSON.parse(
        await availabilityCall({ checkIn: 'Nov 4', checkOut: '2026-11-07' }),
      );

      expect(result).toEqual({ error: TOOL_DATES_INVALID });
      expect(getAvailability).not.toHaveBeenCalled();
    });

    it('checks one night when only check-in is given', async () => {
      const result: unknown = JSON.parse(
        await availabilityCall({ checkIn: '2026-11-04' }),
      );

      expect(result).toEqual({
        ...availability,
        stay: {
          summary: 'The night of Wednesday, November 4, 2026 is available.',
          checkIn: 'Wednesday, November 4, 2026',
          checkOut: 'Thursday, November 5, 2026',
          available: true,
        },
      });
    });

    it('says one night is booked when only check-in is given', async () => {
      const result: unknown = JSON.parse(
        await availabilityCall({ checkIn: '2026-11-05' }),
      );

      expect(result).toEqual({
        ...availability,
        stay: {
          summary: 'The night of Thursday, November 5, 2026 is already booked.',
          checkIn: 'Thursday, November 5, 2026',
          checkOut: 'Friday, November 6, 2026',
          available: false,
          reason: STAY_NIGHTS_BOOKED,
          bookedNightsInStay: ['2026-11-05'],
        },
      });
    });

    it('returns an error when only check-out is given', async () => {
      const result: unknown = JSON.parse(
        await availabilityCall({ checkOut: '2026-11-07' }),
      );

      expect(result).toEqual({ error: TOOL_DATES_INVALID });
    });

    it('returns an error for a check-out that is not YYYY-MM-DD', async () => {
      const result: unknown = JSON.parse(
        await availabilityCall({ checkIn: '2026-11-04', checkOut: 'Friday' }),
      );

      expect(result).toEqual({ error: TOOL_DATES_INVALID });
    });
  });

  it('does not change availability when checking it', async () => {
    const outcome = await tools.run(
      { name: GET_AVAILABILITY_TOOL, arguments: {} },
      '',
    );

    expect(outcome.availabilityChanged).toBe(false);
  });

  it('makes the stay summary the final reply when checking dates', async () => {
    const outcome = await tools.run(
      { name: GET_AVAILABILITY_TOOL, arguments: { checkIn: '2026-11-04' } },
      '',
    );

    expect(outcome.finalReply).toBe(
      'The night of Wednesday, November 4, 2026 is available.',
    );
  });

  it('leaves the reply to the model when checking without dates', async () => {
    const outcome = await tools.run(
      { name: GET_AVAILABILITY_TOOL, arguments: {} },
      '',
    );

    expect(outcome.finalReply).toBeUndefined();
  });

  it('leaves the reply to the model when the dates are not valid', async () => {
    const outcome = await tools.run(
      { name: GET_AVAILABILITY_TOOL, arguments: { checkIn: 'Nov 4' } },
      '',
    );

    expect(outcome.finalReply).toBeUndefined();
  });

  describe('create_booking', () => {
    it('books the stay with the given details', async () => {
      await bookingCall(guest);

      expect(create).toHaveBeenCalledWith(expect.objectContaining(guest));
    });

    it('returns the booking number and a confirmation sentence', async () => {
      const outcome = await bookingCall(guest);

      expect(JSON.parse(outcome.content)).toEqual({
        ...confirmation,
        summary:
          "You're booked from Thursday, November 12, 2026 to Saturday, November 14, 2026. Your booking number is K7Q2MX.",
      });
    });

    it('says availability changed after a booking', async () => {
      const outcome = await bookingCall(guest);

      expect(outcome.availabilityChanged).toBe(true);
    });

    it('turns a formatted phone number into digits', async () => {
      await bookingCall({ ...guest, guestPhone: '(555) 010-0123' });

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ guestPhone: '5550100123' }),
      );
    });

    it('trims the name like the booking form', async () => {
      await bookingCall({ ...guest, guestName: '  Ana Lopez  ' });

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ guestName: 'Ana Lopez' }),
      );
    });

    it('ignores fields the tool does not take', async () => {
      await bookingCall({ ...guest, status: 'cancelled' });

      expect(create).toHaveBeenCalledWith(
        expect.not.objectContaining({ status: 'cancelled' }),
      );
    });

    it('returns the booking form messages for missing details', async () => {
      const outcome = await bookingCall({
        checkIn: guest.checkIn,
        checkOut: guest.checkOut,
      });

      expect(JSON.parse(outcome.content)).toEqual({
        error: `${NAME_REQUIRED} ${EMAIL_INVALID} ${PHONE_REQUIRED}`,
      });
      expect(create).not.toHaveBeenCalled();
    });

    it('returns an error for a phone number without 10 digits', async () => {
      const outcome = await bookingCall({ ...guest, guestPhone: '555-0100' });

      expect(JSON.parse(outcome.content)).toEqual({
        error: TOOL_PHONE_INVALID,
      });
      expect(create).not.toHaveBeenCalled();
    });

    it('returns the message when the dates are taken', async () => {
      create.mockRejectedValue(new ConflictException(DATES_TAKEN));

      const outcome = await bookingCall(guest);

      expect(JSON.parse(outcome.content)).toEqual({ error: DATES_TAKEN });
      expect(outcome.availabilityChanged).toBe(false);
    });

    it('returns the message when the dates break a booking rule', async () => {
      create.mockRejectedValue(new BadRequestException([CHECK_IN_TOO_EARLY]));

      const outcome = await bookingCall(guest);

      expect(JSON.parse(outcome.content)).toEqual({
        error: CHECK_IN_TOO_EARLY,
      });
    });

    it('refuses details the guest never typed, and books nothing', async () => {
      const outcome = await bookingCall(
        {
          ...guest,
          guestName: 'Guest Name',
          guestEmail: 'guest@example.com',
          guestPhone: '1234567890',
        },
        'Book Dec 15 to Dec 17 for me please.\nYes',
      );

      expect(JSON.parse(outcome.content)).toEqual({
        error: guestDetailsNotGiven('full name, email and phone number'),
      });
      expect(outcome.availabilityChanged).toBe(false);
      expect(create).not.toHaveBeenCalled();
    });

    it('names only the details the guest has not typed', async () => {
      const outcome = await bookingCall(guest, 'I am Ana Lopez, 5550100123');

      expect(JSON.parse(outcome.content)).toEqual({
        error: guestDetailsNotGiven('email'),
      });
    });

    it('passes on unexpected errors unchanged', async () => {
      const failure = new InternalServerErrorException();
      create.mockRejectedValue(failure);

      await expect(bookingCall(guest)).rejects.toBe(failure);
    });
  });

  it('offers get_availability and create_booking to the model', () => {
    expect(CHAT_TOOLS.map((tool) => tool.name)).toEqual([
      GET_AVAILABILITY_TOOL,
      CREATE_BOOKING_TOOL,
    ]);
  });

  it('returns an error for an unknown tool', async () => {
    const outcome = await tools.run(
      { name: 'delete_everything', arguments: {} },
      '',
    );

    expect(JSON.parse(outcome.content)).toEqual({ error: UNKNOWN_TOOL });
  });
});
