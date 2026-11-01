import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatComposer from './ChatComposer';
import { MAX_MESSAGE_LENGTH } from './chatLimits';

describe('ChatComposer', () => {
  it('sends the typed message', async () => {
    const onSend = jest.fn();
    render(<ChatComposer onSend={onSend} />);

    await userEvent.type(screen.getByLabelText('Message'), 'Is Nov 3 open?');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSend).toHaveBeenCalledWith('Is Nov 3 open?');
  });

  it('clears the input after sending', async () => {
    render(<ChatComposer onSend={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Message'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByLabelText('Message')).toHaveValue('');
  });

  it('sends the message when Enter is pressed', async () => {
    const onSend = jest.fn();
    render(<ChatComposer onSend={onSend} />);

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('shows placeholder text in the empty message box', () => {
    render(<ChatComposer onSend={jest.fn()} />);

    expect(
      screen.getByPlaceholderText('Ask about dates or booking'),
    ).toBeInTheDocument();
  });

  it('stops typing at the message length limit', async () => {
    render(<ChatComposer onSend={jest.fn()} />);

    await userEvent.type(
      screen.getByLabelText('Message'),
      'a'.repeat(MAX_MESSAGE_LENGTH + 10),
    );

    expect(screen.getByLabelText('Message')).toHaveValue(
      'a'.repeat(MAX_MESSAGE_LENGTH),
    );
  });

  it('marks Send busy while sending', () => {
    render(<ChatComposer onSend={jest.fn()} sending />);

    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toHaveAttribute('aria-busy', 'true');
    expect(send).toBeDisabled();
  });

  it('does not send another message while sending', async () => {
    const onSend = jest.fn();
    render(<ChatComposer onSend={onSend} sending />);

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('shows the errors it is given', () => {
    render(
      <ChatComposer onSend={jest.fn()} errors={['Chat is unavailable.']} />,
    );

    expect(screen.getByText('Chat is unavailable.')).toBeVisible();
  });

  it('disables Send until a message is typed', () => {
    render(<ChatComposer onSend={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('does not send a message of only spaces', async () => {
    const onSend = jest.fn();
    render(<ChatComposer onSend={onSend} />);

    await userEvent.type(screen.getByLabelText('Message'), '   {Enter}');

    expect(onSend).not.toHaveBeenCalled();
  });
});
