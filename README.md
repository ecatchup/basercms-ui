# @ecatchup/basercms-ui

検索付きの選択UIコンポーネント集。React 19 以降で動作し、react / react-dom 以外の依存を持ちません。

## インストール

```bash
npm install @ecatchup/basercms-ui
```

## 使い方

```tsx
import { SearchSelect, MultiSelectField } from '@ecatchup/basercms-ui';
import '@ecatchup/basercms-ui/style.css';
import type { SelectOption } from '@ecatchup/basercms-ui';

const options: SelectOption[] = [
  { id: '1', label: '管理者', sublabel: 'managers' },
  { id: '2', label: '利用者', sublabel: 'employee' },
];

// 単一選択
<SearchSelect options={options} value={value} onChange={setValue} emptyLabel="指定なし" />

// 複数選択（タグ形式）
<MultiSelectField options={options} value={selected} onChange={setSelected} />
```

## コンポーネント

| 名前 | 用途 |
| --- | --- |
| `SearchSelect` | 検索して1つ選ぶ |
| `MultiSelectField` | 追加ボタン＋選択済みタグ＋モーダルを一体にしたフォーム部品 |
| `MultiSelectDialog` | 複数選択のモーダル単体 |
| `MultiSelectPicker` | 検索＋一覧＋選択済みタグの中身のみ（ページ直置き用） |

`SearchSelect` は `searchPlaceholder`（検索欄の placeholder、既定「検索...」）を受け取れます。

## 選択肢の型

```ts
type SelectOption = {
  id: string;
  label: string;      // 表示名
  sublabel?: string;  // 一覧行にのみ括弧付きで表示。検索対象に含まれる
  disabled?: boolean;
};
```

`disabled: true` の選択肢は、キーボード操作・クリックのどちらでも選択できません。該当行には `data-disabled` / `aria-disabled` が付与されます。

データ取得は行いません。`options` は呼び出し側が用意してください。

## 複数選択の上限

`MultiSelectPicker` / `MultiSelectDialog` / `MultiSelectField` は `maxSelected` を受け取れます。`MultiSelectField` ではこれを**累計の選択件数の上限**として扱い、上限に達すると追加ボタンが無効になります。一方、`MultiSelectPicker` / `MultiSelectDialog` を単体で使う場合、`maxSelected` はその部品自身の選択状態（`value` / `initialValue`）に対する上限であり、それ以上の追加ができなくなります。

## モーダルの挙動（MultiSelectDialog / MultiSelectField）

モーダルは Escape キー・閉じるボタン（×）・キャンセルボタンで閉じます。誤操作防止のため、オーバーレイ（背景）のクリックでは閉じません。開いている間はフォーカスがモーダル内に閉じ込められます（Tab / Shift+Tab で外へ出ません）。

## 既存のデザインシステムのボタンスタイルを当てたい場合

baserCMS 等、既存のデザインシステムのボタンにクラス・data 属性を渡したい場合、
`MultiSelectField` の `addButtonProps`、`MultiSelectDialog` の `submitButtonProps` /
`cancelButtonProps` にオブジェクトを渡してください（`MultiSelectField` に渡した
`submitButtonProps` / `cancelButtonProps` はモーダルへそのまま転送されます）。渡した
`className` は部品側のクラスを置き換えず、後ろに連結されます。`type` / `onClick` /
`disabled` は部品側が制御するため渡せません。

```tsx
<MultiSelectField
  addButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'add' }}
  submitButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'submit' }}
  cancelButtonProps={{ className: 'bca-btn', 'data-bca-btn-type': 'cancel' }}
  ...
/>
```

## フォーム連携

`name` を渡すと hidden input を描画します。

```tsx
<SearchSelect name="data[User][approver_id]" ... />       // hidden 1つ
<MultiSelectField name="data[User][group_ids][]" ... />   // 選択件数分の hidden
```

## テーマ

CSS 変数を上書きしてください。

| 変数 | 既定値 |
| --- | --- |
| `--bca-accent` | `#D4EDC9` |
| `--bca-accent-hover` | `#E9F7E3` |
| `--bca-border` | `#ccc` |
| `--bca-radius` | `4px` |
| `--bca-font-size` | `14px` |
| `--bca-z-index` | `9999` |

## 開発

```bash
npm install
npm run dev    # 動作確認用デモ
npm test       # テスト
npm run build  # dist を生成
```

## ライセンス

MIT
