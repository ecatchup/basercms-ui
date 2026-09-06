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

## 幅

`SearchSelect` の幅の調整点は、**ルート要素ひとつ**に集約されています。

ルート要素（`.bca-search-select`）の既定は `display: inline-block` で、幅は中身（選択中のラベル、または未選択時はプレースホルダ）に応じた内容幅になります。部品が親要素いっぱいに広がることはありません。トリガーとドロップダウンはどちらもルート要素の幅に追従する為、利用側が指定するのはルート要素の幅だけで済みます。

幅いっぱいにしたい場合は、`className` を渡して利用側の CSS で `width: 100%` を指定してください。トリガーもドロップダウンも一緒に追従します。

```tsx
<SearchSelect className="my-search-select" options={options} value={value} onChange={setValue} />
```

```css
.my-search-select {
  width: 100%;
}
```

トリガーの `display` は部品側では宣言していません。baserCMS 環境では既定の `triggerProps`（`className: 'bca-textbox__input'`）の `inline-block` がそのまま効き、それ以外の環境では部品同梱の `:where()` の既定（`inline-block`）が効きます。`triggerProps` にインラインスタイルを渡せば上書きできます。

```tsx
<SearchSelect triggerProps={{ className: 'bca-textbox__input', style: { display: 'flex' } }} ... />
```

なお、ルート要素の幅を指定しないと `overflow` / `text-overflow: ellipsis` によるラベルの省略表示は発動しません（省略は要素の幅が中身より狭いときに効くため、幅が中身に合わせて伸びる状態では発動しようがありません）。長いラベルを省略したい場合は、上記のように `className` で幅を制限してください。

一方、`MultiSelectPicker` の検索欄など、モーダル内で使われる要素は従来どおり幅いっぱい（`width: 100%`）のままです。これらはモーダルという明確な幅を持つコンテナの中に置かれるため、幅いっぱいが自然な既定だからです。

## ボタンのクラス・属性（既定で baserCMS のボタンスタイルが当たります）

`MultiSelectField` の `addButtonProps`、`MultiSelectDialog` の `submitButtonProps` /
`cancelButtonProps` は、既定で以下の値になっています（baserCMS の `.bca-btn` を
前提にしています）。

| prop | 既定値 |
| --- | --- |
| `addButtonProps`（MultiSelectField） | `{ className: 'bca-btn', 'data-bca-btn-type': 'add' }` |
| `submitButtonProps`（MultiSelectDialog） | `{ className: 'bca-btn', 'data-bca-btn-type': 'save' }` |
| `cancelButtonProps`（MultiSelectDialog） | `{ className: 'bca-btn' }` |

**既定値は「置き換え」です。マージではありません。** 何か1つでも渡すと、既定値は使われず渡した内容がそのまま使われます。既定のクラス・属性が不要な場合は空オブジェクト（`{}`）を渡してください。ただしこれで置き換わるのは追加のクラス・属性だけで、部品自身の BEM クラス（`bca-multi-select-field__add` 等）は常に付くため、`{}` を渡しても部品同梱の CSS は効き続けます（baserCMS のボタンスタイルだけ外したい場合に使えます）。`MultiSelectField` に渡した `submitButtonProps` / `cancelButtonProps` はモーダルへそのまま転送されます。`type` / `onClick` / `disabled` は部品側が制御するため渡せません。

```tsx
// baserCMS 以外の見た目にしたい場合
<MultiSelectField
  addButtonProps={{ className: 'my-add-button' }}
  submitButtonProps={{ className: 'my-submit-button' }}
  cancelButtonProps={{ className: 'my-cancel-button' }}
  ...
/>

// 何も付けたくない場合
<MultiSelectField
  addButtonProps={{}}
  submitButtonProps={{}}
  cancelButtonProps={{}}
  ...
/>
```

## 入力欄のクラス・属性（既定で baserCMS の input スタイルが当たります）

`SearchSelect` の `triggerProps` / `searchInputProps`、`MultiSelectPicker` の
`searchInputProps` は、既定で以下の値になっています（baserCMS の
`.bca-textbox__input` を前提にしています）。

| prop | 既定値 |
| --- | --- |
| `triggerProps`（SearchSelect） | `{ className: 'bca-textbox__input' }` |
| `searchInputProps`（SearchSelect） | `{ className: 'bca-textbox__input' }` |
| `searchInputProps`（MultiSelectPicker） | `{ className: 'bca-textbox__input' }` |

