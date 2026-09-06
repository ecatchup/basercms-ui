import { useState } from 'react';
import type { InputPassthroughProps, SelectOption } from '../types';
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
  /** 検索欄へ渡す任意のクラス・属性（baserCMS 等の input スタイル用） */
  searchInputProps?: InputPassthroughProps;
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
  searchInputProps = { className: 'bca-textbox__input' },
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
    <div className={`bca-multi-select-picker ${className}`.trim()}>
      <div className="bca-multi-select-picker__search">
        <input
          {...searchInputProps}
          type="text"
          className={`bca-multi-select-picker__search-input ${searchInputProps?.className ?? ''}`.trim()}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="bca-multi-select-picker__search-clear"
            aria-label="検索語をクリア"
            onClick={() => setQuery('')}
          >
            ×
          </button>
        )}
      </div>

      <div className="bca-multi-select-picker__list-wrapper" style={{ maxHeight: listHeight }}>
        <ul className="bca-multi-select-picker__list" role="listbox" aria-multiselectable="true" aria-label="選択可能な項目">
          {candidates.length > 0 ? (
            candidates.map((option) => {
              const isUnavailable = option.disabled || reachedMax;
              return (
                <li
                  key={option.id}
                  className="bca-multi-select-picker__option"
                  role="option"
                  aria-selected={false}
                  aria-disabled={isUnavailable || undefined}
                  data-disabled={isUnavailable || undefined}
                  tabIndex={isUnavailable ? -1 : 0}
                  onClick={() => add(option)}
                  onKeyDown={(event) => {
                    // IME 変換中の Enter/Space は変換の確定操作であり、候補の選択操作ではない。
                    if (event.nativeEvent.isComposing) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      add(option);
                    }
                  }}
                >
                  <span className="bca-multi-select-picker__label">{option.label}</span>
                  {option.sublabel && <span className="bca-multi-select-picker__sublabel">{`(${option.sublabel})`}</span>}
                </li>
              );
            })
          ) : (
            <li className="bca-multi-select-picker__no-results">{noResultsText}</li>
          )}
        </ul>
      </div>

      <div className="bca-multi-select-picker__selected">
        <SelectedTags items={value} onRemove={remove} />
      </div>
    </div>
  );
};
