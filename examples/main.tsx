import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SearchSelect, MultiSelectField, MultiSelectPicker } from '../src';
import type { SelectOption } from '../src';

const groups: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'managers' },
  { id: '2', label: '利用者', sublabel: 'employee' },
  { id: '3', label: '（株）学研ビジネスブレインズ（正社員）', sublabel: 'com_rft_A023' },
  { id: '4', label: '（株）学研エデュケーショナル', sublabel: 'com_3000' },
  { id: '5', label: '10_学研正社員', sublabel: 'gw_10_syain' },
  { id: '6', label: '19_グループ会社正社員', sublabel: 'gw_19_group_seisyain' },
];

const users: SelectOption[] = [
  { id: '10', label: '（株）学研プロダクツサポート' },
  { id: '11', label: '（株）Gakken' },
  { id: '12', label: '（株）Gakken LEAP' },
  { id: '13', label: '（株）Gakken LX' },
  { id: '14', label: '（株）Gakken SEED' },
];

const Demo = () => {
  const [user, setUser] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<SelectOption[]>([]);
  const [inline, setInline] = useState<SelectOption[]>([]);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>@ecatchup/catchup-ui デモ</h1>

      <h2>SearchSelect（単一選択）</h2>
      <SearchSelect
        options={users}
        value={user}
        onChange={setUser}
        emptyLabel="指定なし"
        name="data[User][approver_id]"
      />
      <p>選択値: {user ?? '(なし)'}</p>

      <h2>MultiSelectField（タグ形式）</h2>
      <MultiSelectField
        options={groups}
        value={selectedGroups}
        onChange={setSelectedGroups}
        name="data[User][group_ids][]"
      />
      <p>選択値: {selectedGroups.map((g) => g.id).join(', ') || '(なし)'}</p>

      <h2>MultiSelectPicker（ページ直置き）</h2>
      <MultiSelectPicker options={groups} value={inline} onChange={setInline} listHeight={180} />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Demo />
  </StrictMode>
);
