import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsISO8601,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import {
  DATE_ONLY_PATTERN,
  EMAIL_INVALID,
  NAME_REQUIRED,
} from '../../common/constants';
import { trimString } from '../../common/transforms';
import {
  CHECK_IN_INVALID,
  CHECK_OUT_INVALID,
  PHONE_REQUIRED,
} from '../bookings.constants';

export class CreateBookingDto {
  @Transform(trimString)
  @IsString({ message: NAME_REQUIRED })
  @IsNotEmpty({ message: NAME_REQUIRED })
  guestName: string;

  @Transform(trimString)
  @IsString({ message: EMAIL_INVALID })
  @IsEmail({}, { message: EMAIL_INVALID })
  guestEmail: string;

  @Transform(trimString)
  @IsString({ message: PHONE_REQUIRED })
  @IsNotEmpty({ message: PHONE_REQUIRED })
  guestPhone: string;

  @IsString({ message: CHECK_IN_INVALID })
  @Matches(DATE_ONLY_PATTERN, { message: CHECK_IN_INVALID })
  @IsISO8601({ strict: true }, { message: CHECK_IN_INVALID })
  checkIn: string;

  @IsString({ message: CHECK_OUT_INVALID })
  @Matches(DATE_ONLY_PATTERN, { message: CHECK_OUT_INVALID })
  @IsISO8601({ strict: true }, { message: CHECK_OUT_INVALID })
  checkOut: string;
}
