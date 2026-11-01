import {
  announceAvailabilityChanged,
  listenForAvailabilityChanged,
} from './availability-events';

describe('availability events', () => {
  it('tells a listener when availability changes', () => {
    const onChange = jest.fn();
    const stopListening = listenForAvailabilityChanged(onChange);

    announceAvailabilityChanged();

    expect(onChange).toHaveBeenCalledTimes(1);
    stopListening();
  });

  it('stops telling a listener after it stops listening', () => {
    const onChange = jest.fn();
    const stopListening = listenForAvailabilityChanged(onChange);

    stopListening();
    announceAvailabilityChanged();

    expect(onChange).not.toHaveBeenCalled();
  });
});
