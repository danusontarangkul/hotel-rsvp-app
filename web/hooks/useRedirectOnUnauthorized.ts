import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiError } from '@/lib/api';

export function useRedirectOnUnauthorized(
  ...errors: (ApiError | null)[]
): void {
  const router = useRouter();
  const unauthorized = errors.some((error) => error?.status === 401);

  useEffect(() => {
    if (unauthorized) {
      router.replace('/staff/login');
    }
  }, [unauthorized, router]);
}
