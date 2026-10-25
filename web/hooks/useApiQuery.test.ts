import { act, renderHook, waitFor } from '@testing-library/react';
import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api';
import { useApiQuery } from './useApiQuery';

const request = jest.fn<Promise<string>, []>();

afterEach(() => {
  jest.resetAllMocks();
});

describe('useApiQuery', () => {
  it('is loading until the response arrives', () => {
    request.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useApiQuery(request));

    expect(result.current).toMatchObject({
      loading: true,
      error: null,
      data: null,
    });
  });

  it('stores the response', async () => {
    request.mockResolvedValue('dates');
    const { result } = renderHook(() => useApiQuery(request));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current).toMatchObject({ error: null, data: 'dates' });
  });

  it('stores the ApiError on failure', async () => {
    const error = new ApiError(500, ['Server down']);
    request.mockRejectedValue(error);
    const { result } = renderHook(() => useApiQuery(request));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current).toMatchObject({ error, data: null });
  });

  it('turns a network failure into an ApiError with a generic message', async () => {
    request.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useApiQuery(request));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.messages).toEqual([GENERIC_ERROR_MESSAGE]);
  });

  it('requests again and stores the new response on refetch', async () => {
    request.mockResolvedValueOnce('old').mockResolvedValueOnce('new');
    const { result } = renderHook(() => useApiQuery(request));
    await waitFor(() => expect(result.current.data).toBe('old'));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toBe('new'));
    expect(request).toHaveBeenCalledTimes(2);
  });
});
