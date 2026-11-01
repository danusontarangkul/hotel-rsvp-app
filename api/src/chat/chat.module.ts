import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CLOCK, systemClock } from '../common/clock';
import { CHAT_MODEL } from './chat.constants';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OllamaChatModel } from './ollama-chat-model';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    { provide: CHAT_MODEL, useClass: OllamaChatModel },
    { provide: CLOCK, useValue: systemClock },
  ],
})
export class ChatModule {}
