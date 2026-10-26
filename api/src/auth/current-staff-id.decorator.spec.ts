import type { ExecutionContext } from '@nestjs/common';
import { staffIdFromContext } from './current-staff-id.decorator';

describe('staffIdFromContext', () => {
  it('reads the staff id the auth guard put on the request', () => {
    const request = { staffId: '6718f0c2a1b2c3d4e5f60718' };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    expect(staffIdFromContext(context)).toBe('6718f0c2a1b2c3d4e5f60718');
  });
});
