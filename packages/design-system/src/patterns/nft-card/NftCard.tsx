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
        { className: cn('after:absolute after:inset-0 after:content-[""]', link.props.className) },
        title,
      )
    : title;
  return (
    <article data-slot="nft-card" className="relative flex w-full flex-col">
      <div data-slot="nft-card-media" className="relative overflow-hidden bg-surface-card">
        <img src={image.src} alt={image.alt} />
        {badge ? <div className="absolute top-16 left-0">{badge}</div> : null}
      </div>
      <div data-slot="nft-card-info" className="flex flex-col">
        <h3 className="text-foreground">{heading}</h3>
        <p className="text-text-accent">{priceLabel}</p>
      </div>
      {action ? <div className="absolute top-12 right-11 z-10">{action}</div> : null}
    </article>
  );
}
