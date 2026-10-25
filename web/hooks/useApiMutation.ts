import { useCallback, useState } from 'react';
import { toApiError, type ApiError } from '@/lib/api';

export type ApiMutation<Input, Output> = {
  run: (input: Input) => Promise<Output | null>;
  loading: boolean;
  error: ApiError | null;
  data: Output | null;
  reset: () => void;
};

export function useApiMutation<Input, Output>(
  request: (input: Input) => Promise<Output>,
): ApiMutation<Input, Output> {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Output | null>(null);

  const run = useCallback(
    async (input: Input): Promise<Output | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await request(input);
        setData(result);
        return result;
      } catch (caught) {
        setError(toApiError(caught));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { run, loading, error, data, reset };
}
