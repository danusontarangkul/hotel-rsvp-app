import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Clock } from '../common/clock';
import { AUDIENCE_PROMPTS } from './chat-system-prompt';
import {
  CANNOT_HELP,
  CHAT_UNAVAILABLE,
  CONTENT_TOO_LONG,
  LAST_MESSAGE_NOT_FROM_USER,
  MAX_CHAT_MESSAGES,
  MAX_MESSAGE_LENGTH,
} from './chat.constants';
import { ChatService } from './chat.service';
import type { ChatMessage, ChatModel, ModelMessage } from './chat.types';

const NOON_IN_LOS_ANGELES_ON_NOVEMBER_1 = new Date('2026-11-01T19:00:00.000Z');
const LATE_EVENING_IN_LOS_ANGELES_ON_NOVEMBER_1 = new Date(
  '2026-11-02T06:30:00.000Z',
);

const QUESTION: ChatMessage[] = [{ role: 'user', content: 'Is Nov 3 open?' }];

const modelReply = jest.fn<Promise<string>, [ModelMessage[]]>();
const model: ChatModel = { reply: modelReply };

function serviceAt(now: Date): ChatService {
  const clock: Clock = { now: () => now };
  return new ChatService(model, clock);
}

function sentMessages(): ModelMessage[] {
  return modelReply.mock.calls[0][0];
}

function sentSystemPrompt(): string {
  return sentMessages()[0].content;
}

beforeEach(() => {
  modelReply.mockResolvedValue('Yes, Nov 3 is open.');
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('ChatService', () => {
  const service = serviceAt(NOON_IN_LOS_ANGELES_ON_NOVEMBER_1);

  describe('reply', () => {
    it("returns the model's reply", async () => {
      await expect(service.reply(QUESTION)).resolves.toEqual({
        reply: 'Yes, Nov 3 is open.',
        availabilityChanged: false,
      });
    });

    it("trims spaces and line breaks around the model's reply", async () => {
      modelReply.mockResolvedValue('\n  Yes, Nov 3 is open.  \n');

      await expect(service.reply(QUESTION)).resolves.toEqual({
        reply: 'Yes, Nov 3 is open.',
        availabilityChanged: false,
      });
    });

    it('replies that it cannot help when the model replies with nothing', async () => {
      modelReply.mockResolvedValue('   ');

      await expect(service.reply(QUESTION)).resolves.toEqual({
        reply: CANNOT_HELP,
        availabilityChanged: false,
      });
    });

    it('sends the system prompt first, then the conversation', async () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'How can I help you today?' },
        { role: 'user', content: 'Is Nov 3 open?' },
      ];

      await service.reply(messages);

      expect(sentMessages()[0].role).toBe('system');
      expect(sentMessages().slice(1)).toEqual(messages);
    });

    it('tells the model the user is a guest without a staff id', async () => {
      await service.reply(QUESTION);

      expect(sentSystemPrompt()).toContain(AUDIENCE_PROMPTS.guest);
      expect(sentSystemPrompt()).not.toContain(AUDIENCE_PROMPTS.staff);
    });

    it('tells the model the user is staff with a staff id', async () => {
      await service.reply(QUESTION, '6718f0c2a1b2c3d4e5f60718');

      expect(sentSystemPrompt()).toContain(AUDIENCE_PROMPTS.staff);
      expect(sentSystemPrompt()).not.toContain(AUDIENCE_PROMPTS.guest);
    });

    it("tells the model today's date", async () => {
      await service.reply(QUESTION);

      expect(sentSystemPrompt()).toContain('Today is 2026-11-01.');
    });

    it("uses the hotel's time zone for today's date", async () => {
      await serviceAt(LATE_EVENING_IN_LOS_ANGELES_ON_NOVEMBER_1).reply(
        QUESTION,
      );

      expect(sentSystemPrompt()).toContain('Today is 2026-11-01.');
    });

    it(`sends only the last ${MAX_CHAT_MESSAGES} messages`, async () => {
      const messages: ChatMessage[] = Array.from(
        { length: MAX_CHAT_MESSAGES + 3 },
        (_, index) => ({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${index + 1}`,
        }),
      );

      await service.reply(messages);

      expect(sentMessages().slice(1)).toEqual(
        messages.slice(-MAX_CHAT_MESSAGES),
      );
    });

    it('says the chat is unavailable when Ollama is not running', async () => {
      modelReply.mockRejectedValue(new TypeError('fetch failed'));

      await expect(service.reply(QUESTION)).rejects.toEqual(
        new ServiceUnavailableException(CHAT_UNAVAILABLE),
      );
    });

    it('says the chat is unavailable when the model is not pulled', async () => {
      const notPulled = new Error('model "qwen3:8b" not found');
      notPulled.name = 'ResponseError';
      modelReply.mockRejectedValue(notPulled);

      await expect(service.reply(QUESTION)).rejects.toEqual(
        new ServiceUnavailableException(CHAT_UNAVAILABLE),
      );
    });

    it('passes on other model errors unchanged', async () => {
      const failure = new Error('Model failed');
      modelReply.mockRejectedValue(failure);

      await expect(service.reply(QUESTION)).rejects.toBe(failure);
    });

    it('rejects a conversation that ends with the assistant', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
      ];

      await expect(service.reply(messages)).rejects.toEqual(
        new BadRequestException([LAST_MESSAGE_NOT_FROM_USER]),
      );
      expect(modelReply).not.toHaveBeenCalled();
    });

    it('rejects a user message over the length limit', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) },
      ];

      await expect(service.reply(messages)).rejects.toEqual(
        new BadRequestException([CONTENT_TOO_LONG]),
      );
    });

    it('accepts a user message at the length limit', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'a'.repeat(MAX_MESSAGE_LENGTH) },
      ];

      await expect(service.reply(messages)).resolves.toEqual({
        reply: 'Yes, Nov 3 is open.',
        availabilityChanged: false,
      });
    });

    it('accepts an assistant message over the length limit', async () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) },
        { role: 'user', content: 'Thanks' },
      ];

      await expect(service.reply(messages)).resolves.toEqual({
        reply: 'Yes, Nov 3 is open.',
        availabilityChanged: false,
      });
    });

    it('lists every problem at once', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) },
        { role: 'assistant', content: 'Hello' },
      ];

      await expect(service.reply(messages)).rejects.toEqual(
        new BadRequestException([CONTENT_TOO_LONG, LAST_MESSAGE_NOT_FROM_USER]),
      );
    });
  });
});
