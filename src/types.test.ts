import { describe, it, expect } from 'vitest';
import type { SelectOption } from './types';

describe('SelectOption', () => {
  it('id と label を持ち、sublabel と disabled は省略できる', () => {
    const minimum: SelectOption = { id: '1', label: '管理者' };
    const full: SelectOption = { id: '2', label: '利用者', sublabel: 'employee', disabled: true };
    expect(minimum.sublabel).toBeUndefined();
    expect(full.sublabel).toBe('employee');
  });
});
