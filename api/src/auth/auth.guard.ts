import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_COOKIE } from './auth.constants';
import type { AuthenticatedRequest, JwtPayload } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token: unknown = request.cookies?.[TOKEN_COOKIE];
    if (typeof token !== 'string' || token === '') {
      throw new UnauthorizedException();
    }
    request.staffId = await this.verifiedStaffId(token);
    return true;
  }

  private async verifiedStaffId(token: string): Promise<string> {
    try {
      const { sub } = await this.jwtService.verifyAsync<JwtPayload>(token);
      return sub;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
