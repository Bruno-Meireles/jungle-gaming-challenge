import { useTranslation } from 'react-i18next';

import type { NftSummary } from '../../../entities/nft';
import { useHeroSwipe } from '../model/use-hero-swipe';

const SIZE = 'size-138 shrink-0 tablet:size-300 desktop:size-450';
const FRAME = 'size-full overflow-hidden rounded-16 tablet:rounded-24';

/** Trilho horizontal: o slide ativo e o unico na arvore de acessibilidade; os demais ficam aria-hidden/inert. */
export function HeroSlides({
  slides,
  index,
  onChange,
}: {
  slides: readonly NftSummary[];
  index: number;
  onChange: (next: number) => void;
}) {
  const { t } = useTranslation('nft');
  const { dx, dragging, handlers } = useHeroSwipe({ index, total: slides.length, onChange });
  const offset = 'translateX(calc(' + String(-index * 100) + '% + ' + String(dx) + 'px))';
  const thumb = slides[(index + 1) % slides.length];
  return (
    <div className={'relative ' + SIZE}>
      <div
        className={
          FRAME + ' touch-pan-y select-none ' + (dragging ? 'cursor-grabbing' : 'cursor-grab')
        }
        {...handlers}
      >
        <div
          className={
            'flex size-full ' +
            (dragging
              ? ''
              : 'transition-transform duration-300 ease-out motion-reduce:transition-none')
          }
          style={{ transform: offset }}
        >
          {slides.map((slide, position) => (
            <img
              key={slide.id}
              src={slide.image.src}
              width={slide.image.width}
              height={slide.image.height}
              alt={t('image.alt', { title: slide.title })}
              draggable={false}
              fetchPriority={position === 0 ? 'high' : 'auto'}
              decoding="async"
              aria-hidden={position === index ? undefined : true}
              inert={position !== index}
              className="size-full shrink-0 rounded-16 object-cover tablet:rounded-24"
            />
          ))}
        </div>
      </div>
      {thumb ? (
        <img
          src={thumb.image.src}
          alt=""
          aria-hidden="true"
          width={58}
          height={58}
          draggable={false}
          className="pointer-events-none absolute -bottom-8 left-14 size-58 rounded-16 object-cover tablet:hidden"
        />
      ) : null}
    </div>
  );
}
