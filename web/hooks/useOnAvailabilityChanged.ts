import { useEffect } from 'react';
import { listenForAvailabilityChanged } from '@/lib/availability-events';

export function useOnAvailabilityChanged(onChange: () => void): void {
  useEffect(() => listenForAvailabilityChanged(onChange), [onChange]);
}
