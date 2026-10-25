import { logout } from '@/lib/api';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useLogout(): ApiMutation<void, void> {
  return useApiMutation<void, void>(logout);
}
