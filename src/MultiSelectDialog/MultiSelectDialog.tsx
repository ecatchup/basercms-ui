import { useEffect, useRef, useState } from 'react';
import type { SelectOption } from '../types';
import { MultiSelectPicker } from '../MultiSelectPicker/MultiSelectPicker';
import type { MultiSelectPickerProps } from '../MultiSelectPicker/MultiSelectPicker';
import { useFocusTrap } from '../hooks/useFocusTrap';

export type MultiSelectDialogProps = Pick<
  MultiSelectPickerProps,
  'options' | 'searchPlaceholder' | 'noResultsText' | 'listHeight' | 'maxSelected' | 'className'
> & {
  open: boolean;
  title?: string;
  initialValue?: SelectOption[];
  onSubmit: (selected: SelectOption[]) => void;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  /** true のとき、未選択なら決定ボタンを無効にする */
  requireSelection?: boolean;
};

export const MultiSelectDialog = ({
  open,
  title = '選択',
  options,
  initialValue,
  onSubmit,
  onCancel,
  submitLabel = '決定',
  cancelLabel = 'キャンセル',
  requireSelection = true,
  className = '',
  ...pickerProps
}: MultiSelectDialogProps) => {
  const [selected, setSelected] = useState<SelectOption[]>(initialValue ?? []);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // 開くたびに initialValue へ戻す。
  // initialValue は配列リテラルで渡されることが多く参照が毎回変わるため、
  // 依存は open のみとする。
  useEffect(() => {
    if (open) setSelected(initialValue ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape で閉じる
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  // 開いたらダイアログへフォーカスを移し、閉じたら元の要素へ戻す
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Tab キーによるフォーカスをダイアログ内に閉じ込める
  useFocusTrap(dialogRef, open);

  if (!open) return null;

  const canSubmit = !requireSelection || selected.length > 0;

  return (
    <div className="cui-dialog__overlay">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`cui-dialog ${className}`.trim()}
      >
        <div className="cui-dialog__header">
          <span className="cui-dialog__title">{title}</span>
          <button type="button" className="cui-dialog__close" aria-label="閉じる" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="cui-dialog__body">
          <MultiSelectPicker options={options} value={selected} onChange={setSelected} {...pickerProps} />
        </div>

        <div className="cui-dialog__footer">
          <button type="button" className="cui-dialog__button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="cui-dialog__button cui-dialog__button--primary"
            disabled={!canSubmit}
            onClick={() => onSubmit(selected)}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
