import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { normalizeEmail } from '../common/email';
import { isDuplicateKeyError } from '../common/mongo-errors';
import { StaffService } from '../staff/staff.service';
import type { StaffRecord } from '../staff/staff.types';
import { BCRYPT_COST, EMAIL_TAKEN } from './auth.constants';
import type { AuthResult } from './auth.types';
import type { SignupDto } from './dto/signup.dto';

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
    const id = staff._id.toString();
    return {
      staff: { id, name: staff.name, email: staff.email },
      token: await this.jwtService.signAsync({ sub: id }),
    };
  }
}
