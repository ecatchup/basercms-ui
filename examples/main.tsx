import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SearchSelect, MultiSelectField, MultiSelectPicker } from '../src';
import type { SelectOption } from '../src';

const groups: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'admin' },
  { id: '2', label: '一般ユーザー', sublabel: 'member' },
  { id: '3', label: '営業部', sublabel: 'sales' },
  { id: '4', label: '開発部', sublabel: 'dev' },
  { id: '5', label: '人事部', sublabel: 'hr' },
  { id: '6', label: 'マーケティング部', sublabel: 'marketing' },
];

const users: SelectOption[] = [
  { id: '10', label: '山田太郎' },
  { id: '11', label: '佐藤花子' },
  { id: '12', label: '鈴木一郎' },
  { id: '13', label: 'たなかゆき' },
  { id: '14', label: '株式会社サンプル' },
];

const Demo = () => {
  const [user, setUser] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<SelectOption[]>([]);
  const [inline, setInline] = useState<SelectOption[]>([]);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>@ecatchup/basercms-ui デモ</h1>

      <h2>SearchSelect（単一選択）</h2>
      <SearchSelect
        options={users}
        value={user}
        onChange={setUser}
        emptyLabel="指定なし"
        name="data[User][approver_id]"
      />
      <p>選択値: {user ?? '(なし)'}</p>

      <h2>SearchSelect ＋ baserCMS の日付ピッカー（高さ・マージンの確認用）</h2>
      <p>
        baserCMS 管理画面の <code>.bca-textbox__input</code> を想定した CSS をこのデモにのみ適用している
        （<code>index.html</code> 参照。実配布物には含まれない）。SearchSelect のトリガーは既定で
        <code>triggerProps</code> により <code>bca-textbox__input</code> クラスが付き、隣の
        <code>&lt;input type="date"&gt;</code> と縦位置・高さが揃うはず。
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: '1 1 auto' }}>
          <SearchSelect options={users} value={user} onChange={setUser} emptyLabel="指定なし" />
        </div>
        <input type="date" className="bca-textbox__input" />
      </div>

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
