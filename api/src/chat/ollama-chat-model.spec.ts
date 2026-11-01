import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';
import {
  CHAT_CONTEXT_TOKENS,
  CHAT_REPLY_TOKENS,
  DEFAULT_OLLAMA_HOST,
  DEFAULT_OLLAMA_MODEL,
} from './chat.constants';
import type { ModelMessage } from './chat.types';
import { OllamaChatModel } from './ollama-chat-model';

const chat = jest.fn();

jest.mock('ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({ chat })),
}));

const MockOllama = jest.mocked(Ollama);

const MESSAGES: ModelMessage[] = [
  { role: 'system', content: 'You are the booking assistant.' },
  { role: 'user', content: 'Is Nov 3 open?' },
];

afterEach(() => {
  jest.clearAllMocks();
});

describe('OllamaChatModel', () => {
  it('connects to the host and uses the model from the config', async () => {
    chat.mockResolvedValue({ message: { content: 'Hi' } });
    const model = new OllamaChatModel(
      new ConfigService({
        OLLAMA_HOST: 'http://ollama.test:11434',
        OLLAMA_MODEL: 'test-model',
      }),
    );

    await model.reply(MESSAGES);

    expect(MockOllama).toHaveBeenCalledWith({
      host: 'http://ollama.test:11434',
    });
    expect(chat).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'test-model' }),
    );
  });

  it('falls back to the default host and model', async () => {
    chat.mockResolvedValue({ message: { content: 'Hi' } });
    const model = new OllamaChatModel(new ConfigService({}));

    await model.reply(MESSAGES);

    expect(MockOllama).toHaveBeenCalledWith({ host: DEFAULT_OLLAMA_HOST });
    expect(chat).toHaveBeenCalledWith(
      expect.objectContaining({ model: DEFAULT_OLLAMA_MODEL }),
    );
  });

  it('sends the messages with thinking off and room saved for the reply', async () => {
    chat.mockResolvedValue({ message: { content: 'Hi' } });
    const model = new OllamaChatModel(new ConfigService({}));

    await model.reply(MESSAGES);

    expect(chat).toHaveBeenCalledWith({
      model: DEFAULT_OLLAMA_MODEL,
      messages: MESSAGES,
      stream: false,
      think: false,
      options: {
        num_ctx: CHAT_CONTEXT_TOKENS,
        num_predict: CHAT_REPLY_TOKENS,
      },
    });
  });

  it("returns the model's reply", async () => {
    chat.mockResolvedValue({ message: { content: 'Yes, Nov 3 is open.' } });
    const model = new OllamaChatModel(new ConfigService({}));

    await expect(model.reply(MESSAGES)).resolves.toBe('Yes, Nov 3 is open.');
  });

  it('passes on errors from Ollama unchanged', async () => {
    const failure = new TypeError('fetch failed');
    chat.mockRejectedValue(failure);
    const model = new OllamaChatModel(new ConfigService({}));

    await expect(model.reply(MESSAGES)).rejects.toBe(failure);
  });
});
