import { signup } from '@/lib/api';
import type { SignupInput, Staff } from '@/lib/types';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useSignup(): ApiMutation<SignupInput, Staff> {
  return useApiMutation<SignupInput, Staff>(signup);
}
