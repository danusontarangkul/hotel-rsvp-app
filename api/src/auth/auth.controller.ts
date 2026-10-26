import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import { TOKEN_COOKIE, TOKEN_COOKIE_MAX_AGE_MS } from './auth.constants';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import type { StaffResponse } from './auth.types';
import { CurrentStaffId } from './current-staff-id.decorator';
import { LoginDto } from './dto/login.dto';
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
    this.setTokenCookie(response, token);
    return staff;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StaffResponse> {
    const { staff, token } = await this.authService.login(dto);
    this.setTokenCookie(response, token);
    return staff;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentStaffId() staffId: string): Promise<StaffResponse> {
    return this.authService.me(staffId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(TOKEN_COOKIE, this.cookieOptions());
  }

  private setTokenCookie(response: Response, token: string): void {
    response.cookie(TOKEN_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: TOKEN_COOKIE_MAX_AGE_MS,
    });
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
