import { useTranslation } from 'react-i18next';

const DOT = 'size-8 rounded-full bg-primary';
const DOT_INACTIVE = 'size-8 rounded-full bg-primary opacity-40';

export function HeroDots({
  total,
  activeIndex,
  onSelect,
}: {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const { t } = useTranslation('hero');
  return (
    <div role="group" aria-label={t('dotsLabel')} className="flex">
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={t('dot', { index: index + 1, total })}
          aria-current={index === activeIndex ? 'true' : undefined}
          onClick={() => onSelect(index)}
          className="flex size-24 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span
            aria-hidden="true"
            className={index === activeIndex ? DOT : DOT_INACTIVE}
          />
        </button>
      ))}
    </div>
  );
}
