import { useCallback, useState } from 'react';
import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api';

export type ApiMutation<Input, Output> = {
  run: (input: Input) => Promise<Output | null>;
  loading: boolean;
  error: ApiError | null;
  data: Output | null;
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
        setError(
          caught instanceof ApiError
            ? caught
            : new ApiError(0, [GENERIC_ERROR_MESSAGE]),
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  return { run, loading, error, data };
}
