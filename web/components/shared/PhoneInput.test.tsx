import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneInput from './PhoneInput';

function ControlledPhoneInput({
  onDigits,
}: {
  onDigits: (digits: string) => void;
}) {
  const [digits, setDigits] = useState<string>('');
  return (
    <PhoneInput
      value={digits}
      onChange={(next) => {
        setDigits(next);
        onDigits(next);
      }}
    />
  );
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('PhoneInput', () => {
  it('formats the number as it is typed', async () => {
    render(<ControlledPhoneInput onDigits={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Phone number'), '1234567890');

    expect(screen.getByLabelText('Phone number')).toHaveValue('(123) 456-7890');
  });

  it('passes only the digits on', async () => {
    const onDigits = jest.fn();
    render(<ControlledPhoneInput onDigits={onDigits} />);

    await userEvent.type(screen.getByLabelText('Phone number'), '1234567890');

    expect(onDigits).toHaveBeenLastCalledWith('1234567890');
  });

  it('ignores letters', async () => {
    render(<ControlledPhoneInput onDigits={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Phone number'), '12a3');

    expect(screen.getByLabelText('Phone number')).toHaveValue('(123');
  });

  it('can be cleared with backspace', async () => {
    render(<ControlledPhoneInput onDigits={jest.fn()} />);
    const input = screen.getByLabelText('Phone number');

    await userEvent.type(input, '1234');
    await userEvent.type(input, '{Backspace}{Backspace}{Backspace}{Backspace}');

    expect(input).toHaveValue('');
  });

  it('shows the formatted placeholder', () => {
    render(<PhoneInput value="" onChange={jest.fn()} />);

    expect(screen.getByLabelText('Phone number')).toHaveAttribute(
      'placeholder',
      '(123) 456-7890',
    );
  });
});
