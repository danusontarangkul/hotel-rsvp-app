import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Clock } from '../common/clock';
import { AUDIENCE_PROMPTS } from './chat-system-prompt';
import { CHAT_TOOLS, type ChatTools } from './chat-tools';
import {
  CANNOT_HELP,
  CHAT_UNAVAILABLE,
  CONTENT_TOO_LONG,
  CREATE_BOOKING_TOOL,
  GET_AVAILABILITY_TOOL,
  LAST_MESSAGE_NOT_FROM_USER,
  MAX_CHAT_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_TOOL_ROUNDS,
} from './chat.constants';
import { ChatService } from './chat.service';
import type {
  ChatMessage,
  ChatModel,
  ModelMessage,
  ModelReply,
  ModelTool,
  ModelToolCall,
  ToolOutcome,
} from './chat.types';

const NOON_IN_LOS_ANGELES_ON_NOVEMBER_1 = new Date('2026-11-01T19:00:00.000Z');
const LATE_EVENING_IN_LOS_ANGELES_ON_NOVEMBER_1 = new Date(
  '2026-11-02T06:30:00.000Z',
);

const QUESTION: ChatMessage[] = [{ role: 'user', content: 'Is Nov 3 open?' }];

const AVAILABILITY_CALL: ModelToolCall = {
  name: GET_AVAILABILITY_TOOL,
  arguments: { checkIn: '2026-11-03', checkOut: '2026-11-05' },
};

const TOOL_RESULT = '{"stay":{"available":true}}';

const modelReply = jest.fn<
  Promise<ModelReply>,
  [ModelMessage[], ModelTool[]]
>();
const model: ChatModel = { reply: modelReply };

const runTool = jest.fn<Promise<ToolOutcome>, [ModelToolCall]>();
const tools = { run: runTool } as unknown as ChatTools;

const BOOKING_CALL: ModelToolCall = {
  name: CREATE_BOOKING_TOOL,
  arguments: { checkIn: '2026-11-03', checkOut: '2026-11-05' },
};

function text(content: string): ModelReply {
  return { content, toolCalls: [] };
}

function toolCall(call: ModelToolCall): ModelReply {
  return { content: '', toolCalls: [call] };
}

function serviceAt(now: Date): ChatService {
  const clock: Clock = { now: () => now };
  return new ChatService(model, clock, tools);
}

function sentMessages(call = 0): ModelMessage[] {
  return modelReply.mock.calls[call][0];
}

function sentTools(call = 0): ModelTool[] {
  return modelReply.mock.calls[call][1];
}

function sentSystemPrompt(): string {
  return sentMessages()[0].content;
}

