import { useEffect } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

const isDisabled = (el: HTMLElement): boolean => 'disabled' in el && (el as { disabled: boolean }).disabled;

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => !isDisabled(el));

/**
 * enabled のあいだ、ref 内で Tab キーによるフォーカス移動を閉じ込める。
 * 最後の要素から Tab で最初の要素へ、最初の要素から Shift+Tab で最後の要素へ回す。
 */
export const useFocusTrap = (ref: RefObject<HTMLElement | null>, enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return;
    const container = ref.current;
    if (!container) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !container.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [ref, enabled]);
};
