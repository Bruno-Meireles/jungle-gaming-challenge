import { useTranslation } from 'react-i18next';

import type { CartLineViewModel } from '../model/types';
import { CartLineItem } from './CartLineItem';

export type CartLinesProps = {
  lines: CartLineViewModel[];
  pendingLineIds?: ReadonlySet<string>;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
};

export function CartLines({ lines, pendingLineIds, onQuantityChange, onRemove }: CartLinesProps) {
  const { t } = useTranslation('cartLines');
  return (
    <ul aria-label={t('label')} className="m-0 flex list-none flex-col p-0">
      {lines.map((line) => (
        <CartLineItem
          key={line.lineId}
          line={line}
          pending={pendingLineIds?.has(line.lineId) ?? false}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
