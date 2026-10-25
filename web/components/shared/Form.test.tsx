import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Form from './Form';

describe('Form', () => {
  it('calls onSubmit when submitted', async () => {
    const onSubmit = jest.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(
      <Form onSubmit={onSubmit} actions={<button type="submit">Send</button>}>
        <input aria-label="Name" />
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows each form error', () => {
    render(
      <Form
        onSubmit={jest.fn()}
        actions={<button type="submit">Send</button>}
        errors={['Wrong email or password', 'Try again later']}
      >
        <input aria-label="Name" />
      </Form>,
    );

    expect(screen.getByText('Wrong email or password')).toBeInTheDocument();
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('shows the form errors after the actions', () => {
    render(
      <Form
        onSubmit={jest.fn()}
        actions={<button type="submit">Send</button>}
        errors={['Wrong email or password']}
      >
        <input aria-label="Name" />
      </Form>,
    );

    const button = screen.getByRole('button', { name: 'Send' });
    const error = screen.getByText('Wrong email or password');
    expect(
      button.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
