import type { BookingsService } from '../bookings/bookings.service';
import type { AvailabilityResponse } from '../bookings/bookings.types';
import {
  GET_AVAILABILITY_TOOL,
  STAY_NIGHTS_BOOKED,
  TOOL_DATES_INVALID,
  UNKNOWN_TOOL,
} from './chat.constants';
import { ChatTools } from './chat-tools';

const availability: AvailabilityResponse = {
  firstBookableDate: '2026-11-02',
  bookedNights: ['2026-11-05', '2026-11-06'],
};

const getAvailability = jest.fn<Promise<AvailabilityResponse>, []>();
const bookingsService = { getAvailability } as unknown as BookingsService;
const tools = new ChatTools(bookingsService);

function availabilityCall(args: Record<string, unknown>) {
  return tools.run({ name: GET_AVAILABILITY_TOOL, arguments: args });
}

beforeEach(() => {
  getAvailability.mockResolvedValue(availability);
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

  it('returns an error for an unknown tool', async () => {
    const result: unknown = JSON.parse(
      await tools.run({ name: 'delete_everything', arguments: {} }),
    );

    expect(result).toEqual({ error: UNKNOWN_TOOL });
  });
});
