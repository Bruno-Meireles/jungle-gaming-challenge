import { useTranslation } from 'react-i18next';

const PILLARS = [
  { key: 'wallet', mark: 'W' },
  { key: 'creators', mark: 'C' },
  { key: 'alerts', mark: 'D' },
] as const;

export function FooterPillars() {
  const { t } = useTranslation('footer');
  return (
    <>
      {PILLARS.map(({ key, mark }) => (
        <section
          key={key}
          className="flex flex-col gap-12 border-b border-solid border-primary pb-24 desktop:border-b-0 desktop:border-r desktop:px-16 desktop:pb-0"
        >
          <span
            aria-hidden="true"
            className="flex size-40 items-center justify-center rounded-full border border-solid border-primary text-heading-24-bold text-text-accent"
          >
            {mark}
          </span>
          <h2 className="text-body-large-17-bold text-foreground">{t(`pillars.${key}.title`)}</h2>
          <p className="text-body-14-regular-lh-22 text-text-secondary">{t(`pillars.${key}.body`)}</p>
        </section>
      ))}
    </>
  );
}
