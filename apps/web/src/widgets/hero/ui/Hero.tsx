import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHighlightsQuery } from '../../../entities/nft';
import { HeroCopy } from './HeroCopy';
import { HeroDots } from './HeroDots';
import { HeroSlides } from './HeroSlides';

// Carrossel manual (sem autoplay): bolinhas, deslizar/arrastar e transicao deslizante (desligada com movimento reduzido).
export function Hero({ exploreTargetId }: { exploreTargetId: string }) {
  const { t } = useTranslation(['hero', 'nft']);
  const { data } = useHighlightsQuery();
  const [index, setIndex] = useState(0);
  const slides = data?.hero ?? [];

  const explore = () => document.getElementById(exploreTargetId)?.focus();

  return (
    <section
      aria-label={t('hero:label')}
      className="relative isolate mx-8 flex overflow-hidden tablet:overflow-visible min-h-190 items-center gap-8 rounded-12 bg-linear-to-br from-primary/20 to-primary/5 px-16 pb-32 pt-16 tablet:mx-0 tablet:min-h-300 tablet:gap-24 tablet:rounded-0 tablet:bg-none tablet:p-0 desktop:h-450 desktop:items-start desktop:gap-110 desktop:pl-40 desktop:pt-43"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -z-10 -left-80 -top-31 size-248 rounded-full bg-linear-to-br from-primary-light/43 to-primary/4 tablet:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute -z-10 -top-10 left-73 size-248 rounded-full bg-linear-to-br from-primary-light/37 to-primary/0 tablet:hidden" />
      <HeroCopy onExplore={explore} />
      {slides.length > 0 ? (
        <HeroSlides slides={slides} index={index} onChange={setIndex} />
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
