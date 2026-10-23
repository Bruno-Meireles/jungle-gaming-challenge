import { Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

export type ConfirmPhase = 'idle' | 'revalidating' | 'submitting';

export type ConfirmPurchaseButtonProps = { phase: ConfirmPhase; canConfirm: boolean; onConfirm: () => void };

export function ConfirmPurchaseButton({ phase, canConfirm, onConfirm }: ConfirmPurchaseButtonProps) {
  const { t } = useTranslation('placeOrder');
  const busy = phase !== 'idle';
  const disabled = busy || !canConfirm;
  return (
    <Button
      size="block"
      aria-disabled={disabled ? true : undefined}
      aria-busy={busy ? true : undefined}
      className={disabled ? 'opacity-60' : undefined}
      onClick={() => {
        if (!disabled) onConfirm();
      }}
    >
      {t(`button.${phase}`)}
    </Button>
  );
}
