import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { OptionallyAuthenticatedRequest } from './auth.types';

export function optionalStaffIdFromContext(
  context: ExecutionContext,
): string | undefined {
  return context.switchToHttp().getRequest<OptionallyAuthenticatedRequest>()
    .staffId;
}

export const OptionalStaffId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined =>
    optionalStaffIdFromContext(context),
);
