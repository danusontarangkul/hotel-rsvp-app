import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { trimString } from '../../common/transforms';
import {
  EMAIL_INVALID,
  MIN_PASSWORD_LENGTH,
  NAME_REQUIRED,
  PASSWORD_TOO_SHORT,
} from '../auth.constants';

export class SignupDto {
  @Transform(trimString)
  @IsString({ message: NAME_REQUIRED })
  @IsNotEmpty({ message: NAME_REQUIRED })
  name: string;

  @Transform(trimString)
  @IsString({ message: EMAIL_INVALID })
  @IsEmail({}, { message: EMAIL_INVALID })
  email: string;

  @IsString({ message: PASSWORD_TOO_SHORT })
  @MinLength(MIN_PASSWORD_LENGTH, { message: PASSWORD_TOO_SHORT })
  password: string;
}
