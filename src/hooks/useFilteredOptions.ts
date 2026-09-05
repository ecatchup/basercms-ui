import { useMemo } from 'react';
import type { SelectOption } from '../types';

/**
 * label と sublabel の両方を対象に、大文字小文字を区別せず部分一致で絞り込む
 */
export const filterOptions = (options: SelectOption[], query: string): SelectOption[] => {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return options;
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(keyword) ||
      (option.sublabel ?? '').toLowerCase().includes(keyword)
  );
};

export const useFilteredOptions = (options: SelectOption[], query: string): SelectOption[] =>
  useMemo(() => filterOptions(options, query), [options, query]);