beforeEach(() => {
  modelReply.mockResolvedValue(text('Yes, Nov 3 is open.'));
  runTool.mockResolvedValue({
    content: TOOL_RESULT,
    availabilityChanged: false,
  });
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
      modelReply.mockResolvedValue(text('\n  Yes, Nov 3 is open.  \n'));

      await expect(service.reply(QUESTION)).resolves.toEqual({
        reply: 'Yes, Nov 3 is open.',
        availabilityChanged: false,
      });
    });

    it('replies that it cannot help when the model replies with nothing', async () => {
      modelReply.mockResolvedValue(text('   '));

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

    it('gives the model the chat tools', async () => {
      await service.reply(QUESTION);

      expect(sentTools()).toEqual(CHAT_TOOLS);
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

    describe('tools', () => {
      it('runs a tool the model asks for', async () => {
        modelReply
          .mockResolvedValueOnce(toolCall(AVAILABILITY_CALL))
          .mockResolvedValueOnce(text('Yes, Nov 3 to Nov 5 is open.'));

        await service.reply(QUESTION);

        expect(runTool).toHaveBeenCalledWith(
          AVAILABILITY_CALL,
          'Is Nov 3 open?',
        );
      });

      it('sends the tool call and its result back to the model', async () => {
        modelReply
          .mockResolvedValueOnce(toolCall(AVAILABILITY_CALL))
          .mockResolvedValueOnce(text('Yes, Nov 3 to Nov 5 is open.'));

        await service.reply(QUESTION);

        expect(sentMessages(1).slice(-2)).toEqual([
          { role: 'assistant', content: '', toolCalls: [AVAILABILITY_CALL] },
          {
            role: 'tool',
            toolName: GET_AVAILABILITY_TOOL,
            content: TOOL_RESULT,
          },
        ]);
      });

      it('returns the reply the model gives after the tool', async () => {
        modelReply
          .mockResolvedValueOnce(toolCall(AVAILABILITY_CALL))
          .mockResolvedValueOnce(text('Yes, Nov 3 to Nov 5 is open.'));

        await expect(service.reply(QUESTION)).resolves.toEqual({
          reply: 'Yes, Nov 3 to Nov 5 is open.',
          availabilityChanged: false,
        });
      });

      it('runs every tool the model asks for in one turn', async () => {
        const secondCall: ModelToolCall = {
          name: GET_AVAILABILITY_TOOL,
          arguments: { checkIn: '2026-11-10', checkOut: '2026-11-12' },
        };
        modelReply
          .mockResolvedValueOnce({
            content: '',
            toolCalls: [AVAILABILITY_CALL, secondCall],
          })
          .mockResolvedValueOnce(text('Both stays are open.'));

        await service.reply(QUESTION);

        expect(runTool).toHaveBeenCalledTimes(2);
        expect(runTool).toHaveBeenLastCalledWith(secondCall, 'Is Nov 3 open?');
      });

      it("gives tools only the guest's own messages as what they typed", async () => {
        const messages: ChatMessage[] = [
          { role: 'user', content: 'Book Nov 3 to Nov 5' },
          {
            role: 'assistant',
            content: 'Sure, Guest Name, guest@example.com?',
          },
          { role: 'user', content: 'Ana Lopez, ana@example.com, 5550100123' },
        ];
        modelReply
          .mockResolvedValueOnce(toolCall(BOOKING_CALL))
          .mockResolvedValueOnce(text('You are booked.'));

        await service.reply(messages);

        expect(runTool).toHaveBeenCalledWith(
          BOOKING_CALL,
          'Book Nov 3 to Nov 5\nAna Lopez, ana@example.com, 5550100123',
        );
      });

      it(`asks for a final answer without tools after ${MAX_TOOL_ROUNDS} rounds`, async () => {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
          modelReply.mockResolvedValueOnce(toolCall(AVAILABILITY_CALL));
        }
        modelReply.mockResolvedValueOnce(text('Nov 3 to Nov 5 is open.'));

        await expect(service.reply(QUESTION)).resolves.toEqual({
          reply: 'Nov 3 to Nov 5 is open.',
          availabilityChanged: false,
        });
        expect(runTool).toHaveBeenCalledTimes(MAX_TOOL_ROUNDS);
        expect(sentTools(MAX_TOOL_ROUNDS)).toEqual([]);
      });

      it("replies with a tool's final reply without asking the model again", async () => {
        runTool.mockResolvedValueOnce({
          content: TOOL_RESULT,
          availabilityChanged: false,
          finalReply: 'The night of Friday, November 6, 2026 is available.',
        });
        modelReply.mockResolvedValueOnce(toolCall(AVAILABILITY_CALL));

        await expect(service.reply(QUESTION)).resolves.toEqual({
          reply: 'The night of Friday, November 6, 2026 is available.',
          availabilityChanged: false,
        });
        expect(modelReply).toHaveBeenCalledTimes(1);
      });

      it('joins the final replies of every tool in the round', async () => {
        runTool
          .mockResolvedValueOnce({
            content: TOOL_RESULT,
            availabilityChanged: false,
            finalReply: 'The night of Friday, November 6, 2026 is available.',
          })
          .mockResolvedValueOnce({
            content: TOOL_RESULT,
            availabilityChanged: false,
            finalReply:
              'The night of Friday, November 20, 2026 is already booked.',
          });
        modelReply.mockResolvedValueOnce({
          content: '',
          toolCalls: [AVAILABILITY_CALL, AVAILABILITY_CALL],
        });

        const response = await service.reply(QUESTION);

        expect(response.reply).toBe(
          'The night of Friday, November 6, 2026 is available. The night of Friday, November 20, 2026 is already booked.',
        );
      });

      it('says availability changed when a tool booked a stay', async () => {
        runTool.mockResolvedValueOnce({
          content: '{"bookingNumber":"K7Q2MX"}',
          availabilityChanged: true,
        });
        modelReply
          .mockResolvedValueOnce(toolCall(BOOKING_CALL))
          .mockResolvedValueOnce(text('You are booked.'));

        await expect(service.reply(QUESTION)).resolves.toEqual({
          reply: 'You are booked.',
          availabilityChanged: true,
        });
      });

      it('keeps availability changed after a later tool round that changes nothing', async () => {
        runTool.mockResolvedValueOnce({
          content: '{"bookingNumber":"K7Q2MX"}',
          availabilityChanged: true,
        });
        modelReply
          .mockResolvedValueOnce(toolCall(BOOKING_CALL))
          .mockResolvedValueOnce(toolCall(AVAILABILITY_CALL))
          .mockResolvedValueOnce(text('You are booked.'));

        const response = await service.reply(QUESTION);

        expect(response.availabilityChanged).toBe(true);
      });
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
