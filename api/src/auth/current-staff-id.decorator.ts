import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types';

export function staffIdFromContext(context: ExecutionContext): string {
  return context.switchToHttp().getRequest<AuthenticatedRequest>().staffId;
}

export const CurrentStaffId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    staffIdFromContext(context),
);
