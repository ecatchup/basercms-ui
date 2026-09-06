import type { ButtonHTMLAttributes } from 'react';

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
