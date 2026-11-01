export const AVAILABILITY_CHANGED_EVENT = 'hotel:availability-changed';

export function announceAvailabilityChanged(): void {
  window.dispatchEvent(new Event(AVAILABILITY_CHANGED_EVENT));
}

export function listenForAvailabilityChanged(onChange: () => void): () => void {
  window.addEventListener(AVAILABILITY_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener(AVAILABILITY_CHANGED_EVENT, onChange);
  };
}