**既定値は「置き換え」です。マージではありません。** 何か1つでも渡すと、既定値は使われず渡した内容がそのまま使われます。既定のクラス・属性が不要な場合は空オブジェクト（`{}`）を渡してください。ただしこれで置き換わるのは追加のクラス・属性だけで、部品自身の BEM クラス（`bca-search-select__trigger` 等）は常に付くため、`{}` を渡しても部品同梱の CSS は効き続けます（baserCMS の input スタイルだけ外したい場合に使えます）。`MultiSelectDialog` / `MultiSelectField` に渡した `searchInputProps` は、内部の `MultiSelectPicker` の検索欄へそのまま転送されます。`type` / `value` / `onChange` / `placeholder` / `disabled`（`triggerProps` では加えて `role` / `tabIndex` / `onClick` / `onKeyDown` / ARIA 属性）は部品側が制御するため渡せません。

```tsx
// baserCMS 以外の見た目にしたい場合
<SearchSelect
  triggerProps={{ className: 'my-trigger' }}
  searchInputProps={{ className: 'my-search-input' }}
  ...
/>

// 何も付けたくない場合
<SearchSelect
  triggerProps={{}}
  searchInputProps={{}}
  ...
/>
```

## フォーム連携

`name` を渡すと hidden input を描画します。

```tsx
<SearchSelect name="data[User][approver_id]" ... />       // hidden 1つ
<MultiSelectField name="data[User][group_ids][]" ... />   // 選択件数分の hidden
```

## 落とし穴: 複数選択で「全部外す」と何も送信されない問題

HTML フォームには、選択が 0 件だと**そのキー自体が送信されない**という性質があります。

```
2件選択 → data[User][group_ids][] = 5
          data[User][group_ids][] = 8
全部外す → （何も送信されない）
```

サーバー側はこれを「全部外した」のか「そもそもこのフォームにこの項目が無かった」のか区別できません。結果として、**全解除の保存ができない**という不具合になります（`SearchSelect` の単一選択は未選択でも `value=""` の hidden が常に1つ出るため、この問題は起きません）。

`MultiSelectField` は `name` を渡すと、既定でこの問題を解決する「センチネル」の hidden を追加で出力します。

```html
<input type="hidden" name="data[User][group_ids]" value="">      ← センチネル（[] なし・常に出力）
<input type="hidden" name="data[User][group_ids][]" value="5">   ← 選択分（[] あり）
<input type="hidden" name="data[User][group_ids][]" value="8">
```

**なぜセンチネルの name から `[]` を外すのか。** `name` をそのまま（`[]` 付きの配列記法）にして空の hidden を送ると、サーバー側では `['']`（要素が1つだけの配列）として届きます。PHP の `empty($value)` はこれに対して `false`（＝値がある）を返してしまうため、必須チェックが素通りしてしまいます。`[]` を外すと、全解除時はセンチネルの `''`（空文字列）だけが届き、`empty()` は正しく `true` を返します。これは CakePHP の `FormHelper::select()`（`multiple` 指定時）が採用しているのと同じ方式です。

このパッケージは、`name` の末尾に `[]` があればそれを取り除いた name をセンチネルに自動採用します。挙動を変えたい場合は `emptyName` で上書き・無効化できます。なお、空文字（`""`）を渡した場合も `false` と同じくセンチネルは出力されません（動的に組み立てた name が意図せず空文字になる場合はご注意ください）。

```tsx
<MultiSelectField name="data[User][group_ids][]" ... />
// → センチネルは自動で "data[User][group_ids]"（[] なし）

<MultiSelectField name="data[User][group_ids][]" emptyName="custom_name" ... />
// → センチネルの name を "custom_name" にする

<MultiSelectField name="data[User][group_ids][]" emptyName={false} ... />
// → センチネルを出力しない（自前でハンドリングしたい場合）
```

センチネルは選択件数に関わらず常に出力され、選択分の hidden より DOM 上で前に出ます。これも CakePHP と同じ順序で、PHP のフォーム解析では同名キーが複数あると「後に来た方が勝つ」ため、センチネルを先に出すことで、選択がある場合はその値で正しく上書きされます。

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
