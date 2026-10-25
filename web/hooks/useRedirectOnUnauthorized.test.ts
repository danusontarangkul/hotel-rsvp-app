import { renderHook } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import { useRedirectOnUnauthorized } from './useRedirectOnUnauthorized';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

afterEach(() => {
  jest.resetAllMocks();
});

describe('useRedirectOnUnauthorized', () => {
  it('goes to the log in page on a 401', () => {
    renderHook(() =>
      useRedirectOnUnauthorized(null, new ApiError(401, ['Unauthorized'])),
    );

    expect(replace).toHaveBeenCalledWith('/staff/login');
  });

  it('stays on the page for other errors', () => {
    renderHook(() =>
      useRedirectOnUnauthorized(new ApiError(500, ['Server down'])),
    );

    expect(replace).not.toHaveBeenCalled();
  });

  it('stays on the page without errors', () => {
    renderHook(() => useRedirectOnUnauthorized(null, null));

    expect(replace).not.toHaveBeenCalled();
  });
});
