import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_COOKIE } from './auth.constants';
import { OptionalAuthGuard } from './optional-auth.guard';

const SECRET = 'test-secret';

type FakeRequest = { cookies?: Record<string, string>; staffId?: string };

function contextFor(request: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('OptionalAuthGuard', () => {
  const jwtService = new JwtService({ secret: SECRET });
  const guard = new OptionalAuthGuard(jwtService);

  it('puts the staff id on the request for a valid token', async () => {
    const token = await jwtService.signAsync({ sub: 'staff-id' });
    const request: FakeRequest = { cookies: { [TOKEN_COOKIE]: token } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.staffId).toBe('staff-id');
  });

  it('lets a request with no cookies through as a guest', async () => {
    const request: FakeRequest = {};

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.staffId).toBeUndefined();
  });

  it('lets an empty token cookie through as a guest', async () => {
    const request: FakeRequest = { cookies: { [TOKEN_COOKIE]: '' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.staffId).toBeUndefined();
  });

  it('lets a token that is not a JWT through as a guest', async () => {
    const request: FakeRequest = { cookies: { [TOKEN_COOKIE]: 'not-a-jwt' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.staffId).toBeUndefined();
  });

  it('lets a token signed with another secret through as a guest', async () => {
    const token = await new JwtService({ secret: 'other-secret' }).signAsync({
      sub: 'staff-id',
    });
    const request: FakeRequest = { cookies: { [TOKEN_COOKIE]: token } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.staffId).toBeUndefined();
  });

  it('lets an expired token through as a guest', async () => {
    const token = await jwtService.signAsync(
      { sub: 'staff-id' },
      { expiresIn: '-1s' },
    );
    const request: FakeRequest = { cookies: { [TOKEN_COOKIE]: token } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.staffId).toBeUndefined();
  });
});
