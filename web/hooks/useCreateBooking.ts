import { createBooking } from '@/lib/api';
import type { BookingConfirmation, CreateBookingInput } from '@/lib/types';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useCreateBooking(): ApiMutation<
  CreateBookingInput,
  BookingConfirmation
> {
  return useApiMutation<CreateBookingInput, BookingConfirmation>(createBooking);
}
