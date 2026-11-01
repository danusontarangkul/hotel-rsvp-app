import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatQuickReplies from './ChatQuickReplies';

const OPTIONS = ['Ask about availability', 'Book your stay'];

describe('ChatQuickReplies', () => {
  it('shows a button for each option', () => {
    render(<ChatQuickReplies options={OPTIONS} onChoose={jest.fn()} />);

    const group = screen.getByRole('group', { name: 'Suggested questions' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
    expect(
      within(group).getByRole('button', { name: 'Book your stay' }),
    ).toBeVisible();
  });

  it('passes the chosen option on', async () => {
    const onChoose = jest.fn();
    render(<ChatQuickReplies options={OPTIONS} onChoose={onChoose} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Ask about availability' }),
    );

    expect(onChoose).toHaveBeenCalledWith('Ask about availability');
  });
});
