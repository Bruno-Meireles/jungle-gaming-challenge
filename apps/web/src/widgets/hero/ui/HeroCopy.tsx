import { Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

// Duas copias fieis ao Figma (desktop e mobile); a oculta sai da arvore de acessibilidade (display: none).
export function HeroCopy({ onExplore }: { onExplore: () => void }) {
  const { t } = useTranslation('hero');
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-8 tablet:gap-32">
      <div className="flex flex-col gap-6 tablet:gap-4">
        <p className="text-caption-12-bold font-medium text-foreground tablet:text-body-14-medium-lh-16-ls-0">
          {t('eyebrow')}
        </p>
        <h1 className="text-body-large-18-bold-lh-24 uppercase text-foreground tablet:text-heading-28-bold desktop:text-display-43-bold">
          <span className="tablet:hidden">{t('title.short')}</span>
          <span className="hidden whitespace-pre-line tablet:inline">{t('title.long')}</span>
        </h1>
        <p className="text-caption-12-regular-lh-16 text-text-secondary tablet:max-w-557 tablet:text-body-14-regular-lh-24">
          <span className="tablet:hidden">{t('text.short')}</span>
          <span className="hidden tablet:inline">{t('text.long')}</span>
        </p>
      </div>
      <Button size="md" onClick={onExplore} className="rounded-6 px-36 text-body-large-16-bold-lh-auto uppercase">
        {t('explore')}
      </Button>
    </div>
  );
}
