import { getAvailability } from '@/lib/api';
import type { Availability } from '@/lib/types';
import { useApiQuery, type ApiQuery } from './useApiQuery';

export function useAvailability(): ApiQuery<Availability> {
  return useApiQuery<Availability>(getAvailability);
}
