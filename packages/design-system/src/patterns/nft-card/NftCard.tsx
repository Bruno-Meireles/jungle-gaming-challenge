/*
 * Card de NFT (patterns/nft-card). Componente burro: dinheiro chega pronto em `priceLabel` (string literal, nunca
 * convertida em numero); navegacao entra pela prop `link` (elemento clonado com o titulo, ex.: <a href>).
 * Card clicavel sem link aninhado: o link do titulo estica um ::after sobre o card inteiro; `action` fica acima
 * (relative z-10) e e focavel/clicavel a parte.
 */
import { cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type NftCardProps = {
  title: string;
  priceLabel: string;
  image: { src: string; alt: string };
  badge?: ReactNode;
  action?: ReactNode;
  link?: ReactElement;
};

type LinkProps = { className?: string; children?: ReactNode };

export function NftCard({ title, priceLabel, image, badge, action, link }: NftCardProps) {
  const heading = isValidElement<LinkProps>(link)
    ? cloneElement(
        link,
        { className: cn('block after:absolute after:inset-0 after:content-[""]', link.props.className) },
        title,
      )
    : title;
  return (
    <article data-slot="nft-card" className="relative flex w-full flex-col gap-8 tablet:gap-12">
      <div
        data-slot="nft-card-media"
        className="relative h-200 overflow-hidden rounded-20 bg-surface-card tablet:flex tablet:h-300 tablet:items-center tablet:justify-center tablet:rounded-0"
      >
        <img
          src={image.src}
          alt={image.alt}
          className="block size-full object-cover tablet:size-250 tablet:rounded-15"
        />
        {badge ? <div className="absolute top-16 left-0 flex">{badge}</div> : null}
      </div>
      <div data-slot="nft-card-info" className="flex flex-col pl-8 tablet:gap-6 tablet:pl-0">
        <h3 className="text-body-15-regular-lh-16 leading-[20px] text-foreground tablet:text-body-large-16-regular-lh-16 tablet:leading-[16px]">
          {heading}
        </h3>
        <p className="text-body-large-16-bold-lh-16 text-text-accent tablet:text-body-large-18-bold-lh-16">
          {priceLabel}
        </p>
      </div>
      {action ? <div className="absolute top-12 right-11 z-10 flex">{action}</div> : null}
    </article>
  );
}
