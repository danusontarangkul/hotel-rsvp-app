import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { OptionalStaffId } from '../auth/optional-staff-id.decorator';
import { ChatService } from './chat.service';
import type { ChatResponse } from './chat.types';
import { ChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  reply(
    @Body() dto: ChatDto,
    @OptionalStaffId() staffId: string | undefined,
  ): Promise<ChatResponse> {
    return this.chatService.reply(dto.messages, staffId);
  }
}
