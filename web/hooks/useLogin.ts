import { login } from '@/lib/api';
import type { LoginInput, Staff } from '@/lib/types';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useLogin(): ApiMutation<LoginInput, Staff> {
  return useApiMutation<LoginInput, Staff>(login);
}
