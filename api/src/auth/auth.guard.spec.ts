import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { TOKEN_COOKIE } from './auth.constants';

const SECRET = 'test-secret';

type FakeRequest = { cookies?: Record<string, string>; staffId?: string };

function contextFor(request: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function contextWithCookies(
  cookies?: Record<string, string>,
): ExecutionContext {
  return contextFor({ cookies });
}

describe('AuthGuard', () => {
  const jwtService = new JwtService({ secret: SECRET });
  const guard = new AuthGuard(jwtService);

  it('lets a request with a valid token cookie through', async () => {
    const token = await jwtService.signAsync({ sub: 'staff-id' });

    await expect(
      guard.canActivate(contextWithCookies({ [TOKEN_COOKIE]: token })),
    ).resolves.toBe(true);
  });

  it('puts the logged-in staff id on the request', async () => {
    const token = await jwtService.signAsync({ sub: 'staff-id' });
    const request: FakeRequest = { cookies: { [TOKEN_COOKIE]: token } };

    await guard.canActivate(contextFor(request));

    expect(request.staffId).toBe('staff-id');
  });

  it('rejects a request with no cookies', async () => {
    await expect(guard.canActivate(contextWithCookies())).rejects.toEqual(
      new UnauthorizedException(),
    );
  });

  it('rejects a request without the token cookie', async () => {
    await expect(
      guard.canActivate(contextWithCookies({ other: 'value' })),
    ).rejects.toEqual(new UnauthorizedException());
  });

  it('rejects an empty token cookie', async () => {
    await expect(
      guard.canActivate(contextWithCookies({ [TOKEN_COOKIE]: '' })),
    ).rejects.toEqual(new UnauthorizedException());
  });

  it('rejects a token that is not a JWT', async () => {
    await expect(
      guard.canActivate(contextWithCookies({ [TOKEN_COOKIE]: 'not-a-jwt' })),
    ).rejects.toEqual(new UnauthorizedException());
  });

  it('rejects a token signed with another secret', async () => {
    const token = await new JwtService({ secret: 'other-secret' }).signAsync({
      sub: 'staff-id',
    });

    await expect(
      guard.canActivate(contextWithCookies({ [TOKEN_COOKIE]: token })),
    ).rejects.toEqual(new UnauthorizedException());
  });

  it('rejects an expired token', async () => {
    const token = await jwtService.signAsync(
      { sub: 'staff-id' },
      { expiresIn: '-1s' },
    );

    await expect(
      guard.canActivate(contextWithCookies({ [TOKEN_COOKIE]: token })),
    ).rejects.toEqual(new UnauthorizedException());
  });
});
