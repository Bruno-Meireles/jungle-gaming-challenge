import { Button, RangeSlider } from '@jg/design-system';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocale } from '../../../shared/hooks';
import {
  boundsOf,
  formatSteps,
  selectionToSteps,
  stepsToSelection,
  type PriceRangeDto,
  type PriceSelection,
} from '../model/price-range';
import { FilterHeading } from './FilterHeading';

type PriceFilterProps = {
  range: PriceRangeDto;
  value: PriceSelection;
  onChange: (selection: PriceSelection) => void;
  /** Presente so no painel lateral, onde o preco so vale ao confirmar; no Sheet quem confirma e o painel. */
  onApply?: () => void;
};

export function PriceFilter({ range, value, onChange, onApply }: PriceFilterProps) {
  const { t } = useTranslation(['filters', 'shared']);
  const locale = useLocale();
  const titleId = useId();
  const bounds = boundsOf(range);
  const [lo, hi] = selectionToSteps(bounds, value);
  const text = (steps: number): string => t('shared:eth.amount', { amount: formatSteps(steps, locale) });
  return (
    <div role="group" aria-labelledby={titleId} className="flex flex-col gap-12">
      <FilterHeading id={titleId}>{t('filters:price.title')}</FilterHeading>
      <div className="flex flex-col gap-12 pt-12">
        <RangeSlider
          value={[lo, hi]}
          min={bounds.lo}
          max={bounds.hi}
          step={1}
          disabled={bounds.hi <= bounds.lo}
          onValueChange={(next) => onChange(stepsToSelection(bounds, next))}
          thumbLabels={[t('filters:price.min'), t('filters:price.max')]}
          getValueText={text}
        />
        <p className="m-0 text-body-15-regular-lh-16 text-foreground">
          {t('filters:price.range', { min: formatSteps(lo, locale), max: formatSteps(hi, locale) })}
        </p>
        {onApply ? (
          <Button size="md" className="h-36 min-w-[92px] self-start rounded-6 px-12 text-body-large-16-bold-lh-auto" onClick={onApply}>
            {t('filters:apply')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
