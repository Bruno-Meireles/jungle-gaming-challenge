import { Tabs, TabsList, TabsTrigger } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { VIEW_IDS, type ViewId } from '../../../shared/api/contracts/ids';

type CatalogViewTabsProps = { value: ViewId; onChange: (view: ViewId) => void };

// Abas sem painel: sao um filtro de subconjunto (Q4); as setas ativam a aba (Radix, ativacao automatica).
export function CatalogViewTabs({ value, onChange }: CatalogViewTabsProps) {
  const { t } = useTranslation('viewTabs');
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        const view = VIEW_IDS.find((id) => id === next);
        if (view !== undefined) onChange(view);
      }}
    >
      <TabsList aria-label={t('label')} className="gap-20">
        {VIEW_IDS.map((id) => (
          <TabsTrigger key={id} value={id}>
            {t(`options.${id}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
