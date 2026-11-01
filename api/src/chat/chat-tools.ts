import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BookingsService } from '../bookings/bookings.service';
import type { AvailabilityResponse } from '../bookings/bookings.types';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { addDays, formatLongDate, isCalendarDate } from '../common/dates';
import { PHONE_DIGITS, toPhoneDigits } from '../common/phone';
import { joinWithAnd } from '../common/text';
import { validationMessages } from '../common/validation-errors';
import {
  CREATE_BOOKING_TOOL,
  GET_AVAILABILITY_TOOL,
  TOOL_DATES_INVALID,
  TOOL_PHONE_INVALID,
  UNKNOWN_TOOL,
  bookingConfirmed,
  guestDetailsNotGiven,
} from './chat.constants';
import { guestDetailsNotTyped } from './guest-details';
import type {
  ModelTool,
  ModelToolCall,
  StayCheck,
  ToolOutcome,
} from './chat.types';
import { checkStay } from './stay-check';
import { staySummary } from './stay-summary';
import { exceptionMessages, isBookingRuleError } from './tool-errors';

export const AVAILABILITY_TOOL: ModelTool = {
  name: GET_AVAILABILITY_TOOL,
  description:
    'Get the first date that can be booked and every night that is already booked. Pass checkIn to also check one stay, and checkOut too if the user gave one. With only checkIn it checks that one night. A stay books every night from checkIn up to the night before checkOut, so the checkOut day can be a booked night.',
  parameters: {
    type: 'object',
    properties: {
      checkIn: {
        type: 'string',
        description:
          'Check-in date as YYYY-MM-DD. Convert whatever the user wrote yourself. Optional.',
      },
      checkOut: {
        type: 'string',
        description:
          'Check-out date as YYYY-MM-DD. Optional; leave it out to check one night.',
      },
    },
    required: [],
  },
};

export const CREATE_BOOKING_TOOL_DEFINITION: ModelTool = {
  name: CREATE_BOOKING_TOOL,
  description:
    'Book the room. Only call this after the guest has given all five details and said yes to booking them. Never make up any detail.',
  parameters: {
    type: 'object',
    properties: {
      checkIn: { type: 'string', description: 'Check-in date as YYYY-MM-DD.' },
      checkOut: {
        type: 'string',
        description: 'Check-out date as YYYY-MM-DD, after checkIn.',
      },
      guestName: { type: 'string', description: "The guest's full name." },
      guestEmail: { type: 'string', description: "The guest's email address." },
      guestPhone: {
        type: 'string',
        description: `The guest's ${PHONE_DIGITS}-digit phone number.`,
      },
    },
    required: ['checkIn', 'checkOut', 'guestName', 'guestEmail', 'guestPhone'],
  },
};

export const CHAT_TOOLS: ModelTool[] = [
  AVAILABILITY_TOOL,
  CREATE_BOOKING_TOOL_DEFINITION,
];

type StayResult = StayCheck & {
  summary: string;
  checkIn: string;
  checkOut: string;
};

type AvailabilityResult =
  | AvailabilityResponse
  | (AvailabilityResponse & { stay: StayResult })
  | { error: string };

function unchanged(result: object): ToolOutcome {
  return { content: JSON.stringify(result), availabilityChanged: false };
}

function failed(messages: string[]): ToolOutcome {
  return unchanged({ error: messages.join(' ') });
}

@Injectable()
export class ChatTools {
  constructor(private readonly bookingsService: BookingsService) {}

  async run(call: ModelToolCall, guestTyped: string): Promise<ToolOutcome> {
    if (call.name === GET_AVAILABILITY_TOOL) {
      const result = await this.availability(call.arguments);
      return 'stay' in result
        ? { ...unchanged(result), finalReply: result.stay.summary }
        : unchanged(result);
    }
    if (call.name === CREATE_BOOKING_TOOL) {
      return this.createBooking(call.arguments, guestTyped);
    }
    return failed([UNKNOWN_TOOL]);
  }

  private async availability(
    args: Record<string, unknown>,
  ): Promise<AvailabilityResult> {
    const { checkIn, checkOut } = args;
    if (checkIn === undefined && checkOut === undefined) {
      return this.bookingsService.getAvailability();
    }
    if (!isCalendarDate(checkIn)) {
      return { error: TOOL_DATES_INVALID };
    }
    const stayCheckOut =
      checkOut === undefined ? addDays(checkIn, 1) : checkOut;
    if (!isCalendarDate(stayCheckOut)) {
      return { error: TOOL_DATES_INVALID };
    }
    const availability = await this.bookingsService.getAvailability();
    const check = checkStay(availability, checkIn, stayCheckOut);
    return {
      ...availability,
      stay: {
        summary: staySummary(check, {
          checkIn,
          checkOut: stayCheckOut,
          firstBookableDate: availability.firstBookableDate,
        }),
        checkIn: formatLongDate(checkIn),
        checkOut: formatLongDate(stayCheckOut),
        ...check,
      },
    };
  }

  private async createBooking(
    args: Record<string, unknown>,
    guestTyped: string,
  ): Promise<ToolOutcome> {
    const booking = plainToInstance(CreateBookingDto, {
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestPhone:
        typeof args.guestPhone === 'string'
          ? toPhoneDigits(args.guestPhone)
          : args.guestPhone,
    });
    const errors = await validate(booking, { stopAtFirstError: true });
    if (errors.length > 0) {
      return failed(validationMessages(errors));
    }
    if (booking.guestPhone.length !== PHONE_DIGITS) {
      return failed([TOOL_PHONE_INVALID]);
    }
    const notTyped = guestDetailsNotTyped(booking, guestTyped);
    if (notTyped.length > 0) {
      return failed([guestDetailsNotGiven(joinWithAnd(notTyped))]);
    }
    try {
      const confirmation = await this.bookingsService.create(booking);
      return {
        content: JSON.stringify({
          ...confirmation,
          summary: bookingConfirmed(
            formatLongDate(confirmation.checkIn),
            formatLongDate(confirmation.checkOut),
            confirmation.bookingNumber,
          ),
        }),
        availabilityChanged: true,
      };
    } catch (error) {
      if (isBookingRuleError(error)) {
        return failed(exceptionMessages(error));
      }
      throw error;
    }
  }
}
