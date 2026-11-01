import { renderHook } from '@testing-library/react';
import { useScrollToBottom } from './useScrollToBottom';

function scrollableList(scrollHeight: number): HTMLOListElement {
  const list = document.createElement('ol');
  Object.defineProperty(list, 'scrollHeight', { value: scrollHeight });
  Object.defineProperty(list, 'scrollTop', { value: 0, writable: true });
  return list;
}

describe('useScrollToBottom', () => {
  it('scrolls to the bottom when the content changes', () => {
    const list = scrollableList(500);
    const { result, rerender } = renderHook(
      ({ content }) => useScrollToBottom<HTMLOListElement>(content),
      { initialProps: { content: ['Hello'] } },
    );
    result.current.current = list;

    rerender({ content: ['Hello', 'Is Nov 3 open?'] });

    expect(list.scrollTop).toBe(500);
  });

  it('does not scroll when the content stays the same', () => {
    const list = scrollableList(500);
    const content = ['Hello'];
    const { result, rerender } = renderHook(
      ({ content }) => useScrollToBottom<HTMLOListElement>(content),
      { initialProps: { content } },
    );
    result.current.current = list;

    rerender({ content });

    expect(list.scrollTop).toBe(0);
  });

  it('does nothing before the element is attached', () => {
    const { rerender } = renderHook(
      ({ content }) => useScrollToBottom<HTMLOListElement>(content),
      { initialProps: { content: ['Hello'] } },
    );

    expect(() => rerender({ content: ['Hello', 'Hi'] })).not.toThrow();
  });
});
