import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CANNOT_HELP,
  CONTENT_TOO_LONG,
  LAST_MESSAGE_NOT_FROM_USER,
  MAX_MESSAGE_LENGTH,
} from './chat.constants';
import type { ChatMessage, ChatResponse } from './chat.types';

@Injectable()
export class ChatService {
  reply(messages: ChatMessage[]): ChatResponse {
    const problems = conversationProblems(messages);
    if (problems.length > 0) {
      throw new BadRequestException(problems);
    }
    return { reply: CANNOT_HELP, availabilityChanged: false };
  }
}

function conversationProblems(messages: ChatMessage[]): string[] {
  const problems: string[] = [];
  const userMessageTooLong = messages.some(
    (message) =>
      message.role === 'user' && message.content.length > MAX_MESSAGE_LENGTH,
  );
  if (userMessageTooLong) {
    problems.push(CONTENT_TOO_LONG);
  }
  if (messages.at(-1)?.role !== 'user') {
    problems.push(LAST_MESSAGE_NOT_FROM_USER);
  }
  return problems;
}
