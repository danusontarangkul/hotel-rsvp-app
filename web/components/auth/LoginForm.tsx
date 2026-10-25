'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import Form from '@/components/shared/Form';
import PasswordInput from '@/components/shared/PasswordInput';
import TextInput from '@/components/shared/TextInput';
import { ArrowRightIcon } from '@/components/shared/icons';
import { useLogin } from '@/hooks/useLogin';
import { toFormErrors } from '@/lib/form-errors';
import { isFilled, isValidEmail } from '@/lib/validation';

const FIELDS = ['email', 'password'] as const;

export default function LoginForm() {
  const router = useRouter();
  const { run, loading, error, data } = useLogin();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const canSubmit = isValidEmail(email) && isFilled(password);
  const errors = toFormErrors(error, FIELDS);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const staff = await run({ email, password });
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
          Log in
          <ArrowRightIcon />
        </Button>
      }
    >
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
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        errors={errors.fields.password}
      />
    </Form>
  );
}
