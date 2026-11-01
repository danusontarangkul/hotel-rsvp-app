import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';
import {
  CHAT_CONTEXT_TOKENS,
  CHAT_REPLY_TOKENS,
  DEFAULT_OLLAMA_HOST,
  DEFAULT_OLLAMA_MODEL,
} from './chat.constants';
import type { ChatModel, ModelMessage } from './chat.types';

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

  async reply(messages: ModelMessage[]): Promise<string> {
    const response = await this.client.chat({
      model: this.model,
      messages,
      stream: false,
      think: false,
      options: {
        num_ctx: CHAT_CONTEXT_TOKENS,
        num_predict: CHAT_REPLY_TOKENS,
      },
    });
    return response.message.content;
  }
}
