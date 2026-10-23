import { Alert, Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { MOBILE_PILL_CTA } from '../../../shared/ui';
import type { AddToCartController } from '../model/add-to-cart-controller';

export type AddToCartButtonProps = {
  nftId: string;
  editionId: string;
  quantity: number;
  controller: AddToCartController;
  disabled?: boolean;
};

/* O alerta contem so a mensagem; "Tentar novamente" fica fora dele e o rotulo de tom do DS fica vazio (como FailureAlert). */
export function AddToCartButton({ nftId, editionId, quantity, controller, disabled = false }: AddToCartButtonProps) {
  const { t } = useTranslation('addToCart');
  const { failure } = controller;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-12 tablet:flex-none">
      <Button
        size="block"
        className={MOBILE_PILL_CTA + ' text-body-large-16-bold-lh-20 tablet:w-auto tablet:px-24 tablet:text-body-14-bold-lh-16 tablet:uppercase'}
        disabled={disabled}
        loading={controller.pending}
        onClick={() => controller.submit({ nftId, editionId, quantity })}
      >
        {t('buy')}
      </Button>
      {failure ? (
        <Alert tone="error" toneLabel="">
          {t(`failure.${failure.kind}`)}
        </Alert>
      ) : null}
      {failure?.kind === 'network' ? (
        <Button variant="outline" onClick={controller.retry} className="self-start">
          {t('retry')}
        </Button>
      ) : null}
    </div>
  );
}
