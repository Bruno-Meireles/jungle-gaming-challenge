import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHighlightsQuery } from '../../../entities/nft';
import { HeroCopy } from './HeroCopy';
import { HeroDots } from './HeroDots';

// Carrossel manual: sem autoplay e sem transicao animada (movimento reduzido satisfeito por construcao).
export function Hero({ exploreTargetId }: { exploreTargetId: string }) {
  const { t } = useTranslation(['hero', 'nft']);
  const { data } = useHighlightsQuery();
  const [index, setIndex] = useState(0);
  const slides = data?.hero ?? [];
  const active = slides[index];

  const explore = () => document.getElementById(exploreTargetId)?.focus();

  return (
    <section
      aria-label={t('hero:label')}
      className="relative mx-8 flex min-h-190 items-center gap-8 rounded-12 bg-linear-to-br from-primary/20 to-primary/5 px-16 pb-32 pt-16 tablet:mx-0 tablet:min-h-300 tablet:gap-24 tablet:rounded-0 tablet:bg-none tablet:p-0 desktop:h-450 desktop:items-start desktop:gap-110 desktop:pl-40 desktop:pt-43"
    >
      <HeroCopy onExplore={explore} />
      {active ? (
        <img
          src={active.image.src}
          width={active.image.width}
          height={active.image.height}
          alt={t('nft:image.alt', { title: active.title })}
          fetchPriority="high"
          decoding="async"
          className="size-138 shrink-0 rounded-16 object-cover tablet:size-300 tablet:rounded-24 desktop:size-450"
        />
      ) : (
        <div aria-hidden="true" className="size-138 shrink-0 tablet:size-300 desktop:size-450" />
      )}
      {slides.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 tablet:bottom-24 tablet:left-auto tablet:right-348 tablet:translate-x-0 desktop:bottom-35 desktop:right-auto desktop:left-592">
          <HeroDots total={slides.length} activeIndex={index} onSelect={setIndex} />
        </div>
      )}
    </section>
  );
}
