import { getCurrentStaff } from '@/lib/api';
import type { Staff } from '@/lib/types';
import { useApiQuery, type ApiQuery } from './useApiQuery';

export function useCurrentStaff(): ApiQuery<Staff | null> {
  return useApiQuery<Staff | null>(getCurrentStaff);
}
