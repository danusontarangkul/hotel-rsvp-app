import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_COOKIE } from './auth.constants';
import type { JwtPayload, OptionallyAuthenticatedRequest } from './auth.types';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OptionallyAuthenticatedRequest>();
    const token: unknown = request.cookies?.[TOKEN_COOKIE];
    if (typeof token === 'string' && token !== '') {
      request.staffId = await this.staffIdOrNothing(token);
    }
    return true;
  }

  private async staffIdOrNothing(token: string): Promise<string | undefined> {
    try {
      const { sub } = await this.jwtService.verifyAsync<JwtPayload>(token);
      return sub;
    } catch {
      return undefined;
    }
  }
}
