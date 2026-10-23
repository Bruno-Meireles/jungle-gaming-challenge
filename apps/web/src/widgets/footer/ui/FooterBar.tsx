import { useTranslation } from 'react-i18next';

export function FooterBar() {
  const { t } = useTranslation('footer');
  return (
    <div className="flex flex-col gap-16 bg-surface-dark p-24 tablet:flex-row tablet:items-center tablet:justify-between desktop:px-32">
      <p className="text-body-14-bold-lh-16 text-foreground">{t('brand')}</p>
      <p className="max-w-219 text-body-14-bold-lh-16 text-foreground">{t('tagline')}</p>
      <a href={'mailto:' + t('email')} className="text-body-14-regular-lh-22 text-foreground focus-visible:outline-2 focus-visible:outline-focus">
        {t('email')}
      </a>
      <a href={'tel:' + t('phoneDigits')} className="text-body-14-regular-lh-22 text-foreground focus-visible:outline-2 focus-visible:outline-focus">
        {t('phone')}
      </a>
    </div>
  );
}
