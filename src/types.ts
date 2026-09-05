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
