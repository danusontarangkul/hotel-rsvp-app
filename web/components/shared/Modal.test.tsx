import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

function renderModal(onClose: () => void, closeDisabled = false) {
  return render(
    <Modal
      title="Booking confirmed"
      onClose={onClose}
      closeDisabled={closeDisabled}
      actions={<button type="button">Done</button>}
    >
      Booking K7Q2MX
    </Modal>,
  );
}

describe('Modal', () => {
  it('shows a dialog named by its title with its content and actions', () => {
    renderModal(jest.fn());

    const dialog = screen.getByRole('dialog', { name: 'Booking confirmed' });
    expect(dialog).toHaveTextContent('Booking K7Q2MX');
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('closes with the close button', async () => {
    const onClose = jest.fn();
    renderModal(onClose);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with Escape', async () => {
    const onClose = jest.fn();
    renderModal(onClose);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with a click outside', async () => {
    const onClose = jest.fn();
    renderModal(onClose);

    await userEvent.click(screen.getByRole('dialog').parentElement!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close from a click inside', async () => {
    const onClose = jest.fn();
    renderModal(onClose);

    await userEvent.click(screen.getByText('Booking K7Q2MX'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close with Escape while closing is disabled', async () => {
    const onClose = jest.fn();
    renderModal(onClose, true);

    await userEvent.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  });
});
