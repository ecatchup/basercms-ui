import { StrictMode, useEffect, useRef, useState } from 'react';
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

  // 実際に送信される hidden input を目で確認できるように、DOM から拾って表示する。
  // センチネル（[] なし・常に出る）が先頭に、選択分（[] あり）がその後に続くはず。
  const groupFieldRef = useRef<HTMLDivElement>(null);
  const [groupHiddenInputs, setGroupHiddenInputs] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    const hidden = groupFieldRef.current?.querySelectorAll<HTMLInputElement>('input[type="hidden"]') ?? [];
    setGroupHiddenInputs(Array.from(hidden).map((el) => ({ name: el.name, value: el.value })));
  }, [selectedGroups]);

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

      <h2>SearchSelect の幅（0.3.0〜: 既定では幅を指定しない）</h2>
      <p>
        0.3.0 から <code>SearchSelect</code> は幅を指定しない。ラベルの右に置くような場面では
        中身（選択中のラベル or プレースホルダ）に応じて伸縮し、幅いっぱいにしたい場合は
        <code>className</code>（このデモでは <code>demo-full-width</code>、README 参照）で
        利用側が指定する。ラベルと横並び（flex）で並べたときの違いが分かりやすいので、
        あえてその文脈で両方を並べている。
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 120 }}>幅を指定しない:</span>
        <SearchSelect options={users} value={user} onChange={setUser} emptyLabel="指定なし" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 120 }}>className で幅いっぱい:</span>
        <SearchSelect
          className="demo-full-width"
          options={users}
          value={user}
          onChange={setUser}
          emptyLabel="指定なし"
        />
      </div>

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
      <p>
        選択を 0 件にすると、HTML フォームの性質上そのキー自体が送信されなくなる問題を、
        このパッケージは name の末尾の <code>[]</code> を外したセンチネル hidden を
        常に先頭へ出すことで回避している（README「落とし穴」参照）。下の一覧は
        実際に送信される hidden input を DOM から拾って表示したもの。選択を変えて確認できる。
      </p>
      <div ref={groupFieldRef}>
        <MultiSelectField
          options={groups}
          value={selectedGroups}
          onChange={setSelectedGroups}
          name="data[User][group_ids][]"
        />
      </div>
      <p>選択値: {selectedGroups.map((g) => g.id).join(', ') || '(なし)'}</p>
      <p>実際に送信される hidden input（上から DOM 順。センチネルが先頭、選択分が後続）:</p>
      <ul style={{ fontFamily: 'monospace', fontSize: 13, background: '#f5f5f5', padding: '8px 24px' }}>
        {groupHiddenInputs.map((input, i) => (
          <li key={i}>
            name="{input.name}" value="{input.value}"
            {i === 0 && ' ← センチネル（常に出る）'}
          </li>
        ))}
      </ul>

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
