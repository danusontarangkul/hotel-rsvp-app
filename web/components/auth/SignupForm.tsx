'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import Form from '@/components/shared/Form';
import PasswordInput from '@/components/shared/PasswordInput';
import TextInput from '@/components/shared/TextInput';
import { ArrowRightIcon } from '@/components/shared/icons';
import { useSignup } from '@/hooks/useSignup';
import { toFormErrors } from '@/lib/form-errors';
import {
  isFilled,
  isValidEmail,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  PASSWORD_TOO_SHORT_MESSAGE,
} from '@/lib/validation';

const FIELDS = ['name', 'email', 'password'] as const;

export default function SignupForm() {
  const router = useRouter();
  const { run, loading, error, data } = useSignup();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

  const canSubmit =
    isFilled(name) && isValidEmail(email) && isValidPassword(password);
  const errors = toFormErrors(error, FIELDS, { 409: 'email' });
  const passwordTooShort =
    passwordTouched && isFilled(password) && !isValidPassword(password);
  const passwordErrors = passwordTooShort
    ? [PASSWORD_TOO_SHORT_MESSAGE]
    : errors.fields.password;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const staff = await run({ name, email, password });
    if (staff) {
      router.push('/staff/bookings');
    }
  }

  return (
    <Form
      onSubmit={handleSubmit}
      errors={errors.form}
      actions={
        <Button
          type="submit"
          disabled={!canSubmit}
          loading={loading || data !== null}
        >
          Sign up
          <ArrowRightIcon />
        </Button>
      }
    >
      <TextInput
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Your full name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        errors={errors.fields.name}
      />
      <TextInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@briarhouse.co"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        errors={errors.fields.email}
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
        minLength={MIN_PASSWORD_LENGTH}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onBlur={() => setPasswordTouched(true)}
        errors={passwordErrors}
      />
    </Form>
  );
}
