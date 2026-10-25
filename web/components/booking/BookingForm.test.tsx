import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/api';
import { EMPTY_SELECTION } from '@/lib/dates';
import BookingForm from './BookingForm';

const stay = { checkIn: '2026-11-08', checkOut: '2026-11-11' };

async function fillDetails() {
  await userEvent.type(screen.getByLabelText('Full name'), 'Maya Chen');
  await userEvent.type(screen.getByLabelText('Phone number'), '(555) 123-4567');
  await userEvent.type(
    screen.getByLabelText('Email address'),
    'maya.chen@example.com',
  );
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('BookingForm', () => {
  it('asks for dates and hides the guest details until both are picked', () => {
    render(
      <BookingForm
        selection={{ checkIn: '2026-11-08', checkOut: null }}
        loading={false}
        error={null}
        onBook={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Check-out')).toHaveAttribute(
      'placeholder',
      'Select date',
    );
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();
  });

  it('shows the picked dates', () => {
    render(
      <BookingForm
        selection={stay}
        loading={false}
        error={null}
        onBook={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Check-in')).toHaveValue('8 Nov 2026');
    expect(screen.getByLabelText('Check-out')).toHaveValue('11 Nov 2026');
  });

  it('shows empty dates before any are picked', () => {
    render(
      <BookingForm
        selection={EMPTY_SELECTION}
        loading={false}
        error={null}
        onBook={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Check-in')).toHaveValue('');
  });

  it('books with the guest details', async () => {
    const onBook = jest.fn();
    render(
      <BookingForm
        selection={stay}
        loading={false}
        error={null}
        onBook={onBook}
      />,
    );

    await fillDetails();
    await userEvent.click(screen.getByRole('button', { name: 'Book' }));

    expect(onBook).toHaveBeenCalledWith({
      guestName: 'Maya Chen',
      guestPhone: '5551234567',
      guestEmail: 'maya.chen@example.com',
    });
  });

  it('keeps the book button disabled until every detail is filled in', async () => {
    render(
      <BookingForm
        selection={stay}
        loading={false}
        error={null}
        onBook={jest.fn()}
      />,
    );
    const button = screen.getByRole('button', { name: 'Book' });

    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Full name'), 'Maya Chen');
    await userEvent.type(screen.getByLabelText('Phone number'), '555123456');
    await userEvent.type(screen.getByLabelText('Email address'), 'maya@x.com');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Phone number'), '7');
    await userEvent.clear(screen.getByLabelText('Email address'));
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Email address'), 'maya@x');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Email address'), '.com');
    expect(button).toBeEnabled();
  });

  it('shows a disabled loading button while booking', () => {
    render(
      <BookingForm selection={stay} loading error={null} onBook={jest.fn()} />,
    );

    const button = screen.getByRole('button', { name: 'Book' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('shows each validation message from a 400 under its field', () => {
    render(
      <BookingForm
        selection={stay}
        loading={false}
        error={
          new ApiError(400, [
            'guestEmail must be an email',
            'guestPhone should not be empty',
          ])
        }
        onBook={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'guestEmail must be an email',
    );
    expect(screen.getByLabelText('Phone number')).toHaveAccessibleDescription(
      'guestPhone should not be empty',
    );
  });

  it('shows other API errors at the bottom of the form', () => {
    render(
      <BookingForm
        selection={stay}
        loading={false}
        error={new ApiError(500, ['Internal server error'])}
        onBook={jest.fn()}
      />,
    );

    expect(screen.getByText('Internal server error')).toBeInTheDocument();
  });
});
