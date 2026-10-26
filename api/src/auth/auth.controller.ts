import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
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
    response.cookie(TOKEN_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: TOKEN_COOKIE_MAX_AGE_MS,
    });
    return staff;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(TOKEN_COOKIE, this.cookieOptions());
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    };
  }
}
