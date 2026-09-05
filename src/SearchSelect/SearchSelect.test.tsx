import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchSelect } from './SearchSelect';
import type { SelectOption } from '../types';

const options: SelectOption[] = [
  { id: '1', label: '（株）Gakken' },
  { id: '2', label: '（株）Gakken LX' },
  { id: '3', label: '（株）学研プロダクツサポート', sublabel: 'products' },
];

describe('SearchSelect', () => {
  it('未選択のときプレースホルダを表示する', () => {
    render(<SearchSelect options={options} value={null} onChange={vi.fn()} />);
    expect(screen.getByText('選択してください')).toBeInTheDocument();
  });

  it('選択済みのとき該当 label を表示する', () => {
    render(<SearchSelect options={options} value="2" onChange={vi.fn()} />);
    expect(screen.getByText('（株）Gakken LX')).toBeInTheDocument();
  });

  it('クリックで開き、選択肢が並ぶ', async () => {
    render(<SearchSelect options={options} value={null} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('検索語で絞り込まれる', async () => {
    render(<SearchSelect options={options} value={null} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.type(screen.getByPlaceholderText('検索...'), 'LX');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('選択肢をクリックすると id を返して閉じる', async () => {
    const onChange = vi.fn();
    render(<SearchSelect options={options} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '（株）Gakken LX' }));
    expect(onChange).toHaveBeenCalledWith('2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('一致しないときは noResultsText を表示する', async () => {
    render(<SearchSelect options={options} value={null} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.type(screen.getByPlaceholderText('検索...'), 'zzz');
    expect(screen.getByText('一致する項目がありません')).toBeInTheDocument();
  });

  it('emptyLabel を指定すると先頭に出て、選ぶと null を返す', async () => {
    const onChange = vi.fn();
    render(<SearchSelect options={options} value="1" onChange={onChange} emptyLabel="指定なし" />);
    await userEvent.click(screen.getByRole('combobox'));
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveTextContent('指定なし');
    await userEvent.click(items[0]);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('× で選択を解除して null を返す', async () => {
    const onChange = vi.fn();
    render(<SearchSelect options={options} value="1" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '選択を解除' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('clearable が false なら × を出さない', () => {
    render(<SearchSelect options={options} value="1" onChange={vi.fn()} clearable={false} />);
    expect(screen.queryByRole('button', { name: '選択を解除' })).not.toBeInTheDocument();
  });

  it('disabled のとき開かない', async () => {
    render(<SearchSelect options={options} value={null} onChange={vi.fn()} disabled />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('↓↓Enter で2番目の選択肢を確定する', async () => {
    const onChange = vi.fn();
    render(<SearchSelect options={options} value={null} onChange={onChange} />);
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('Escape で閉じる', async () => {
    render(<SearchSelect options={options} value={null} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('外側をクリックすると閉じる', async () => {
    render(
      <div>
        <span data-testid="outside">外</span>
        <SearchSelect options={options} value={null} onChange={vi.fn()} />
      </div>
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('name を渡すと hidden input を描画する', () => {
    const { container } = render(
      <SearchSelect options={options} value="2" onChange={vi.fn()} name="data[User][approver_id]" />
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('name', 'data[User][approver_id]');
    expect(hidden).toHaveValue('2');
  });

  it('name を渡さなければ hidden input を描画しない', () => {
    const { container } = render(<SearchSelect options={options} value="2" onChange={vi.fn()} />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('disabled のオプションをクリックしても onChange が呼ばれない', async () => {
    const onChange = vi.fn();
    const optionsWithDisabled: SelectOption[] = [
      ...options,
      { id: '4', label: '（株）無効サンプル', disabled: true },
    ];
    render(<SearchSelect options={optionsWithDisabled} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '（株）無効サンプル' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('クリアボタンにフォーカスして Enter を押すと選択解除され、ドロップダウンは開かない', async () => {
    const onChange = vi.fn();
    render(<SearchSelect options={options} value="1" onChange={onChange} />);
    const clearButton = screen.getByRole('button', { name: '選択を解除' });
    clearButton.focus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('searchPlaceholder を渡すとその文言が検索欄に出る', async () => {
    render(
      <SearchSelect options={options} value={null} onChange={vi.fn()} searchPlaceholder="会社名で検索" />
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByPlaceholderText('会社名で検索')).toBeInTheDocument();
  });
});
