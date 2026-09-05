import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * ドロップダウンを上下どちらに開くか決める
 *
 * 'auto' のときは、下側の余白が estimatedHeight に満たず、かつ上側の方が
 * 広い場合にだけ上へ開く。現行実装は常に上へ開くため、画面上部で使うと
 * 見切れる問題があった。
 */
export const useDropdownPlacement = (
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  preferred: 'auto' | 'top' | 'bottom',
  estimatedHeight = 240
): 'top' | 'bottom' => {
  const [placement, setPlacement] = useState<'top' | 'bottom'>(preferred === 'top' ? 'top' : 'bottom');

  useLayoutEffect(() => {
    if (!open) return;
    if (preferred !== 'auto') {
      setPlacement(preferred);
      return;
    }
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPlacement(spaceBelow < estimatedHeight && rect.top > spaceBelow ? 'top' : 'bottom');
  }, [ref, open, preferred, estimatedHeight]);

  return placement;
};
