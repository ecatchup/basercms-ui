import { useState } from 'react';
import type { ButtonPassthroughProps, SelectOption } from '../types';
import { SelectedTags } from '../internal/SelectedTags';
import { MultiSelectDialog } from '../MultiSelectDialog/MultiSelectDialog';
import type { MultiSelectPickerProps } from '../MultiSelectPicker/MultiSelectPicker';

export type MultiSelectFieldProps = Pick<
  MultiSelectPickerProps,
  'options' | 'searchPlaceholder' | 'noResultsText' | 'listHeight' | 'maxSelected' | 'className' | 'searchInputProps'
> & {
  value: SelectOption[];
  onChange: (selected: SelectOption[]) => void;
  /** 指定時、選択件数分の hidden input を描画する */
  name?: string;
  /**
   * 選択が 0 件でもキーを送るための hidden の name。
   * 既定は name の末尾の `[]` を除いたもの（PHP / Rails 等の配列記法に対応）。
   * false を渡すと出力しない。空文字（""）を渡した場合も false と同じく出力しない。
   */
  emptyName?: string | false;
  addButtonLabel?: string;
  dialogTitle?: string;
  emptyText?: string;
  disabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  requireSelection?: boolean;
  /** 追加ボタンへ渡す任意のクラス・属性（baserCMS 等のボタンスタイル用） */
  addButtonProps?: ButtonPassthroughProps;
  /** モーダルの決定ボタンへそのまま転送する（baserCMS 等のボタンスタイル用） */
  submitButtonProps?: ButtonPassthroughProps;
  /** モーダルのキャンセルボタンへそのまま転送する（baserCMS 等のボタンスタイル用） */
  cancelButtonProps?: ButtonPassthroughProps;
};

/**
 * 「追加ボタン → モーダルで選択 → 決定 → タグとして並ぶ → × で削除」
 * をひとまとめにしたフォーム部品
 */
export const MultiSelectField = ({
  options,
  value,
  onChange,
  name,
  emptyName,
  addButtonLabel = '追加',
  dialogTitle = '選択',
  emptyText = '選択されていません',
  disabled = false,
  className = '',
  maxSelected,
  submitLabel,
  cancelLabel,
  requireSelection,
  addButtonProps = { className: 'bca-btn', 'data-bca-btn-type': 'add' },
  submitButtonProps,
  cancelButtonProps,
  ...pickerProps
}: MultiSelectFieldProps) => {
  const [open, setOpen] = useState(false);

  const selectedIds = new Set(value.map((item) => item.id));
  const candidates = options.filter((option) => !selectedIds.has(option.id));

  // maxSelected は「累計の選択上限」として扱う。Dialog/Picker には既に選択済みを
  // 除いた candidates しか渡らないため、Dialog にそのまま maxSelected を渡すと
  // Dialog 内で選べる件数の上限（= そのセッションで新規に選べる件数）になってしまう。
  // ここで「残り枠」に変換してから渡すことで、累計が maxSelected を超えないようにする。
  const remainingSlots = maxSelected !== undefined ? Math.max(0, maxSelected - value.length) : undefined;
  const reachedMax = maxSelected !== undefined && value.length >= maxSelected;

  const remove = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  const submit = (added: SelectOption[]) => {
    onChange([...value, ...added]);
    setOpen(false);
  };

  // 選択 0 件だとフォームからキー自体が送信されない、という HTML の性質を回避するため、
  // name 指定時は常に「センチネル」の空 hidden を選択分より前に出す。
  // name の末尾の `[]` を外すのは、[] 付きのまま空 hidden だけを送ると
  // サーバー側で ['']（要素1つの配列）として届き、empty() 等のチェックを
  // 素通りしてしまうため（CakePHP の FormHelper::select(multiple) も同様に [] を外す）。
  const sentinelName = emptyName === false ? undefined : emptyName ?? name?.replace(/\[\]$/, '');

  return (
    <div className={`bca-multi-select-field ${className}`.trim()}>
      {name && sentinelName && <input type="hidden" name={sentinelName} value="" />}
      {name && value.map((item) => <input key={item.id} type="hidden" name={name} value={item.id} />)}

      <div className="bca-multi-select-field__tags">
        <SelectedTags items={value} onRemove={remove} emptyText={emptyText} disabled={disabled} />
      </div>

      <div className="bca-multi-select-field__actions">
        <button
          {...addButtonProps}
          type="button"
          className={`bca-multi-select-field__add ${addButtonProps?.className ?? ''}`.trim()}
          disabled={disabled || reachedMax}
          onClick={() => setOpen(true)}
        >
          {addButtonLabel}
        </button>
      </div>

      <MultiSelectDialog
        open={open}
        title={dialogTitle}
        options={candidates}
        onSubmit={submit}
        onCancel={() => setOpen(false)}
        maxSelected={remainingSlots}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        requireSelection={requireSelection}
        submitButtonProps={submitButtonProps}
        cancelButtonProps={cancelButtonProps}
        {...pickerProps}
      />
    </div>
  );
};
