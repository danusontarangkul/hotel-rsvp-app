import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from './ChatWidget';

describe('ChatWidget', () => {
  it('starts minimized', () => {
    render(<ChatWidget />);

    expect(screen.getByRole('button', { name: 'Open chat' })).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Chat' }),
    ).not.toBeInTheDocument();
  });

  it('opens the chat with the greeting', async () => {
    render(<ChatWidget />);

    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(screen.getByRole('region', { name: 'Chat' })).toBeVisible();
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'How can I help you today?',
    );
  });

  it('adds a sent message to the chat', async () => {
    render(<ChatWidget />);

    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    await userEvent.type(
      screen.getByLabelText('Message'),
      'Is Nov 3 open?{Enter}',
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent('Is Nov 3 open?');
  });

  it('minimizes the chat', async () => {
    render(<ChatWidget />);

    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Minimize chat' }),
    );

    expect(
      screen.queryByRole('region', { name: 'Chat' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open chat' })).toBeVisible();
  });

  it('keeps the messages after minimizing and opening again', async () => {
    render(<ChatWidget />);

    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await userEvent.click(
      screen.getByRole('button', { name: 'Minimize chat' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Hello');
  });
});
