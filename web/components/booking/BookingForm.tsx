'use client';

import { useState, type SubmitEvent } from 'react';
import Button from '@/components/shared/Button';
import EmailInput from '@/components/shared/EmailInput';
import Form from '@/components/shared/Form';
import PhoneInput from '@/components/shared/PhoneInput';
import SectionHeading from '@/components/shared/SectionHeading';
import TextInput from '@/components/shared/TextInput';
import { ArrowRightIcon } from '@/components/shared/icons';
import type { ApiError } from '@/lib/api';
import { formatDisplayDate, type StaySelection } from '@/lib/dates';
import { toFormErrors } from '@/lib/form-errors';
import { isValidPhone } from '@/lib/phone';
import type { GuestDetails } from '@/lib/types';
import { isFilled, isValidEmail } from '@/lib/validation';

type BookingFormProps = {
  selection: StaySelection;
  loading: boolean;
  error: ApiError | null;
  onBook: (details: GuestDetails) => void;
};

const FIELDS = ['guestName', 'guestPhone', 'guestEmail'] as const;

export default function BookingForm({
  selection,
  loading,
  error,
  onBook,
}: BookingFormProps) {
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');

  const { checkIn, checkOut } = selection;
  const datesChosen = checkIn !== null && checkOut !== null;
  const canSubmit =
    datesChosen &&
    isFilled(guestName) &&
    isValidPhone(guestPhone) &&
    isValidEmail(guestEmail);
  const errors = toFormErrors(error, FIELDS);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onBook({ guestName, guestPhone, guestEmail });
  }

  return (
    <div>
      <SectionHeading>Your stay</SectionHeading>
      <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
        <TextInput
          label="Check-in"
          readOnly
          placeholder="Select date"
          value={checkIn ? formatDisplayDate(checkIn) : ''}
        />
        <TextInput
          label="Check-out"
          readOnly
          placeholder="Select date"
          value={checkOut ? formatDisplayDate(checkOut) : ''}
        />
      </div>
      {datesChosen && (
        <>
          <SectionHeading level={3} variant="label">
            Your details
          </SectionHeading>
          <Form
            onSubmit={handleSubmit}
            errors={errors.form}
            actions={
              <Button type="submit" disabled={!canSubmit} loading={loading}>
                Book
                <ArrowRightIcon />
              </Button>
            }
          >
            <TextInput
              label="Full name"
              name="guestName"
              autoComplete="name"
              placeholder="Your full name"
              required
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              errors={errors.fields.guestName}
            />
            <PhoneInput
              name="guestPhone"
              placeholder="(123) 456-7890"
              required
              value={guestPhone}
              onChange={setGuestPhone}
              errors={errors.fields.guestPhone}
            />
            <EmailInput
              name="guestEmail"
              placeholder="you@example.com"
              required
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              errors={errors.fields.guestEmail}
            />
          </Form>
        </>
      )}
    </div>
  );
}
