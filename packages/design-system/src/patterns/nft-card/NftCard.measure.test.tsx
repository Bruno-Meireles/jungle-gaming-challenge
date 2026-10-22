import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { NftCard } from './NftCard';

/*
 * Medidas (ADR-08), docs/figma/file.json. Imagem local (data URI).
 *
 * Desktop 1440 - tela "Desktop / Inicio" 2:2, Product Grid 70342:2830, linhas "Frame 230/231" (cards 70342:2805/2808/2811):
 *  - card 258x350, auto layout vertical gap 12;
 *  - area de midia "Frame 207/211/214" 258x300, fill #241612 = --color-surface-card = rgb(36, 22, 18), sem raio;
 *  - arte "NFT Artwork" 250x250, cornerRadius 15 (4:137, --radius-15);
 *  - bloco de texto "Frame 208/210/213" (164x38), gap 6: titulo 16/400 lh16 #F5F1EB (4:224), preco 18/700 lh16 #E89B55 (4:227).
 *  A 1a linha do grid (Frame 206) tem cards 258x356 com texto solto (gap 12) e arte descentralizada: variante
 *  descartada (2 de 3 linhas usam auto layout 350; registrada como Lacuna/desvio).
 *
 * Mobile 390 - tela "Mobile / Inicio" 14:5226 (frame 414), Product Grid 70395:242, cards "P-1..P-4" (175x244):
 *  - midia "Frame 412" 175x200, cornerRadius 20 (--radius-20); texto "Frame 413" 175x36, padding-left 8, gap do card 8;
 *  - titulo 15/400 (caixa 20: "Emerald Ape #042" 145x20, 15:5471), preco 16/700 lh16 #E89B55 (15:5472);
 *  - badge "Group 61" (RARO) a x+0, y+16 da midia; favorito "Group 58" 28x28 a 11 da borda direita e 12 do topo.
 *  Largura 175 vem do grid do consumidor (366 - 16)/2; no 390 real seria (342 - 16)/2: o card e fluido (w-full).
 */
const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250'><rect width='250' height='250' fill='%23D28A4C'/></svg>";

const SURFACE_CARD = 'rgb(36, 22, 18)';
const FOREGROUND = 'rgb(245, 241, 235)';
const TEXT_ACCENT = 'rgb(232, 155, 85)';

afterEach(async () => {
  await page.viewport(1440, 900);
  await userEvent.unhover(document.body);
});

async function mount(width: number) {
  await render(
    <div style={{ width }}>
      <NftCard
        title="Emerald Ape #042"
        priceLabel="1.19 ETH"
        image={{ src: IMG, alt: 'Arte do NFT' }}
        badge={<span data-testid="badge">RARO</span>}
        action={
          <button type="button" data-testid="fav" aria-label="Favoritar" style={{ width: 28, height: 28 }}>
            *
          </button>
        }
        link={<a href="#/nft/42" />}
      />
    </div>,
  );
  await expect.element(page.getByRole('img', { name: 'Arte do NFT' })).toBeInTheDocument();
  const q = (s: string) => document.querySelector(s) as HTMLElement;
  return {
    card: q('[data-slot="nft-card"]'),
    media: q('[data-slot="nft-card-media"]'),
    info: q('[data-slot="nft-card-info"]'),
    img: q('img'),
    title: q('h3 a'),
    price: q('[data-slot="nft-card-info"] p'),
    badge: q('[data-testid="badge"]'),
    fav: q('[data-testid="fav"]'),
  };
}

