import { act, renderHook } from '@testing-library/react';
import { announceAvailabilityChanged } from '@/lib/availability-events';
import { useOnAvailabilityChanged } from './useOnAvailabilityChanged';

describe('useOnAvailabilityChanged', () => {
  it('runs the callback when availability changes', () => {
    const onChange = jest.fn();
    renderHook(() => useOnAvailabilityChanged(onChange));

    act(() => {
      announceAvailabilityChanged();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('stops listening after unmounting', () => {
    const onChange = jest.fn();
    const { unmount } = renderHook(() => useOnAvailabilityChanged(onChange));

    unmount();
    announceAvailabilityChanged();

    expect(onChange).not.toHaveBeenCalled();
  });
});
