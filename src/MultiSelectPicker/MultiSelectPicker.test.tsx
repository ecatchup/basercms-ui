import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectPicker } from './MultiSelectPicker';
import type { SelectOption } from '../types';

const options: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'managers' },
  { id: '2', label: '利用者', sublabel: 'employee' },
  { id: '3', label: '10_学研正社員', sublabel: 'gw_10_syain' },
];

describe('MultiSelectPicker', () => {
  it('選択肢を label と sublabel 付きで一覧表示する', () => {
    render(<MultiSelectPicker options={options} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('管理者')).toBeInTheDocument();
    expect(screen.getByText('(managers)')).toBeInTheDocument();
  });

  it('検索語で絞り込まれる（sublabel も対象）', async () => {
    render(<MultiSelectPicker options={options} value={[]} onChange={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('検索...'), 'gw_10');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('一覧の項目をクリックすると onChange に追加された配列が渡る', async () => {
    const onChange = vi.fn();
    render(<MultiSelectPicker options={options} value={[]} onChange={onChange} />);
    await userEvent.click(screen.getByText('管理者'));
    expect(onChange).toHaveBeenCalledWith([options[0]]);
  });

  it('選択済みの項目は一覧から消える', () => {
    render(<MultiSelectPicker options={options} value={[options[0]]} onChange={vi.fn()} />);
    const list = screen.getByRole('list', { name: '選択可能な項目' });
    expect(list).not.toHaveTextContent('managers');
  });

  it('選択済みはタグとして表示される', () => {
    render(<MultiSelectPicker options={options} value={[options[0]]} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '管理者 を削除' })).toBeInTheDocument();
  });

  it('タグの × で選択が解除される', async () => {
    const onChange = vi.fn();
    render(<MultiSelectPicker options={options} value={[options[0]]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '管理者 を削除' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('該当なしのとき noResultsText を表示する', async () => {
    render(<MultiSelectPicker options={options} value={[]} onChange={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('検索...'), 'zzz');
    expect(screen.getByText('選択可能な項目はありません')).toBeInTheDocument();
  });

  it('maxSelected に達したらそれ以上追加できない', async () => {
    const onChange = vi.fn();
    render(<MultiSelectPicker options={options} value={[options[0]]} onChange={onChange} maxSelected={1} />);
    await userEvent.click(screen.getByText('利用者'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('検索欄の × で検索語がクリアされる', async () => {
    render(<MultiSelectPicker options={options} value={[]} onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('検索...');
    await userEvent.type(input, '管理');
    await userEvent.click(screen.getByRole('button', { name: '検索語をクリア' }));
    expect(input).toHaveValue('');
  });
});
