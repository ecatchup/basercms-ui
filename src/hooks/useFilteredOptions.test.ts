import { describe, it, expect } from 'vitest';
import { filterOptions } from './useFilteredOptions';
import type { SelectOption } from '../types';

const options: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'managers' },
  { id: '2', label: '利用者', sublabel: 'employee' },
  { id: '3', label: '（株）Gakken LX' },
];

describe('filterOptions', () => {
  it('検索語が空なら全件返す', () => {
    expect(filterOptions(options, '')).toHaveLength(3);
  });

  it('空白のみの検索語も全件返す', () => {
    expect(filterOptions(options, '   ')).toHaveLength(3);
  });

  it('label に部分一致する', () => {
    const result = filterOptions(options, '管理');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('sublabel に部分一致する', () => {
    const result = filterOptions(options, 'employee');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('大文字小文字を区別しない', () => {
    const result = filterOptions(options, 'gakken');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('sublabel を持たない選択肢でも落ちない', () => {
    expect(filterOptions(options, 'managers')).toHaveLength(1);
  });

  it('一致しなければ空配列を返す', () => {
    expect(filterOptions(options, 'zzz')).toEqual([]);
  });
});