describe('NftCard - medida desktop 1440 (C25.5)', () => {
  it('card 258x350; midia 258x300 surface-card sem raio; arte 250x250 raio 15 centralizada', async () => {
    const m = await mount(258);
    const card = m.card.getBoundingClientRect();
    const media = m.media.getBoundingClientRect();
    const img = m.img.getBoundingClientRect();
    expect([card.width, card.height]).toEqual([258, 350]);
    expect([media.width, media.height]).toEqual([258, 300]);
    expect(getComputedStyle(m.media).backgroundColor).toBe(SURFACE_CARD);
    expect(getComputedStyle(m.media).borderTopLeftRadius).toBe('0px');
    expect([img.width, img.height]).toEqual([250, 250]);
    expect(getComputedStyle(m.img).borderTopLeftRadius).toBe('15px');
    expect([img.left - media.left, img.top - media.top]).toEqual([4, 25]);
  });

  it('texto: 12 abaixo da midia; titulo 16/400 lh16 foreground; preco 18/700 lh16 text-accent a 6 do titulo', async () => {
    const m = await mount(258);
    const media = m.media.getBoundingClientRect();
    const info = m.info.getBoundingClientRect();
    const title = m.title.getBoundingClientRect();
    const price = m.price.getBoundingClientRect();
    expect(info.top - media.bottom).toBe(12);
    expect(info.height).toBe(38);
    expect([title.height, price.height]).toEqual([16, 16]);
    expect(price.top - title.bottom).toBe(6);
    const t = getComputedStyle(m.title);
    expect([t.fontSize, t.fontWeight, t.lineHeight, t.color]).toEqual(['16px', '400', '16px', FOREGROUND]);
    const p = getComputedStyle(m.price);
    expect([p.fontSize, p.fontWeight, p.lineHeight, p.color]).toEqual(['18px', '700', '16px', TEXT_ACCENT]);
  });

  it('badge a 0/16 do canto superior esquerdo da midia; action a 12 do topo e 11 da direita', async () => {
    const m = await mount(258);
    const media = m.media.getBoundingClientRect();
    const badge = m.badge.getBoundingClientRect();
    const fav = m.fav.getBoundingClientRect();
    expect([badge.left - media.left, badge.top - media.top]).toEqual([0, 16]);
    expect([media.right - fav.right, fav.top - media.top]).toEqual([11, 12]);
  });
});

describe('NftCard - medida mobile 390 (C25.6)', () => {
  it('card 175x244; midia 175x200 raio 20 surface-card; imagem preenche a midia', async () => {
    await page.viewport(390, 844);
    const m = await mount(175);
    const card = m.card.getBoundingClientRect();
    const media = m.media.getBoundingClientRect();
    const img = m.img.getBoundingClientRect();
    expect([card.width, card.height]).toEqual([175, 244]);
    expect([media.width, media.height]).toEqual([175, 200]);
    expect(getComputedStyle(m.media).borderTopLeftRadius).toBe('20px');
    expect(getComputedStyle(m.media).backgroundColor).toBe(SURFACE_CARD);
    expect([img.width, img.height]).toEqual([175, 200]);
  });

  it('texto: 8 abaixo da midia, recuo 8; titulo 15/400 caixa 20; preco 16/700 lh16', async () => {
    await page.viewport(390, 844);
    const m = await mount(175);
    const media = m.media.getBoundingClientRect();
    const info = m.info.getBoundingClientRect();
    const title = m.title.getBoundingClientRect();
    const price = m.price.getBoundingClientRect();
    expect(info.top - media.bottom).toBe(8);
    expect(info.height).toBe(36);
    expect(title.left - media.left).toBe(8);
    expect(price.left - media.left).toBe(8);
    expect(title.height).toBe(20);
    expect(price.top - title.bottom).toBe(0);
    const t = getComputedStyle(m.title);
    expect([t.fontSize, t.fontWeight, t.color]).toEqual(['15px', '400', FOREGROUND]);
    const p = getComputedStyle(m.price);
    expect([p.fontSize, p.fontWeight, p.lineHeight, p.color]).toEqual(['16px', '700', '16px', TEXT_ACCENT]);
  });

  it('badge a 0/16 e action a 12 do topo e 11 da direita da midia', async () => {
    await page.viewport(390, 844);
    const m = await mount(175);
    const media = m.media.getBoundingClientRect();
    const badge = m.badge.getBoundingClientRect();
    const fav = m.fav.getBoundingClientRect();
    expect([badge.left - media.left, badge.top - media.top]).toEqual([0, 16]);
    expect([media.right - fav.right, fav.top - media.top]).toEqual([11, 12]);
  });

  it('e fluido: sem overflow horizontal numa coluna de 163px (grid real em 390)', async () => {
    await page.viewport(390, 844);
    const m = await mount(163);
    expect(m.card.getBoundingClientRect().width).toBe(163);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });
});
