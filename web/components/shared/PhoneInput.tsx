import type { ComponentProps } from 'react';
import { formatPhone, toPhoneDigits } from '@/lib/phone';
import TextInput from './TextInput';

type PhoneInputProps = Omit<
  ComponentProps<typeof TextInput>,
  'type' | 'autoComplete' | 'inputMode' | 'label' | 'value' | 'onChange'
> & {
  label?: string;
  value: string;
  onChange: (digits: string) => void;
};

export default function PhoneInput({
  label = 'Phone number',
  placeholder = '(123) 456-7890',
  value,
  onChange,
  ...props
}: PhoneInputProps) {
  return (
    <TextInput
      {...props}
      label={label}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={placeholder}
      value={formatPhone(value)}
      onChange={(event) => onChange(toPhoneDigits(event.target.value))}
    />
  );
}
