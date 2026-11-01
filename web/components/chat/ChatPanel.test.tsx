import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPanel from './ChatPanel';

const MESSAGES = [
  { role: 'assistant' as const, content: 'How can I help you today?' },
  { role: 'user' as const, content: 'Is Nov 3 open?' },
];

describe('ChatPanel', () => {
  it('shows each message as its own bubble', () => {
    render(
      <ChatPanel
        messages={MESSAGES}
        onSend={jest.fn()}
        onMinimize={jest.fn()}
      />,
    );

    const list = screen.getByRole('list', { name: 'Messages' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows the messages in order', () => {
    render(
      <ChatPanel
        messages={MESSAGES}
        onSend={jest.fn()}
        onMinimize={jest.fn()}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('How can I help you today?');
    expect(items[1]).toHaveTextContent('Is Nov 3 open?');
  });

  it('minimizes when the minimize button is clicked', async () => {
    const onMinimize = jest.fn();
    render(
      <ChatPanel
        messages={MESSAGES}
        onSend={jest.fn()}
        onMinimize={onMinimize}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Minimize chat' }),
    );

    expect(onMinimize).toHaveBeenCalledTimes(1);
  });

  it('shows the typing indicator after the messages while sending', () => {
    render(
      <ChatPanel
        messages={MESSAGES}
        onSend={jest.fn()}
        onMinimize={jest.fn()}
        sending
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[2]).toContainElement(
      screen.getByRole('status', { name: 'Assistant is typing' }),
    );
  });

  it('hides the typing indicator when not sending', () => {
    render(
      <ChatPanel
        messages={MESSAGES}
        onSend={jest.fn()}
        onMinimize={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('status', { name: 'Assistant is typing' }),
    ).not.toBeInTheDocument();
  });

  it('shows the suggested questions it is given', async () => {
    const onQuickReply = jest.fn();
    render(
      <ChatPanel
        messages={MESSAGES}
        onSend={jest.fn()}
        onMinimize={jest.fn()}
        quickReplies={['Ask about availability']}
        onQuickReply={onQuickReply}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Ask about availability' }),
    );

    expect(onQuickReply).toHaveBeenCalledWith('Ask about availability');
  });

  it('hides suggested questions when there are none', () => {
    render(
      <ChatPanel
        messages={MESSAGES}
        onSend={jest.fn()}
        onMinimize={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('group', { name: 'Suggested questions' }),
    ).not.toBeInTheDocument();
  });

  it('sends a typed message', async () => {
    const onSend = jest.fn();
    render(
      <ChatPanel messages={MESSAGES} onSend={onSend} onMinimize={jest.fn()} />,
    );

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(onSend).toHaveBeenCalledWith('Hello');
  });
});
