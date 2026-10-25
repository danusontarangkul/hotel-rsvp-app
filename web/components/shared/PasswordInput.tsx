import { useState, type ComponentProps } from 'react';
import Button from './Button';
import TextInput from './TextInput';
import { EyeIcon, EyeOffIcon } from './icons';

type PasswordInputProps = Omit<
  ComponentProps<typeof TextInput>,
  'type' | 'trailing'
>;

export default function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState<boolean>(false);
  return (
    <TextInput
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <Button
          variant="icon"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </Button>
      }
    />
  );
}
