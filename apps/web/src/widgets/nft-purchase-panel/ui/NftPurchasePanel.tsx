import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { clampQuantity, maxSelectableQuantity, type Edition } from '../../../entities/nft';
import { AddToCartButton, type AddToCartController } from '../../../features/add-to-cart';
import { EditionPicker } from '../../../features/select-edition';
import { FavoriteButton, type FavoriteButtonProps } from '../../../features/toggle-favorite';
import { useLocale } from '../../../shared/hooks';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import { stepsToEth } from '../../../shared/lib/eth/eth-steps';
import { formatEthAmount, formatEthFixed } from '../../../shared/lib/eth/format-eth';
import { QuantityControl } from './QuantityControl';

export type NftPurchasePanelProps = {
  nftId: string;
  editions: readonly Edition[];
  selectedEditionId: string;
  onSelectEdition: (editionId: string) => void;
  addToCart: AddToCartController;
  favorite: FavoriteButtonProps;
};

function PurchaseSection({
  nftId,
  edition,
  editions,
  onSelectEdition,
  addToCart,
  favorite,
}: Omit<NftPurchasePanelProps, 'selectedEditionId'> & { edition: Edition }) {
  const { t } = useTranslation(['purchasePanel', 'shared']);
  const locale = useLocale();
  const [requested, setRequested] = useState(1);
  const max = maxSelectableQuantity(edition);
  const quantity = clampQuantity(requested, max);
  const price = asEthAmount(edition.priceEth);
  const total = stepsToEth(quantity, price);
  return (
    <section aria-label={t('label')} className="flex flex-col gap-24">
      <p className="text-heading-24-bold text-text-accent">
        {t('shared:eth.amount', { amount: formatEthAmount(price, locale) })}
      </p>
      <EditionPicker editions={editions} selectedId={edition.id} onSelect={onSelectEdition} />
      <p className="flex items-baseline gap-8 text-body-14-regular-lh-16 text-foreground">
        <span>{t('total')}</span>
        <span className="text-title-20-regular-lh-10">
          {t('shared:eth.amount', { amount: formatEthFixed(total, locale, 2) })}
        </span>
      </p>
      <div className="flex flex-col gap-24 desktop:flex-row desktop:items-center desktop:justify-between">
        <div className="flex flex-col gap-8">
          <QuantityControl
            value={quantity}
            min={1}
            max={max}
            onValueChange={setRequested}
            label={t('quantity')}
            decrementLabel={t('decrease')}
            incrementLabel={t('increase')}
          />
          {max > 0 && quantity >= max ? (
            <p role="status" className="text-body-14-regular-lh-16 text-text-secondary">
              {t('maxReached', { max })}
            </p>
          ) : null}
        </div>
        <div className="flex items-start gap-12 tablet:items-stretch tablet:gap-12">
          <AddToCartButton
            nftId={nftId}
            editionId={edition.id}
            quantity={quantity}
            controller={addToCart}
            disabled={max === 0}
          />
          <FavoriteButton {...favorite} />
        </div>
      </div>
    </section>
  );
}

export function NftPurchasePanel({ selectedEditionId, ...rest }: NftPurchasePanelProps) {
  const edition = rest.editions.find((candidate) => candidate.id === selectedEditionId);
  return edition ? <PurchaseSection edition={edition} {...rest} /> : null;
}
