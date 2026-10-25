import { cancelBooking } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useCancelBooking(): ApiMutation<string, Booking> {
  return useApiMutation<string, Booking>(cancelBooking);
}
