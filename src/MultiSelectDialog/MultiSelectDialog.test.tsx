import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectDialog } from './MultiSelectDialog';
import type { SelectOption } from '../types';

const options: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'managers' },
  { id: '2', label: '利用者', sublabel: 'employee' },
];

describe('MultiSelectDialog', () => {
  it('open が false なら何も描画しない', () => {
    render(<MultiSelectDialog open={false} options={options} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('open が true ならダイアログを描画し、既定のタイトルを出す', () => {
    render(<MultiSelectDialog open options={options} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('選択')).toBeInTheDocument();
  });

  it('未選択のとき決定ボタンは無効', () => {
    render(<MultiSelectDialog open options={options} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: '決定' })).toBeDisabled();
  });

  it('選択すると決定が有効になり、押すと選択配列を返す', async () => {
    const onSubmit = vi.fn();
    render(<MultiSelectDialog open options={options} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText('管理者'));
    const submit = screen.getByRole('button', { name: '決定' });
    expect(submit).toBeEnabled();
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith([options[0]]);
  });

  it('requireSelection が false なら未選択でも決定できる', async () => {
    const onSubmit = vi.fn();
    render(
      <MultiSelectDialog open options={options} onSubmit={onSubmit} onCancel={vi.fn()} requireSelection={false} />
    );
    await userEvent.click(screen.getByRole('button', { name: '決定' }));
    expect(onSubmit).toHaveBeenCalledWith([]);
  });

  it('キャンセルでは onSubmit を呼ばず onCancel を呼ぶ', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<MultiSelectDialog open options={options} onSubmit={onSubmit} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('管理者'));
    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('initialValue を渡すと選択済み状態で開く', () => {
    render(
      <MultiSelectDialog open options={options} initialValue={[options[0]]} onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: '管理者 を削除' })).toBeInTheDocument();
  });

  it('Escape で onCancel が呼ばれる', async () => {
    const onCancel = vi.fn();
    render(<MultiSelectDialog open options={options} onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('IME 変換確定中の Escape では onCancel が呼ばれない', () => {
    const onCancel = vi.fn();
    render(<MultiSelectDialog open options={options} onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: 'Escape', isComposing: true });
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('閉じるボタンで onCancel が呼ばれる', async () => {
    const onCancel = vi.fn();
    render(<MultiSelectDialog open options={options} onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('ボタンの文言を上書きできる', () => {
    render(
      <MultiSelectDialog
        open
        options={options}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        title="グループ選択"
        submitLabel="OK"
        cancelLabel="やめる"
      />
    );
    expect(screen.getByText('グループ選択')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'やめる' })).toBeInTheDocument();
  });

  it('フォーカストラップ: 最後の要素で Tab を押すと最初の要素へ戻る', async () => {
    const user = userEvent.setup();
    render(<MultiSelectDialog open options={options} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !(el as HTMLButtonElement).disabled);

    expect(focusable.length).toBeGreaterThan(0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    expect(document.activeElement).toBe(last);

    await user.tab();

    expect(document.activeElement).toBe(first);
    // ダイアログの外へフォーカスが抜けていないことも確認する
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('フォーカストラップ: 最初の要素で Shift+Tab を押すと最後の要素へ戻る', async () => {
    const user = userEvent.setup();
    render(<MultiSelectDialog open options={options} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !(el as HTMLButtonElement).disabled);

    expect(focusable.length).toBeGreaterThan(0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first.focus();
    expect(document.activeElement).toBe(first);

    await user.tab({ shift: true });

    expect(document.activeElement).toBe(last);
    // ダイアログの外へフォーカスが抜けていないことも確認する
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('submitButtonProps / cancelButtonProps で渡したクラス・属性が反映される（既存クラスは残る）', () => {
    render(
      <MultiSelectDialog
        open
        options={options}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'submit' }}
        cancelButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'cancel' }}
      />
    );
    const submit = screen.getByRole('button', { name: '決定' });
    const cancel = screen.getByRole('button', { name: 'キャンセル' });
    expect(submit).toHaveClass('bca-multi-select-dialog__button', 'bca-multi-select-dialog__button--primary', 'bca-btn');
    expect(submit).toHaveAttribute('data-bca-btn-type', 'submit');
    expect(cancel).toHaveClass('bca-multi-select-dialog__button', 'bca-btn');
    expect(cancel).toHaveAttribute('data-bca-btn-type', 'cancel');
  });
});
