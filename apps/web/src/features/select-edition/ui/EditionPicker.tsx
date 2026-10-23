import { ChipGroup, ChipGroupItem } from '@jg/design-system';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { editionLabel, isSoldOut, type Edition } from '../../../entities/nft';
import { useLocale } from '../../../shared/hooks';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthAmount } from '../../../shared/lib/eth/format-eth';

export type EditionPickerProps = {
  editions: readonly Edition[];
  selectedId: string;
  onSelect: (editionId: string) => void;
};

function EditionOption({ edition }: { edition: Edition }) {
  const { t } = useTranslation(['editionPicker', 'nft', 'shared']);
  const locale = useLocale();
  const id = useId();
  const label = editionLabel(edition.kind);
  const soldOut = isSoldOut(edition);
  const price = t('shared:eth.amount', { amount: formatEthAmount(asEthAmount(edition.priceEth), locale) });
  const text = label.key === 'edition.open' ? t('nft:edition.open') : t('nft:edition.limited', label.params);
  const labelId = `${id}-label`;
  const priceId = `${id}-price`;
  const soldId = `${id}-sold`;
  return (
    <ChipGroupItem
      value={edition.id}
      disabled={soldOut}
      aria-labelledby={labelId}
      aria-describedby={soldOut ? `${priceId} ${soldId}` : priceId}
      className="gap-8"
    >
      <span id={labelId}>{text}</span>
      <span id={priceId}>{price}</span>
      {soldOut ? <span id={soldId}>{t('editionPicker:soldOut')}</span> : null}
    </ChipGroupItem>
  );
}

export function EditionPicker({ editions, selectedId, onSelect }: EditionPickerProps) {
  const { t } = useTranslation('editionPicker');
  return (
    <ChipGroup aria-label={t('group')} value={selectedId} onValueChange={onSelect} loop={false}>
      {editions.map((edition) => (
        <EditionOption key={edition.id} edition={edition} />
      ))}
    </ChipGroup>
  );
}
