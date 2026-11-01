import { render, screen } from '@testing-library/react';
import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('shows the message text', () => {
    render(
      <ul>
        <ChatMessage role="assistant" content="Hello there" />
      </ul>,
    );

    expect(screen.getByRole('listitem')).toHaveTextContent('Hello there');
  });

  it('names the guest as the sender of their own message', () => {
    render(
      <ul>
        <ChatMessage role="user" content="Is Nov 3 open?" />
      </ul>,
    );

    expect(screen.getByRole('listitem')).toHaveTextContent(
      'You: Is Nov 3 open?',
    );
  });

  it('names the assistant as the sender of its reply', () => {
    render(
      <ul>
        <ChatMessage role="assistant" content="Yes, it is." />
      </ul>,
    );

    expect(screen.getByRole('listitem')).toHaveTextContent(
      'Assistant: Yes, it is.',
    );
  });
});
