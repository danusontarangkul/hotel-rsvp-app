import { BadRequestException } from '@nestjs/common';
import {
  CANNOT_HELP,
  CONTENT_TOO_LONG,
  LAST_MESSAGE_NOT_FROM_USER,
  MAX_MESSAGE_LENGTH,
} from './chat.constants';
import { ChatService } from './chat.service';
import type { ChatMessage } from './chat.types';

describe('ChatService', () => {
  const service = new ChatService();

  describe('reply', () => {
    it('replies that it cannot help until the model is connected', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Is Nov 3 open?' },
      ];

      expect(service.reply(messages)).toEqual({
        reply: CANNOT_HELP,
        availabilityChanged: false,
      });
    });

    it('accepts a conversation that ends with the user', () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'How can I help you today?' },
        { role: 'user', content: 'Is Nov 3 open?' },
      ];

      expect(service.reply(messages).reply).toBe(CANNOT_HELP);
    });

    it('rejects a conversation that ends with the assistant', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
      ];

      expect(() => service.reply(messages)).toThrow(
        new BadRequestException([LAST_MESSAGE_NOT_FROM_USER]),
      );
    });

    it('rejects a user message over the length limit', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) },
      ];

      expect(() => service.reply(messages)).toThrow(
        new BadRequestException([CONTENT_TOO_LONG]),
      );
    });

    it('accepts a user message at the length limit', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'a'.repeat(MAX_MESSAGE_LENGTH) },
      ];

      expect(service.reply(messages).reply).toBe(CANNOT_HELP);
    });

    it('accepts an assistant message over the length limit', () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) },
        { role: 'user', content: 'Thanks' },
      ];

      expect(service.reply(messages).reply).toBe(CANNOT_HELP);
    });

    it('lists every problem at once', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) },
        { role: 'assistant', content: 'Hello' },
      ];

      expect(() => service.reply(messages)).toThrow(
        new BadRequestException([CONTENT_TOO_LONG, LAST_MESSAGE_NOT_FROM_USER]),
      );
    });
  });
});
