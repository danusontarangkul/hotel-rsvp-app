import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is marked busy while loading', () => {
    render(<Button loading>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('is disabled while loading even when disabled is false', () => {
    render(
      <Button loading disabled={false}>
        Save
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('does not call onClick while loading', async () => {
    const onClick = jest.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('is disabled when disabled is set', () => {
    render(<Button disabled>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
