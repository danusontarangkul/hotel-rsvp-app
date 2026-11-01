import { render, screen } from '@testing-library/react';
import ChatTypingIndicator from './ChatTypingIndicator';

describe('ChatTypingIndicator', () => {
  it('tells screen readers the assistant is typing', () => {
    render(
      <ul>
        <ChatTypingIndicator />
      </ul>,
    );

    expect(
      screen.getByRole('status', { name: 'Assistant is typing' }),
    ).toBeInTheDocument();
  });

  it('shows as a bubble in the message list', () => {
    render(
      <ul>
        <ChatTypingIndicator />
      </ul>,
    );

    expect(screen.getByRole('listitem')).toContainElement(
      screen.getByRole('status', { name: 'Assistant is typing' }),
    );
  });
});
