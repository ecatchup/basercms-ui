import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectedTags } from './SelectedTags';
import type { SelectOption } from '../types';

const items: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'managers' },
  { id: '2', label: '利用者', sublabel: 'employee' },
];

describe('SelectedTags', () => {
  it('選択が空なら空文言を表示する', () => {
    render(<SelectedTags items={[]} onRemove={vi.fn()} />);
    expect(screen.getByText('選択されていません')).toBeInTheDocument();
  });

  it('空文言は上書きできる', () => {
    render(<SelectedTags items={[]} onRemove={vi.fn()} emptyText="未選択" />);
    expect(screen.getByText('未選択')).toBeInTheDocument();
  });

  it('label を表示し、sublabel は表示しない', () => {
    render(<SelectedTags items={items} onRemove={vi.fn()} />);
    expect(screen.getByText('管理者')).toBeInTheDocument();
    expect(screen.queryByText(/managers/)).not.toBeInTheDocument();
  });

  it('× をクリックすると該当 id で onRemove が呼ばれる', async () => {
    const onRemove = vi.fn();
    render(<SelectedTags items={items} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: '利用者 を削除' }));
    expect(onRemove).toHaveBeenCalledWith('2');
  });

  it('disabled のとき × は押せない', async () => {
    const onRemove = vi.fn();
    render(<SelectedTags items={items} onRemove={onRemove} disabled />);
    const button = screen.getByRole('button', { name: '管理者 を削除' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onRemove).not.toHaveBeenCalled();
  });
});
