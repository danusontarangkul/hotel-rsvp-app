import type { ExecutionContext } from '@nestjs/common';
import { optionalStaffIdFromContext } from './optional-staff-id.decorator';

function contextFor(request: { staffId?: string }): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('optionalStaffIdFromContext', () => {
  it('reads the staff id the optional auth guard put on the request', () => {
    expect(
      optionalStaffIdFromContext(
        contextFor({ staffId: '6718f0c2a1b2c3d4e5f60718' }),
      ),
    ).toBe('6718f0c2a1b2c3d4e5f60718');
  });

  it('is undefined for a guest', () => {
    expect(optionalStaffIdFromContext(contextFor({}))).toBeUndefined();
  });
});
