import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama, type Message, type Tool, type ToolCall } from 'ollama';
import {
  CHAT_CONTEXT_TOKENS,
  CHAT_REPLY_TOKENS,
  DEFAULT_OLLAMA_HOST,
  DEFAULT_OLLAMA_MODEL,
} from './chat.constants';
import type {
  ChatModel,
  ModelMessage,
  ModelReply,
  ModelTool,
  ModelToolCall,
} from './chat.types';

@Injectable()
export class OllamaChatModel implements ChatModel {
  private readonly client: Ollama;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.client = new Ollama({
      host: config.get<string>('OLLAMA_HOST') ?? DEFAULT_OLLAMA_HOST,
    });
    this.model = config.get<string>('OLLAMA_MODEL') ?? DEFAULT_OLLAMA_MODEL;
  }

  async reply(
    messages: ModelMessage[],
    tools: ModelTool[],
  ): Promise<ModelReply> {
    const response = await this.client.chat({
      model: this.model,
      messages: messages.map(toOllamaMessage),
      tools: tools.map(toOllamaTool),
      stream: false,
      think: false,
      options: {
        num_ctx: CHAT_CONTEXT_TOKENS,
        num_predict: CHAT_REPLY_TOKENS,
      },
    });
    return {
      content: response.message.content,
      toolCalls: (response.message.tool_calls ?? []).map(fromOllamaToolCall),
    };
  }
}

function toOllamaMessage(message: ModelMessage): Message {
  return {
    role: message.role,
    content: message.content,
    ...(message.toolCalls && {
      tool_calls: message.toolCalls.map(toOllamaToolCall),
    }),
    ...(message.toolName && { tool_name: message.toolName }),
  };
}

function toOllamaToolCall(call: ModelToolCall): ToolCall {
  return { function: { name: call.name, arguments: call.arguments } };
}

function fromOllamaToolCall(call: ToolCall): ModelToolCall {
  return { name: call.function.name, arguments: call.function.arguments };
}

function toOllamaTool(tool: ModelTool): Tool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  };
}
