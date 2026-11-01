import { Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import type { AvailabilityResponse } from '../bookings/bookings.types';
import { addDays, formatLongDate, isCalendarDate } from '../common/dates';
import {
  GET_AVAILABILITY_TOOL,
  TOOL_DATES_INVALID,
  UNKNOWN_TOOL,
} from './chat.constants';
import type { ModelTool, ModelToolCall, StayCheck } from './chat.types';
import { checkStay } from './stay-check';

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

export const CHAT_TOOLS: ModelTool[] = [AVAILABILITY_TOOL];

type StayResult = StayCheck & {
  checkIn: string;
  checkOut: string;
};

type AvailabilityResult =
  | AvailabilityResponse
  | (AvailabilityResponse & { stay: StayResult })
  | { error: string };

@Injectable()
export class ChatTools {
  constructor(private readonly bookingsService: BookingsService) {}

  async run(call: ModelToolCall): Promise<string> {
    if (call.name === GET_AVAILABILITY_TOOL) {
      return JSON.stringify(await this.availability(call.arguments));
    }
    return JSON.stringify({ error: UNKNOWN_TOOL });
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
    return {
      ...availability,
      stay: {
        checkIn: formatLongDate(checkIn),
        checkOut: formatLongDate(stayCheckOut),
        ...checkStay(availability, checkIn, stayCheckOut),
      },
    };
  }
}
