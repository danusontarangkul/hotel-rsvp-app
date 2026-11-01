import { act, renderHook } from '@testing-library/react';
import { sendChat } from '@/lib/api';
import { useChat } from './useChat';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  sendChat: jest.fn(),
}));

const mockSendChat = jest.mocked(sendChat);

afterEach(() => {
  jest.resetAllMocks();
});

describe('useChat', () => {
  it('sends the conversation and returns the reply', async () => {
    const input = {
      messages: [{ role: 'user' as const, content: 'Is Nov 3 open?' }],
    };
    const reply = {
      reply: 'Unfortunately, I cannot help with that.',
      availabilityChanged: false,
    };
    mockSendChat.mockResolvedValue(reply);
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.run(input);
    });

    expect(mockSendChat).toHaveBeenCalledWith(input);
    expect(result.current.data).toEqual(reply);
  });
});
