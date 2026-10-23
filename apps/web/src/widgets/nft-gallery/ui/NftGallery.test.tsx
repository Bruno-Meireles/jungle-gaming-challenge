import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { mountWithRouter, nft, type Locale } from '../../../test-support/nft-detail';
import { NftGallery } from '..';

const TEXT = {
  'pt-BR': { view: (i: number, n: number) => `Ver imagem ${i} de ${n}` },
  en: { view: (i: number, n: number) => `View image ${i} of ${n}` },
} as const;

describe.each(['pt-BR', 'en'] as Locale[])('NftGallery (%s)', (locale) => {
  const t = TEXT[locale];
  const mount = (images = nft.gallery) => mountWithRouter(locale, <NftGallery title={nft.title} images={images} />);
  const main = () => page.getByRole('img', { name: nft.title, exact: false }).first();

  it('mostra a primeira imagem como principal, com dimensoes intrinsecas (sem layout shift)', async () => {
    await mount();
    await expect.element(main()).toHaveAttribute('src', '/img/ape-1.png');
    await expect.element(main()).toHaveAttribute('width', '800');
    await expect.element(main()).toHaveAttribute('height', '800');
  });

  it('uma miniatura-botao por imagem, a atual com aria-pressed', async () => {
    await mount();
    await expect.element(page.getByRole('button', { name: t.view(1, 3), exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('button', { name: t.view(2, 3), exact: true })).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicar na miniatura troca a imagem principal', async () => {
    await mount();
    await page.getByRole('button', { name: t.view(3, 3), exact: true }).click();
    await expect.element(main()).toHaveAttribute('src', '/img/ape-3.png');
    await expect.element(page.getByRole('button', { name: t.view(3, 3), exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  it('miniaturas alcancaveis por teclado (Enter troca)', async () => {
    await mount();
    (page.getByRole('button', { name: t.view(2, 3), exact: true }).element() as HTMLElement).focus();
    await page.getByRole('button', { name: t.view(2, 3), exact: true }).click();
    await expect.element(main()).toHaveAttribute('src', '/img/ape-2.png');
  });

  it('com uma unica imagem nao ha miniaturas', async () => {
    await mount(nft.gallery.slice(0, 1));
    expect(page.getByRole('button').elements()).toHaveLength(0);
  });
});
