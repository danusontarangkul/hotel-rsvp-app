import { useCallback, useEffect, useState } from 'react';
import { toApiError, type ApiError } from '@/lib/api';

export type ApiQuery<Output> = {
  loading: boolean;
  error: ApiError | null;
  data: Output | null;
  refetch: () => void;
};

type QueryState<Output> = Omit<ApiQuery<Output>, 'refetch'>;

export function useApiQuery<Output>(
  request: () => Promise<Output>,
): ApiQuery<Output> {
  const [state, setState] = useState<QueryState<Output>>({
    loading: true,
    error: null,
    data: null,
  });
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    request().then(
      (data) => {
        if (active) {
          setState({ loading: false, error: null, data });
        }
      },
      (caught: unknown) => {
        if (active) {
          setState({ loading: false, error: toApiError(caught), data: null });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [request, version]);

  const refetch = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
    setVersion((current) => current + 1);
  }, []);

  return { ...state, refetch };
}
