import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { InputPassthroughProps, SelectOption, TriggerPassthroughProps } from '../types';
import { useFilteredOptions } from '../hooks/useFilteredOptions';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { useDropdownPlacement } from '../hooks/useDropdownPlacement';

export type SearchSelectProps = {
  options: SelectOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** 指定時、hidden input を描画する */
  name?: string;
  placeholder?: string;
  /** 指定時、「指定なし」相当の選択肢を先頭に出す */
  emptyLabel?: string;
  clearable?: boolean;
  disabled?: boolean;
  noResultsText?: string;
  /** 検索欄の placeholder */
  searchPlaceholder?: string;
  dropdownPlacement?: 'auto' | 'top' | 'bottom';
  className?: string;
  /** トリガー（閉じた状態の表示部）へ渡す任意のクラス・属性（baserCMS 等の input スタイル用） */
  triggerProps?: TriggerPassthroughProps;
  /** 検索欄へ渡す任意のクラス・属性（baserCMS 等の input スタイル用） */
  searchInputProps?: InputPassthroughProps;
  /**
   * 幅を「最も長い選択肢」に合わせる（既定 true）。
   *
   * ネイティブの `<select>` と同じ挙動。選択を変えても幅が変わらず、
   * ドロップダウンの項目も折り返さない。利用側が `className` 等で明示的に
   * 幅を指定した場合は、そちらが優先される。
   */
  sizeToLongestOption?: boolean;
};

const EMPTY_ID = '';

/** 幅の実測用に描画する候補の数。1件だと比例フォントで最長を取り違える為、上位数件を出す */
const SIZER_CANDIDATE_COUNT = 5;

/**
 * 表示幅の概算。全角は半角の約2倍幅として数える。
 * 正確な幅はブラウザに測らせる（sizer）ので、ここは候補を絞る為の粗い目安でよい。
 */
const estimateWidth = (text: string) => {
  let width = 0;
  for (const char of text) {
    width += (char.codePointAt(0) ?? 0) > 0x2e80 ? 2 : 1;
  }
  return width;
};

export const SearchSelect = ({
  options,
  value,
  onChange,
  name,
  placeholder = '選択してください',
  emptyLabel,
  clearable = true,
  disabled = false,
  noResultsText = '一致する項目がありません',
  searchPlaceholder = '検索...',
  dropdownPlacement = 'auto',
  className = '',
  triggerProps = { className: 'bca-textbox__input' },
  searchInputProps = { className: 'bca-textbox__input' },
  sizeToLongestOption = true,
}: SearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const getOptionId = (id: string) => `${listId}-option-${id || '__empty__'}`;

  // 幅の実測用。全選択肢を描画すると件数が多い場合に重い為、
  // 概算で上位数件に絞ってからブラウザに測らせる。
  const sizerLabels = useMemo(() => {
    if (!sizeToLongestOption) return [];
    const candidates = options.map((option) =>
      option.sublabel ? `${option.label} (${option.sublabel})` : option.label
    );
    if (emptyLabel) candidates.push(emptyLabel);
    if (placeholder) candidates.push(placeholder);
    return candidates
      .sort((a, b) => estimateWidth(b) - estimateWidth(a))
      .slice(0, SIZER_CANDIDATE_COUNT);
  }, [options, emptyLabel, placeholder, sizeToLongestOption]);

  const filtered = useFilteredOptions(options, query);
  const items: SelectOption[] = emptyLabel ? [{ id: EMPTY_ID, label: emptyLabel }, ...filtered] : filtered;
  const selected = options.find((option) => option.id === value) ?? null;

  useOutsideClick(wrapperRef, open, () => setOpen(false));
  const placement = useDropdownPlacement(wrapperRef, open, dropdownPlacement);

  // 閉じたら検索語と選択位置をリセットする
  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  // 開いたら検索欄へフォーカスする
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const commit = (id: string) => {
    onChange(id === EMPTY_ID ? null : id);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    // IME の変換確定・変換キャンセルの Enter/Escape はコンポーネント側の操作として扱わない
    // （keydown は composition 中にも発火し、確定/キャンセルのつもりが選択や close に化けるため）。
    if (event.nativeEvent.isComposing) return;
    // クリアボタンの Enter によるネイティブ click を横取りしないための早期 return。
    // ただし Escape だけは、フォーカスがクリアボタン上にあっても常にドロップダウンを閉じられるようにする。
    if (event.key !== 'Escape' && (event.target as HTMLElement).closest('.bca-search-select__clear')) return;
    if (event.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[activeIndex];
      if (item && !item.disabled) commit(item.id);
    }
  };

  return (
    <div ref={wrapperRef} className={`bca-search-select ${className}`.trim()} onKeyDown={handleKeyDown}>
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      <div
        {...triggerProps}
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && items[activeIndex] ? getOptionId(items[activeIndex].id) : undefined}
        tabIndex={disabled ? -1 : 0}
        className={`bca-search-select__trigger ${triggerProps?.className ?? ''}`.trim()}
        data-disabled={disabled || undefined}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={selected ? 'bca-search-select__value' : 'bca-search-select__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        {sizerLabels.length > 0 && (
          // 高さ 0 で描画されない要素。ブラウザは幅の計算にだけこれを使う為、
          // トリガーの内容幅が「最も長い選択肢」に一致する。
          // ドロップダウンはルート要素（＝トリガー）の幅に追従する為、項目も折り返さない。
          <span className="bca-search-select__sizer" aria-hidden="true">
            {sizerLabels.map((label, index) => (
              // 文字列は data 属性で渡し、CSS の content: attr() で描画する。
              // テキストノードとして重複させると、利用側のテストで
              // getByText がプレースホルダ等と二重にヒットしてしまう為。
              <span key={index} data-text={label} />
            ))}
          </span>
        )}
        {!disabled && clearable && value ? (
          <button
            type="button"
            className="bca-search-select__clear"
            aria-label="選択を解除"
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
          >
            ×
          </button>
        ) : (
          <span className="bca-search-select__arrow" aria-hidden="true">
            ▼
          </span>
        )}
      </div>

      {open && (
        <div className="bca-search-select__dropdown" data-placement={placement}>
          <div className="bca-search-select__search">
            <input
              {...searchInputProps}
              ref={searchRef}
              type="text"
              className={`bca-search-select__search-input ${searchInputProps?.className ?? ''}`.trim()}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onClick={(event) => event.stopPropagation()}
            />
          </div>

          <ul role="listbox" id={listId} className="bca-search-select__list">
            {items.length > 0 ? (
              items.map((item, index) => (
                <li
                  key={item.id || '__empty__'}
                  id={getOptionId(item.id)}
                  role="option"
                  aria-selected={item.id === (value ?? EMPTY_ID)}
                  aria-disabled={item.disabled || undefined}
                  className="bca-search-select__option"
                  data-active={index === activeIndex || undefined}
                  data-selected={item.id === (value ?? EMPTY_ID) || undefined}
                  data-disabled={item.disabled || undefined}
                  onMouseEnter={() => !item.disabled && setActiveIndex(index)}
                  onClick={() => !item.disabled && commit(item.id)}
                >
                  <span className="bca-search-select__label">{item.label}</span>
                  {item.sublabel && <span className="bca-search-select__sublabel">{`(${item.sublabel})`}</span>}
                </li>
              ))
            ) : (
              <li className="bca-search-select__no-results">{noResultsText}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
