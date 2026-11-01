import { getAvailability } from '@/lib/api';
import type { Availability } from '@/lib/types';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useCheckAvailability(): ApiMutation<void, Availability> {
  return useApiMutation<void, Availability>(getAvailability);
}
