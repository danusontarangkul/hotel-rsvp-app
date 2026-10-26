import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import { TOKEN_COOKIE, TOKEN_COOKIE_MAX_AGE_MS } from './auth.constants';
import { AuthService } from './auth.service';
import type { StaffResponse } from './auth.types';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StaffResponse> {
    const { staff, token } = await this.authService.signup(dto);
    response.cookie(TOKEN_COOKIE, token, this.cookieOptions());
    return staff;
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_COOKIE_MAX_AGE_MS,
      path: '/',
    };
  }
}
