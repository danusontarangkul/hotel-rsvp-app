import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BookingsModule } from '../bookings/bookings.module';
import { CLOCK, systemClock } from '../common/clock';
import { CHAT_MODEL } from './chat.constants';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatTools } from './chat-tools';
import { OllamaChatModel } from './ollama-chat-model';

@Module({
  imports: [AuthModule, BookingsModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatTools,
    { provide: CHAT_MODEL, useClass: OllamaChatModel },
    { provide: CLOCK, useValue: systemClock },
  ],
})
export class ChatModule {}
