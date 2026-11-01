import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { ChatService } from './chat.service';
import type { ChatResponse } from './chat.types';
import { ChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  reply(@Body() dto: ChatDto): ChatResponse {
    return this.chatService.reply(dto.messages);
  }
}
