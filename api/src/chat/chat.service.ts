import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import { HOTEL_TIME_ZONE } from '../common/constants';
import { todayIn } from '../common/dates';
import { trimText } from '../common/text';
import { buildSystemPrompt } from './build-system-prompt';
import {
  CANNOT_HELP,
  CHAT_MODEL,
  CHAT_UNAVAILABLE,
  CONTENT_TOO_LONG,
  LAST_MESSAGE_NOT_FROM_USER,
  MAX_CHAT_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_TOOL_ROUNDS,
} from './chat.constants';
import { CHAT_TOOLS, ChatTools } from './chat-tools';
import type {
  ChatAudience,
  ChatMessage,
  ChatModel,
  ChatResponse,
  ModelMessage,
  ModelReply,
  ModelTool,
  ModelToolCall,
} from './chat.types';
import { isModelUnavailable } from './model-errors';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_MODEL) private readonly model: ChatModel,
    @Inject(CLOCK) private readonly clock: Clock,
    private readonly tools: ChatTools,
  ) {}

  async reply(
    messages: ChatMessage[],
    staffId?: string,
  ): Promise<ChatResponse> {
    const problems = conversationProblems(messages);
    if (problems.length > 0) {
      throw new BadRequestException(problems);
    }
    const audience: ChatAudience = staffId === undefined ? 'guest' : 'staff';
    const reply = trimText(
      await this.answer(this.modelMessages(messages, audience)),
    );
    return {
      reply: reply === '' ? CANNOT_HELP : reply,
      availabilityChanged: false,
    };
  }

  private async answer(messages: ModelMessage[]): Promise<string> {
    let conversation = messages;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const reply = await this.modelReply(conversation, CHAT_TOOLS);
      if (reply.toolCalls.length === 0) {
        return reply.content;
      }
      conversation = [
        ...conversation,
        {
          role: 'assistant',
          content: reply.content,
          toolCalls: reply.toolCalls,
        },
        ...(await this.toolResults(reply.toolCalls)),
      ];
    }
    const finalReply = await this.modelReply(conversation, []);
    return finalReply.content;
  }

  private async toolResults(calls: ModelToolCall[]): Promise<ModelMessage[]> {
    const results: ModelMessage[] = [];
    for (const call of calls) {
      results.push({
        role: 'tool',
        toolName: call.name,
        content: await this.tools.run(call),
      });
    }
    return results;
  }

  private async modelReply(
    messages: ModelMessage[],
    tools: ModelTool[],
  ): Promise<ModelReply> {
    try {
      return await this.model.reply(messages, tools);
    } catch (error) {
      if (isModelUnavailable(error)) {
        throw new ServiceUnavailableException(CHAT_UNAVAILABLE);
      }
      throw error;
    }
  }

  private modelMessages(
    messages: ChatMessage[],
    audience: ChatAudience,
  ): ModelMessage[] {
    const today = todayIn(HOTEL_TIME_ZONE, this.clock.now());
    return [
      { role: 'system', content: buildSystemPrompt(audience, today) },
      ...messages.slice(-MAX_CHAT_MESSAGES),
    ];
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
