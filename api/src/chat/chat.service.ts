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
  ModelAnswer,
  ModelMessage,
  ModelReply,
  ModelTool,
  ModelToolCall,
  ToolRound,
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
    const recent = messages.slice(-MAX_CHAT_MESSAGES);
    const answer = await this.answer(
      this.modelMessages(recent, audience),
      typedByGuest(recent),
    );
    const reply = trimText(answer.content);
    return {
      reply: reply === '' ? CANNOT_HELP : reply,
      availabilityChanged: answer.availabilityChanged,
    };
  }

  private async answer(
    messages: ModelMessage[],
    guestTyped: string,
  ): Promise<ModelAnswer> {
    let conversation = messages;
    let availabilityChanged = false;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const reply = await this.modelReply(conversation, CHAT_TOOLS);
      if (reply.toolCalls.length === 0) {
        return { content: reply.content, availabilityChanged };
      }
      const results = await this.toolResults(reply.toolCalls, guestTyped);
      availabilityChanged ||= results.availabilityChanged;
      if (results.finalReplies.length > 0) {
        return { content: results.finalReplies.join(' '), availabilityChanged };
      }
      conversation = [
        ...conversation,
        {
          role: 'assistant',
          content: reply.content,
          toolCalls: reply.toolCalls,
        },
        ...results.messages,
      ];
    }
    const finalReply = await this.modelReply(conversation, []);
    return { content: finalReply.content, availabilityChanged };
  }

  private async toolResults(
    calls: ModelToolCall[],
    guestTyped: string,
  ): Promise<ToolRound> {
    const messages: ModelMessage[] = [];
    const finalReplies: string[] = [];
    let availabilityChanged = false;
    for (const call of calls) {
      const outcome = await this.tools.run(call, guestTyped);
      availabilityChanged ||= outcome.availabilityChanged;
      if (outcome.finalReply) {
        finalReplies.push(outcome.finalReply);
      }
      messages.push({
        role: 'tool',
        toolName: call.name,
        content: outcome.content,
      });
    }
    return { messages, finalReplies, availabilityChanged };
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
      ...messages,
    ];
  }
}

function typedByGuest(messages: ChatMessage[]): string {
  return messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .join('\n');
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
