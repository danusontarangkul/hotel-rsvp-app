import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { exceptionMessages, isBookingRuleError } from './tool-errors';

describe('isBookingRuleError', () => {
  it('is true for a 400', () => {
    expect(isBookingRuleError(new BadRequestException(['Bad date.']))).toBe(
      true,
    );
  });

  it('is true for a 409', () => {
    expect(isBookingRuleError(new ConflictException('Taken.'))).toBe(true);
  });

  it('is false for other HTTP errors', () => {
    expect(isBookingRuleError(new ServiceUnavailableException())).toBe(false);
  });

  it('is false for errors that are not HTTP errors', () => {
    expect(isBookingRuleError(new Error('Database down'))).toBe(false);
  });
});

describe('exceptionMessages', () => {
  it('reads a single message', () => {
    expect(
      exceptionMessages(
        new ConflictException('Those dates are no longer available.'),
      ),
    ).toEqual(['Those dates are no longer available.']);
  });

  it('reads a list of messages', () => {
    expect(
      exceptionMessages(
        new BadRequestException([
          'Check-in must be tomorrow or later.',
          'Check-out must be after check-in.',
        ]),
      ),
    ).toEqual([
      'Check-in must be tomorrow or later.',
      'Check-out must be after check-in.',
    ]);
  });

  it('falls back to the default message', () => {
    expect(exceptionMessages(new NotFoundException())).toEqual(['Not Found']);
  });
});
