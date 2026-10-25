import { act, renderHook } from '@testing-library/react';
import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api';
import { useApiMutation } from './useApiMutation';

const request = jest.fn<Promise<string>, [number]>();

afterEach(() => {
  jest.resetAllMocks();
});

describe('useApiMutation', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useApiMutation(request));

    expect(result.current).toMatchObject({
      loading: false,
      error: null,
      data: null,
    });
  });

  it('is loading while the request runs', async () => {
    request.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useApiMutation(request));

    act(() => {
      void result.current.run(1);
    });

    expect(result.current.loading).toBe(true);
  });

  it('returns and stores the response on success', async () => {
    request.mockResolvedValue('done');
    const { result } = renderHook(() => useApiMutation(request));

    let response: string | null = null;
    await act(async () => {
      response = await result.current.run(1);
    });

    expect(request).toHaveBeenCalledWith(1);
    expect(response).toBe('done');
    expect(result.current).toMatchObject({
      loading: false,
      error: null,
      data: 'done',
    });
  });

  it('returns null and stores the ApiError on failure', async () => {
    const error = new ApiError(409, ['Email is already registered']);
    request.mockRejectedValue(error);
    const { result } = renderHook(() => useApiMutation(request));

    let response: string | null = 'unset';
    await act(async () => {
      response = await result.current.run(1);
    });

    expect(response).toBeNull();
    expect(result.current).toMatchObject({ loading: false, error, data: null });
  });

  it('turns a network failure into an ApiError with a generic message', async () => {
    request.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useApiMutation(request));

    await act(async () => {
      await result.current.run(1);
    });

    expect(result.current.error?.messages).toEqual([GENERIC_ERROR_MESSAGE]);
  });

  it('clears the previous error when it runs again', async () => {
    request
      .mockRejectedValueOnce(new ApiError(400, ['bad']))
      .mockResolvedValue('ok');
    const { result } = renderHook(() => useApiMutation(request));

    await act(async () => {
      await result.current.run(1);
    });
    await act(async () => {
      await result.current.run(2);
    });

    expect(result.current.error).toBeNull();
  });

  it('clears the response and error on reset', async () => {
    request.mockResolvedValue('done');
    const { result } = renderHook(() => useApiMutation(request));
    await act(async () => {
      await result.current.run(1);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current).toMatchObject({
      loading: false,
      error: null,
      data: null,
    });
  });
});
