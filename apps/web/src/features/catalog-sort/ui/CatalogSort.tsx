import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { SORT_IDS, type SortId } from '../../../shared/api/contracts/ids';

type CatalogSortProps = {
  value: SortId;
  onChange: (sort: SortId) => void;
  /** `plain` e o texto sem borda da barra do Figma; `field` e o campo cheio usado no Sheet. */
  variant?: 'plain' | 'field';
};

const PLAIN = 'h-auto w-auto gap-8 border-0 px-0 text-body-15-regular-lh-16';

export function CatalogSort({ value, onChange, variant = 'plain' }: CatalogSortProps) {
  const { t } = useTranslation('sort');
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const sort = SORT_IDS.find((id) => id === next);
        if (sort !== undefined) onChange(sort);
      }}
    >
      <SelectTrigger aria-label={t('label')} className={variant === 'plain' ? PLAIN : ''}>
        <span className="flex items-center gap-8 text-foreground">
          <span>{t('prefix')}</span>
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {SORT_IDS.map((id) => (
          <SelectItem key={id} value={id}>
            {t(`options.${id}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
