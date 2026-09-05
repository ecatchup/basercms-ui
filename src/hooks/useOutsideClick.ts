import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * enabled のあいだ、ref の外側の mousedown を検知して handler を呼ぶ
 */
export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  handler: () => void
): void => {
  useEffect(() => {
    if (!enabled) return;
    const onMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [ref, enabled, handler]);
};
