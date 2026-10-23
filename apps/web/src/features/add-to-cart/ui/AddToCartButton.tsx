import { Alert, Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

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
    <div className="flex flex-col gap-12">
      <Button
        size="block"
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
