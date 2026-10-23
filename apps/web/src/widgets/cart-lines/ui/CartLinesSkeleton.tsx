import { Skeleton } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

export function CartLinesSkeleton({ rows = 3 }: { rows?: number }) {
  const { t } = useTranslation('cartLines');
  return (
    <div role="status" aria-label={t('loading')} className="flex flex-col gap-16">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-128 w-full rounded-8" />
      ))}
    </div>
  );
}
