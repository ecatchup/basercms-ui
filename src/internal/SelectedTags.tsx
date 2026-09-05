import type { SelectOption } from '../types';

type Props = {
  items: SelectOption[];
  onRemove: (id: string) => void;
  emptyText?: string;
  disabled?: boolean;
};

/**
 * 選択済みの項目をタグとして並べ、× で削除できるようにする内部部品
 *
 * sublabel は表示しない（一覧行のみに出す仕様）。
 */
export const SelectedTags = ({ items, onRemove, emptyText = '選択されていません', disabled = false }: Props) => {
  if (items.length === 0) {
    return <span className="cui-tags__empty">{emptyText}</span>;
  }

  return (
    <ul className="cui-tags">
      {items.map((item) => (
        <li key={item.id} className="cui-tags__item">
          <span className="cui-tags__label">{item.label}</span>
          <button
            type="button"
            className="cui-tags__remove"
            aria-label={`${item.label} を削除`}
            disabled={disabled}
            onClick={() => onRemove(item.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
};
