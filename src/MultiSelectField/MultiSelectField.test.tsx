import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectField } from './MultiSelectField';
import type { SelectOption } from '../types';

const options: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'managers' },
  { id: '2', label: '利用者', sublabel: 'employee' },
];

describe('MultiSelectField', () => {
  it('未選択のとき空文言と追加ボタンを表示する', () => {
    render(<MultiSelectField options={options} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('選択されていません')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('選択済みはタグとして並ぶ', () => {
    render(<MultiSelectField options={options} value={[options[0]]} onChange={vi.fn()} />);
    expect(screen.getByText('管理者')).toBeInTheDocument();
  });

  it('タグの × で選択が解除される', async () => {
    const onChange = vi.fn();
    render(<MultiSelectField options={options} value={[options[0]]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '管理者 を削除' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('追加ボタンでモーダルが開く', async () => {
    render(<MultiSelectField options={options} value={[]} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '追加' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('モーダルで選んで決定すると既存の選択に追加される', async () => {
    const onChange = vi.fn();
    render(<MultiSelectField options={options} value={[options[0]]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '追加' }));
    await userEvent.click(screen.getByText('利用者'));
    await userEvent.click(screen.getByRole('button', { name: '決定' }));
    expect(onChange).toHaveBeenCalledWith([options[0], options[1]]);
  });

  it('モーダルには選択済みを除いた選択肢だけを渡す', async () => {
    render(<MultiSelectField options={options} value={[options[0]]} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '追加' }));
    const list = screen.getByRole('listbox', { name: '選択可能な項目' });
    expect(list).toHaveTextContent('利用者');
    expect(list).not.toHaveTextContent('managers');
  });

  it('name を渡すと選択件数分の hidden input を描画する', () => {
    const { container } = render(
      <MultiSelectField options={options} value={options} onChange={vi.fn()} name="data[User][group_ids][]" />
    );
    const hidden = container.querySelectorAll('input[type="hidden"]');
    expect(hidden).toHaveLength(2);
    expect(hidden[0]).toHaveAttribute('name', 'data[User][group_ids][]');
    expect(hidden[0]).toHaveValue('1');
    expect(hidden[1]).toHaveValue('2');
  });

  it('name を渡さなければ hidden input を描画しない', () => {
    const { container } = render(<MultiSelectField options={options} value={options} onChange={vi.fn()} />);
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
  });

  it('disabled のとき追加ボタンとタグの × が無効', () => {
    render(<MultiSelectField options={options} value={[options[0]]} onChange={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: '追加' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '管理者 を削除' })).toBeDisabled();
  });

  it('文言を上書きできる', () => {
    render(
      <MultiSelectField
        options={options}
        value={[]}
        onChange={vi.fn()}
        addButtonLabel="グループ追加"
        emptyText="未設定"
      />
    );
    expect(screen.getByRole('button', { name: 'グループ追加' })).toBeInTheDocument();
    expect(screen.getByText('未設定')).toBeInTheDocument();
  });

  it('ダイアログの決定・キャンセル文言と requireSelection を上書きできる', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelectField
        options={options}
        value={[]}
        onChange={onChange}
        submitLabel="OK"
        cancelLabel="やめる"
        requireSelection={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '追加' }));
    expect(screen.getByRole('button', { name: 'やめる' })).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'OK' });
    expect(submit).toBeEnabled();
    await userEvent.click(submit);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('maxSelected を累計の選択上限として扱い、既に上限に達していると追加ボタンが無効になる', () => {
    render(
      <MultiSelectField options={options} value={[options[0], options[1]]} onChange={vi.fn()} maxSelected={2} />
    );
    expect(screen.getByRole('button', { name: '追加' })).toBeDisabled();
  });

  it('maxSelected を累計の選択上限として扱い、モーダル内で残り枠を超えて選べない', async () => {
    const threeOptions: SelectOption[] = [
      { id: '1', label: '管理者' },
      { id: '2', label: '利用者' },
      { id: '3', label: 'ゲスト' },
    ];
    render(
      <MultiSelectField
        options={threeOptions}
        value={[threeOptions[0]]}
        onChange={vi.fn()}
        maxSelected={2}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '追加' }));
    // 残り枠は 1（maxSelected 2 - 既存選択 1）。モーダル内で 1 件選ぶと上限に達し、
    // それ以上の候補は選択できなくなる。
    await userEvent.click(screen.getByText('利用者'));
    const remainingCandidate = screen.getByText('ゲスト').closest('li');
    expect(remainingCandidate).toHaveAttribute('aria-disabled', 'true');
  });

  it('addButtonProps で渡したクラス・属性が追加ボタンに反映される（既存クラスは残る）', () => {
    render(
      <MultiSelectField
        options={options}
        value={[]}
        onChange={vi.fn()}
        addButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'add' }}
      />
    );
    const button = screen.getByRole('button', { name: '追加' });
    expect(button).toHaveClass('bca-multi-select-field__add', 'bca-btn');
    expect(button).toHaveAttribute('data-bca-btn-type', 'add');
  });

  it('submitButtonProps / cancelButtonProps がモーダルの決定・キャンセルボタンまで届く', async () => {
    render(
      <MultiSelectField
        options={options}
        value={[]}
        onChange={vi.fn()}
        submitButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'submit' }}
        cancelButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'cancel' }}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '追加' }));
    const submit = screen.getByRole('button', { name: '決定' });
    const cancel = screen.getByRole('button', { name: 'キャンセル' });
    expect(submit).toHaveClass('bca-multi-select-dialog__button', 'bca-multi-select-dialog__button--primary', 'bca-btn');
    expect(submit).toHaveAttribute('data-bca-btn-type', 'submit');
    expect(cancel).toHaveClass('bca-multi-select-dialog__button', 'bca-btn');
    expect(cancel).toHaveAttribute('data-bca-btn-type', 'cancel');
  });

  it('addButtonProps / submitButtonProps / cancelButtonProps を渡さなければ baserCMS 既定のクラス・属性が付く', async () => {
    render(<MultiSelectField options={options} value={[]} onChange={vi.fn()} />);
    const addButton = screen.getByRole('button', { name: '追加' });
    expect(addButton).toHaveClass('bca-multi-select-field__add', 'bca-btn');
    expect(addButton).toHaveAttribute('data-bca-btn-type', 'add');

    await userEvent.click(addButton);
    const submit = screen.getByRole('button', { name: '決定' });
    const cancel = screen.getByRole('button', { name: 'キャンセル' });
    expect(submit).toHaveClass('bca-btn');
    expect(submit).toHaveAttribute('data-bca-btn-type', 'save');
    expect(cancel).toHaveClass('bca-btn');
    expect(cancel).not.toHaveAttribute('data-bca-btn-type');
  });

  it('addButtonProps を明示的に渡すと既定値は付かず、渡した内容で置き換わる', () => {
    render(
      <MultiSelectField options={options} value={[]} onChange={vi.fn()} addButtonProps={{ className: 'my-btn' }} />
    );
    const button = screen.getByRole('button', { name: '追加' });
    expect(button).toHaveClass('my-btn');
    expect(button).not.toHaveClass('bca-btn');
    expect(button).not.toHaveAttribute('data-bca-btn-type');
  });

  it('addButtonProps={{}} を渡すと何もクラス・属性が付かない', () => {
    render(<MultiSelectField options={options} value={[]} onChange={vi.fn()} addButtonProps={{}} />);
    const button = screen.getByRole('button', { name: '追加' });
    expect(button).toHaveClass('bca-multi-select-field__add');
    expect(button).not.toHaveClass('bca-btn');
    expect(button).not.toHaveAttribute('data-bca-btn-type');
  });

  it('addButtonProps に onClick/disabled を無理やり渡しても部品側の挙動が壊れない', async () => {
    const rogueOnClick = vi.fn();
    render(
      <MultiSelectField
        options={options}
        value={[]}
        onChange={vi.fn()}
        addButtonProps={{ onClick: rogueOnClick, disabled: true } as never}
      />
    );
    const button = screen.getByRole('button', { name: '追加' });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(rogueOnClick).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
