import { getBookings } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { useApiQuery, type ApiQuery } from './useApiQuery';

export function useBookings(): ApiQuery<Booking[]> {
  return useApiQuery<Booking[]>(getBookings);
}
