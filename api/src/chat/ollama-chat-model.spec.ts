import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';
import { AVAILABILITY_TOOL } from './chat-tools';
import {
  CHAT_CONTEXT_TOKENS,
  CHAT_REPLY_TOKENS,
  DEFAULT_OLLAMA_HOST,
  DEFAULT_OLLAMA_MODEL,
  GET_AVAILABILITY_TOOL,
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

const STAY = { checkIn: '2026-11-03', checkOut: '2026-11-05' };

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

    await model.reply(MESSAGES, []);

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

    await model.reply(MESSAGES, []);

    expect(MockOllama).toHaveBeenCalledWith({ host: DEFAULT_OLLAMA_HOST });
    expect(chat).toHaveBeenCalledWith(
      expect.objectContaining({ model: DEFAULT_OLLAMA_MODEL }),
    );
  });

  it('sends the messages with thinking off and room saved for the reply', async () => {
    chat.mockResolvedValue({ message: { content: 'Hi' } });
    const model = new OllamaChatModel(new ConfigService({}));

    await model.reply(MESSAGES, []);

    expect(chat).toHaveBeenCalledWith({
      model: DEFAULT_OLLAMA_MODEL,
      messages: MESSAGES,
      tools: [],
      stream: false,
      think: false,
      options: {
        num_ctx: CHAT_CONTEXT_TOKENS,
        num_predict: CHAT_REPLY_TOKENS,
      },
    });
  });

  it('sends the tools in the format Ollama expects', async () => {
    chat.mockResolvedValue({ message: { content: 'Hi' } });
    const model = new OllamaChatModel(new ConfigService({}));

    await model.reply(MESSAGES, [AVAILABILITY_TOOL]);

    expect(chat).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: [
          {
            type: 'function',
            function: {
              name: GET_AVAILABILITY_TOOL,
              description: AVAILABILITY_TOOL.description,
              parameters: AVAILABILITY_TOOL.parameters,
            },
          },
        ],
      }),
    );
  });

  it('sends earlier tool calls and tool results in the format Ollama expects', async () => {
    chat.mockResolvedValue({ message: { content: 'Hi' } });
    const model = new OllamaChatModel(new ConfigService({}));

    await model.reply(
      [
        ...MESSAGES,
        {
          role: 'assistant',
          content: '',
          toolCalls: [{ name: GET_AVAILABILITY_TOOL, arguments: STAY }],
        },
        { role: 'tool', toolName: GET_AVAILABILITY_TOOL, content: '{}' },
      ],
      [],
    );

    expect(chat).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          ...MESSAGES,
          {
            role: 'assistant',
            content: '',
            tool_calls: [
              { function: { name: GET_AVAILABILITY_TOOL, arguments: STAY } },
            ],
          },
          { role: 'tool', tool_name: GET_AVAILABILITY_TOOL, content: '{}' },
        ],
      }),
    );
  });

  it("returns the model's reply with no tool calls", async () => {
    chat.mockResolvedValue({ message: { content: 'Yes, Nov 3 is open.' } });
    const model = new OllamaChatModel(new ConfigService({}));

    await expect(model.reply(MESSAGES, [])).resolves.toEqual({
      content: 'Yes, Nov 3 is open.',
      toolCalls: [],
    });
  });

  it('returns the tools the model asks for', async () => {
    chat.mockResolvedValue({
      message: {
        content: '',
        tool_calls: [
          { function: { name: GET_AVAILABILITY_TOOL, arguments: STAY } },
        ],
      },
    });
    const model = new OllamaChatModel(new ConfigService({}));

    await expect(model.reply(MESSAGES, [AVAILABILITY_TOOL])).resolves.toEqual({
      content: '',
      toolCalls: [{ name: GET_AVAILABILITY_TOOL, arguments: STAY }],
    });
  });

  it('passes on errors from Ollama unchanged', async () => {
    const failure = new TypeError('fetch failed');
    chat.mockRejectedValue(failure);
    const model = new OllamaChatModel(new ConfigService({}));

    await expect(model.reply(MESSAGES, [])).rejects.toBe(failure);
  });
});
