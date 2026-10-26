import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from '../../common/transforms';
import { EMAIL_REQUIRED, PASSWORD_REQUIRED } from '../auth.constants';

export class LoginDto {
  @Transform(trimString)
  @IsString({ message: EMAIL_REQUIRED })
  @IsNotEmpty({ message: EMAIL_REQUIRED })
  email: string;

  @IsString({ message: PASSWORD_REQUIRED })
  @IsNotEmpty({ message: PASSWORD_REQUIRED })
  password: string;
}
