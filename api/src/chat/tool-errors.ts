import {
  BadRequestException,
  ConflictException,
  type HttpException,
} from '@nestjs/common';

export function isBookingRuleError(error: unknown): error is HttpException {
  return (
    error instanceof BadRequestException || error instanceof ConflictException
  );
}

export function exceptionMessages(error: HttpException): string[] {
  const response = error.getResponse();
  if (typeof response === 'string') {
    return [response];
  }
  const message: unknown = (response as { message?: unknown }).message;
  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === 'string');
  }
  return typeof message === 'string' ? [message] : [error.message];
}
