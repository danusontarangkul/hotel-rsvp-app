import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { StaffService } from '../staff/staff.service';
import type { NewStaff, StaffRecord } from '../staff/staff.types';
import { BCRYPT_COST, EMAIL_TAKEN } from './auth.constants';
import { AuthService } from './auth.service';

const signupDto = {
  name: 'Sam Lee',
  email: 'Sam@Hotel.com',
  password: 'at-least-8',
};

function staffRecord(staff: NewStaff): StaffRecord {
  return {
    _id: new Types.ObjectId('6718f0c2a1b2c3d4e5f60718'),
    createdAt: new Date('2026-10-25T12:00:00.000Z'),
    ...staff,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  const staffService = {
    findByEmail: jest.fn<Promise<StaffRecord | null>, [string]>(),
    create: jest.fn<Promise<StaffRecord>, [NewStaff]>(),
  };
  const jwtService = {
    signAsync: jest.fn<Promise<string>, [object]>(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: StaffService, useValue: staffService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
    staffService.findByEmail.mockResolvedValue(null);
    staffService.create.mockImplementation((staff) =>
      Promise.resolve(staffRecord(staff)),
    );
    jwtService.signAsync.mockResolvedValue('signed-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('signup', () => {
    it('returns the new staff member and a token for their id', async () => {
      const result = await service.signup(signupDto);

      expect(result).toEqual({
        staff: {
          id: '6718f0c2a1b2c3d4e5f60718',
          name: 'Sam Lee',
          email: 'sam@hotel.com',
        },
        token: 'signed-token',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '6718f0c2a1b2c3d4e5f60718',
      });
    });

    it('saves the email in lowercase', async () => {
      await service.signup(signupDto);

      expect(staffService.findByEmail).toHaveBeenCalledWith('sam@hotel.com');
      expect(staffService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'sam@hotel.com' }),
      );
    });

    it('saves a bcrypt hash, never the password', async () => {
      await service.signup(signupDto);

      const [{ passwordHash }] = staffService.create.mock.calls[0];
      expect(passwordHash).not.toBe(signupDto.password);
      await expect(
        bcrypt.compare(signupDto.password, passwordHash),
      ).resolves.toBe(true);
      expect(bcrypt.getRounds(passwordHash)).toBe(BCRYPT_COST);
    });

    it('does not return the password hash', async () => {
      const result = await service.signup(signupDto);

      expect(result.staff).not.toHaveProperty('passwordHash');
    });

    it('rejects an email that is already registered', async () => {
      staffService.findByEmail.mockResolvedValue(
        staffRecord({
          name: 'Other',
          email: 'sam@hotel.com',
          passwordHash: 'x',
        }),
      );

      await expect(service.signup(signupDto)).rejects.toEqual(
        new ConflictException(EMAIL_TAKEN),
      );
      expect(staffService.create).not.toHaveBeenCalled();
    });

    it('rejects the email when another sign up saves it first', async () => {
      staffService.create.mockRejectedValue({ code: 11000 });

      await expect(service.signup(signupDto)).rejects.toEqual(
        new ConflictException(EMAIL_TAKEN),
      );
    });

    it('passes on other database errors', async () => {
      const error = new Error('Database down');
      staffService.create.mockRejectedValue(error);

      await expect(service.signup(signupDto)).rejects.toBe(error);
    });
  });
});
