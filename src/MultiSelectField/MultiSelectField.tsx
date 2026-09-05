import { useState } from 'react';
import type { SelectOption } from '../types';
import { SelectedTags } from '../internal/SelectedTags';
import { MultiSelectDialog } from '../MultiSelectDialog/MultiSelectDialog';
import type { MultiSelectPickerProps } from '../MultiSelectPicker/MultiSelectPicker';

export type MultiSelectFieldProps = Pick<
  MultiSelectPickerProps,
  'options' | 'searchPlaceholder' | 'noResultsText' | 'listHeight' | 'maxSelected' | 'className'
> & {
  value: SelectOption[];
  onChange: (selected: SelectOption[]) => void;
  /** 指定時、選択件数分の hidden input を描画する */
  name?: string;
  addButtonLabel?: string;
  dialogTitle?: string;
  emptyText?: string;
  disabled?: boolean;
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
  addButtonLabel = '追加',
  dialogTitle = '選択',
  emptyText = '選択されていません',
  disabled = false,
  className = '',
  ...pickerProps
}: MultiSelectFieldProps) => {
  const [open, setOpen] = useState(false);

  const selectedIds = new Set(value.map((item) => item.id));
  const candidates = options.filter((option) => !selectedIds.has(option.id));

  const remove = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  const submit = (added: SelectOption[]) => {
    onChange([...value, ...added]);
    setOpen(false);
  };

  return (
    <div className={`cui-field ${className}`.trim()}>
      {name && value.map((item) => <input key={item.id} type="hidden" name={name} value={item.id} />)}

      <div className="cui-field__tags">
        <SelectedTags items={value} onRemove={remove} emptyText={emptyText} disabled={disabled} />
      </div>

      <div className="cui-field__actions">
        <button type="button" className="cui-field__add" disabled={disabled} onClick={() => setOpen(true)}>
          {addButtonLabel}
        </button>
      </div>

      <MultiSelectDialog
        open={open}
        title={dialogTitle}
        options={candidates}
        onSubmit={submit}
        onCancel={() => setOpen(false)}
        {...pickerProps}
      />
    </div>
  );
};
