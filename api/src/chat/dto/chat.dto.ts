import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { trimString } from '../../common/transforms';
import {
  CHAT_ROLES,
  CONTENT_REQUIRED,
  MESSAGES_REQUIRED,
  ROLE_INVALID,
} from '../chat.constants';
import type { ChatRole } from '../chat.types';

export class ChatMessageDto {
  @IsIn(CHAT_ROLES, { message: ROLE_INVALID })
  role: ChatRole;

  @Transform(trimString)
  @IsString({ message: CONTENT_REQUIRED })
  @IsNotEmpty({ message: CONTENT_REQUIRED })
  content: string;
}

export class ChatDto {
  @IsArray({ message: MESSAGES_REQUIRED })
  @ArrayNotEmpty({ message: MESSAGES_REQUIRED })
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
