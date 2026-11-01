import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<Element extends HTMLElement>(
  content: unknown,
): RefObject<Element | null> {
  const ref = useRef<Element | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [content]);

  return ref;
}
