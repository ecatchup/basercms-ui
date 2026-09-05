import { useState } from 'react';
import type { SelectOption } from '../types';
import { useFilteredOptions } from '../hooks/useFilteredOptions';
import { SelectedTags } from '../internal/SelectedTags';

export type MultiSelectPickerProps = {
  options: SelectOption[];
  value: SelectOption[];
  onChange: (selected: SelectOption[]) => void;
  searchPlaceholder?: string;
  noResultsText?: string;
  listHeight?: number | string;
  maxSelected?: number;
  className?: string;
};

export const MultiSelectPicker = ({
  options,
  value,
  onChange,
  searchPlaceholder = '検索...',
  noResultsText = '選択可能な項目はありません',
  listHeight = 350,
  maxSelected,
  className = '',
}: MultiSelectPickerProps) => {
  const [query, setQuery] = useState('');

  const selectedIds = new Set(value.map((item) => item.id));
  // 選択済みの項目は一覧から消す
  const candidates = useFilteredOptions(options, query).filter((option) => !selectedIds.has(option.id));
  const reachedMax = maxSelected !== undefined && value.length >= maxSelected;

  const add = (option: SelectOption) => {
    if (reachedMax || option.disabled) return;
    onChange([...value, option]);
  };

  const remove = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className={`cui-picker ${className}`.trim()}>
      <div className="cui-picker__search">
        <input
          type="text"
          className="cui-picker__search-input"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="cui-picker__search-clear"
            aria-label="検索語をクリア"
            onClick={() => setQuery('')}
          >
            ×
          </button>
        )}
      </div>

      <div className="cui-picker__list-wrapper" style={{ maxHeight: listHeight }}>
        <ul className="cui-picker__list" aria-label="選択可能な項目">
          {candidates.length > 0 ? (
            candidates.map((option) => (
              <li
                key={option.id}
                className="cui-picker__option"
                data-disabled={option.disabled || reachedMax || undefined}
                aria-disabled={option.disabled || reachedMax || undefined}
                onClick={() => add(option)}
              >
                <span className="cui-picker__label">{option.label}</span>
                {option.sublabel && <span className="cui-picker__sublabel">{`(${option.sublabel})`}</span>}
              </li>
            ))
          ) : (
            <li className="cui-picker__no-results">{noResultsText}</li>
          )}
        </ul>
      </div>

      <div className="cui-picker__selected">
        <SelectedTags items={value} onRemove={remove} />
      </div>
    </div>
  );
};
