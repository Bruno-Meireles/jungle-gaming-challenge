import { useTranslation } from 'react-i18next';

import { COLLECTION_IDS, NETWORK_IDS } from '../../../shared/api/contracts/ids';
import type { CollectionId, NetworkId } from '../../../shared/api/contracts/ids';
import type { PriceRangeDto, PriceSelection } from '../model/price-range';
import { CheckboxGroup, type CheckboxOption } from './CheckboxGroup';
import { PriceFilter } from './PriceFilter';

export type FilterFacets = {
  collections: readonly { id: CollectionId; count: number }[];
  networks: readonly { id: NetworkId; count: number }[];
  priceRange: PriceRangeDto;
};

export type FilterValue = PriceSelection & {
  collections: readonly CollectionId[];
  networks: readonly NetworkId[];
};

export type CatalogFiltersProps = {
  /** Sem facetas (primeira carga) os grupos aparecem sem contagem e sem faixa de preco. */
  facets: FilterFacets | undefined;
  value: FilterValue;
  onChange: (patch: Partial<FilterValue>) => void;
  onApplyPrice?: () => void;
};

const toggled = <T extends string>(list: readonly T[], id: T, checked: boolean): T[] =>
  checked ? [...list, id] : list.filter((item) => item !== id);

export function CatalogFilters({ facets, value, onChange, onApplyPrice }: CatalogFiltersProps) {
  const { t } = useTranslation('filters');
  const options = <T extends string>(
    ids: readonly T[],
    counts: readonly { id: T; count: number }[] | undefined,
    labelOf: (id: T) => string,
  ): CheckboxOption<T>[] =>
    ids.map((id) => {
      const count = counts?.find((entry) => entry.id === id)?.count;
      const label = labelOf(id);
      return {
        id,
        label,
        count,
        accessibleName: count === undefined ? label : t('optionWithCount', { name: label, count }),
      };
    });
  return (
    <div className="flex flex-col gap-40">
      <CheckboxGroup
        title={t('collections.title')}
        options={options(COLLECTION_IDS, facets?.collections, (id) => t(`collections.options.${id}`))}
        selected={value.collections}
        onToggle={(id, checked) => onChange({ collections: toggled(value.collections, id, checked) })}
      />
      {facets ? (
        <PriceFilter
          range={facets.priceRange}
          value={value}
          onChange={(selection) => onChange({ min: selection.min, max: selection.max })}
          onApply={onApplyPrice}
        />
      ) : null}
      <CheckboxGroup
        title={t('networks.title')}
        options={options(NETWORK_IDS, facets?.networks, (id) => t(`networks.options.${id}`))}
        selected={value.networks}
        onToggle={(id, checked) => onChange({ networks: toggled(value.networks, id, checked) })}
      />
    </div>
  );
}
