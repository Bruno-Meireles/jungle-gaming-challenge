import { QuantityStepper } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

export type LineQuantityControlProps = {
  title: string;
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (quantity: number) => void;
};

export function LineQuantityControl({ title, value, max, disabled = false, onChange }: LineQuantityControlProps) {
  const { t } = useTranslation('cartLineControls');
  return (
    <fieldset disabled={disabled} className="m-0 border-0 p-0">
      <QuantityStepper
        size="sm"
        value={value}
        min={1}
        max={Math.max(max, 1)}
        onValueChange={onChange}
        label={t('quantity', { title })}
        decrementLabel={t('decrement', { title })}
        incrementLabel={t('increment', { title })}
      />
    </fieldset>
  );
}
