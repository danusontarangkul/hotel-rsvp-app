import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, sendChat } from '@/lib/api';
import ChatWidget from './ChatWidget';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  sendChat: jest.fn(),
}));

const mockSendChat = jest.mocked(sendChat);

const REPLY = 'Unfortunately, I cannot help with that.';

beforeEach(() => {
  mockSendChat.mockResolvedValue({ reply: REPLY, availabilityChanged: false });
});

afterEach(() => {
  jest.resetAllMocks();
});

async function openChat() {
  render(<ChatWidget />);
  await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));
}

describe('ChatWidget', () => {
  it('starts minimized', () => {
    render(<ChatWidget />);

    expect(screen.getByRole('button', { name: 'Open chat' })).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Chat' }),
    ).not.toBeInTheDocument();
  });

  it('opens the chat with the greeting', async () => {
    await openChat();

    expect(screen.getByRole('region', { name: 'Chat' })).toBeVisible();
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'How can I help you today?',
    );
  });

  it('adds a sent message to the chat', async () => {
    await openChat();

    await userEvent.type(
      screen.getByLabelText('Message'),
      'Is Nov 3 open?{Enter}',
    );

    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent(
      'Is Nov 3 open?',
    );
  });

  it('sends the whole conversation to the API', async () => {
    await openChat();

    await userEvent.type(
      screen.getByLabelText('Message'),
      'Is Nov 3 open?{Enter}',
    );

    expect(mockSendChat).toHaveBeenCalledWith({
      messages: [
        { role: 'assistant', content: 'How can I help you today?' },
        { role: 'user', content: 'Is Nov 3 open?' },
      ],
    });
  });

  it('shows the reply after the sent message', async () => {
    await openChat();

    await userEvent.type(
      screen.getByLabelText('Message'),
      'Is Nov 3 open?{Enter}',
    );

    await screen.findByText(REPLY, { exact: false });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[2]).toHaveTextContent(`Assistant: ${REPLY}`);
  });

  it('shows the typing indicator while waiting for the reply', async () => {
    mockSendChat.mockReturnValue(new Promise(() => {}));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(
      screen.getByRole('status', { name: 'Assistant is typing' }),
    ).toBeInTheDocument();
  });

  it('replaces the typing indicator with the reply', async () => {
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await screen.findByText(REPLY, { exact: false });

    expect(
      screen.queryByRole('status', { name: 'Assistant is typing' }),
    ).not.toBeInTheDocument();
  });

  it('hides the typing indicator when sending fails', async () => {
    mockSendChat.mockRejectedValue(new ApiError(503, ['Chat is unavailable.']));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await screen.findByText('Chat is unavailable.');

    expect(
      screen.queryByRole('status', { name: 'Assistant is typing' }),
    ).not.toBeInTheDocument();
  });

  it('marks Send busy while waiting for the reply', async () => {
    mockSendChat.mockReturnValue(new Promise(() => {}));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('shows the API message and keeps the sent message when sending fails', async () => {
    mockSendChat.mockRejectedValue(new ApiError(503, ['Chat is unavailable.']));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(await screen.findByText('Chat is unavailable.')).toBeVisible();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent('Hello');
  });

  it('minimizes the chat', async () => {
    await openChat();

    await userEvent.click(
      screen.getByRole('button', { name: 'Minimize chat' }),
    );

    expect(
      screen.queryByRole('region', { name: 'Chat' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open chat' })).toBeVisible();
  });

  it('keeps the messages after minimizing and opening again', async () => {
    await openChat();
    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await screen.findByText(REPLY, { exact: false });

    await userEvent.click(
      screen.getByRole('button', { name: 'Minimize chat' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Hello');
  });
});
