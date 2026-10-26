import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { normalizeEmail } from '../common/email';
import { isDuplicateKeyError } from '../common/mongo-errors';
import { StaffService } from '../staff/staff.service';
import type { StaffRecord } from '../staff/staff.types';
import {
  BCRYPT_COST,
  EMAIL_TAKEN,
  TIMING_SAFE_PASSWORD_HASH,
  WRONG_CREDENTIALS,
} from './auth.constants';
import type { AuthResult, JwtPayload, StaffResponse } from './auth.types';
import type { LoginDto } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';

function toStaffResponse(staff: StaffRecord): StaffResponse {
  return { id: staff._id.toString(), name: staff.name, email: staff.email };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResult> {
    const email = normalizeEmail(dto.email);
    if (await this.staffService.findByEmail(email)) {
      throw new ConflictException(EMAIL_TAKEN);
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const staff = await this.createStaff(dto.name, email, passwordHash);
    return this.toAuthResult(staff);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const staff = await this.staffService.findByEmail(
      normalizeEmail(dto.email),
    );
    const passwordMatches = await bcrypt.compare(
      dto.password,
      staff?.passwordHash ?? TIMING_SAFE_PASSWORD_HASH,
    );
    if (!staff || !passwordMatches) {
      throw new UnauthorizedException(WRONG_CREDENTIALS);
    }
    return this.toAuthResult(staff);
  }

  async me(staffId: string): Promise<StaffResponse> {
    const staff = await this.staffService.findById(staffId);
    if (!staff) {
      throw new UnauthorizedException();
    }
    return toStaffResponse(staff);
  }

  private async createStaff(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<StaffRecord> {
    try {
      return await this.staffService.create({ name, email, passwordHash });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(EMAIL_TAKEN);
      }
      throw error;
    }
  }

  private async toAuthResult(staff: StaffRecord): Promise<AuthResult> {
    const response = toStaffResponse(staff);
    return {
      staff: response,
      token: await this.jwtService.signAsync<JwtPayload>({ sub: response.id }),
    };
  }
}
