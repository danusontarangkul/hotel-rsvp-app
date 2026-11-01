import { findBookingByNumber } from '@/lib/api';
import type { BookingLookup } from '@/lib/types';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useFindBooking(): ApiMutation<string, BookingLookup> {
  return useApiMutation<string, BookingLookup>(findBookingByNumber);
}
