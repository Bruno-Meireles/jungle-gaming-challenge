import { Tabs, TabsContent, TabsList, TabsTrigger } from '@jg/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { VIEW_IDS, type ViewId } from '../../../shared/api/contracts/ids';

type CatalogViewTabsProps = { value: ViewId; onChange: (view: ViewId) => void; children: ReactNode };

/**
 * Raiz das abas de visao. O Radix liga cada aba a um tabpanel por `aria-controls`; por isso o conteudo da aba
 * ativa (`children`, em geral resultados e paginacao) fica dentro do `CatalogViewPanel` do mesmo `Tabs`.
 * O conteudo e o mesmo para toda visao (o servidor filtra por `view`), entao so a aba ativa monta o painel.
 */
export function CatalogViewTabs({ value, onChange, children }: CatalogViewTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        const view = VIEW_IDS.find((id) => id === next);
        if (view !== undefined) onChange(view);
      }}
    >
      {children}
    </Tabs>
  );
}

/** Lista de abas (as setas ativam a aba, Radix com ativacao automatica). Deve estar dentro de `CatalogViewTabs`. */
export function CatalogViewTabsList() {
  const { t } = useTranslation('viewTabs');
  return (
    <TabsList aria-label={t('label')} className="gap-16 desktop:gap-20">
      {VIEW_IDS.map((id) => (
        <TabsTrigger key={id} value={id} className="desktop:text-body-15-medium desktop:data-[state=active]:text-body-15-medium">
          {t(`options.${id}`)}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

/** Painel da aba ativa. `tabIndex={-1}`: o painel nao entra na ordem de Tab (o conteudo ja e focavel). */
export function CatalogViewPanel({ value, children }: { value: ViewId; children: ReactNode }) {
  return (
    <TabsContent value={value} tabIndex={-1} className="outline-none">
      {children}
    </TabsContent>
  );
}
