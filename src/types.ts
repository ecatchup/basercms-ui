import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';

/**
 * 選択肢の共通型
 *
 * sublabel は一覧行にのみ括弧付きで表示し、検索対象に含める。
 * 選択済みタグには表示しない。
 */
export type SelectOption = {
  id: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
};

/**
 * 部品内のボタン（追加ボタン、モーダルの決定/キャンセルボタン）へ、利用側から
 * 任意のクラス・data 属性等を渡すための型。
 *
 * `type` / `onClick` / `disabled` は部品側が制御する（type="button" の強制、開閉の
 * ハンドラ、無効化判定）ため除外している。baserCMS 等、既存のデザインシステムの
 * ボタンスタイル（クラス＋ data 属性）を当てたい場合に使う。
 */
export type ButtonPassthroughProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick' | 'disabled'
> & {
  // data-* 属性（baserCMS の data-bca-btn-type 等）を型で受け取れるようにする
  [key: `data-${string}`]: string | number | boolean | undefined;
};

/**
 * 部品内の検索欄（input）へ、利用側から任意のクラス・data 属性等を渡すための型。
 *
 * `type` / `value` / `onChange` / `placeholder` / `disabled` は部品側が制御する
 * ため除外している。baserCMS 等、既存のデザインシステムの input スタイル
 * （クラス＋ data 属性）を当てたい場合に使う。
 */
export type InputPassthroughProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'placeholder' | 'disabled'
> & {
  // data-* 属性（baserCMS の data-bca-btn-type 等）を型で受け取れるようにする
  [key: `data-${string}`]: string | number | boolean | undefined;
};

/**
 * `SearchSelect` のトリガー（閉じた状態の div）へ、利用側から任意のクラス・
 * data 属性等を渡すための型。
 *
 * `role` / `tabIndex` / `onClick` / `onKeyDown` / `aria-expanded` /
 * `aria-haspopup` / `aria-disabled` / `aria-controls` / `aria-activedescendant`
 * は部品側が制御する（開閉のハンドラ、ARIA 属性の同期）ため除外している。
 * baserCMS 等、既存のデザインシステムの input スタイル（クラス＋ data 属性）を
 * 当てたい場合に使う。
 */
export type TriggerPassthroughProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'tabIndex' | 'onClick' | 'onKeyDown' | 'aria-expanded' | 'aria-haspopup' | 'aria-disabled' | 'aria-controls' | 'aria-activedescendant'
> & {
  // data-* 属性（baserCMS の data-bca-btn-type 等）を型で受け取れるようにする
  [key: `data-${string}`]: string | number | boolean | undefined;
};
