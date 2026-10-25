import type { ComponentProps } from 'react';
import TextInput from './TextInput';

type EmailInputProps = Omit<
  ComponentProps<typeof TextInput>,
  'type' | 'autoComplete' | 'label'
> & {
  label?: string;
};

export default function EmailInput({
  label = 'Email address',
  ...props
}: EmailInputProps) {
  return (
    <TextInput {...props} label={label} type="email" autoComplete="email" />
  );
}
