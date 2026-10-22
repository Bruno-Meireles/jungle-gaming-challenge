import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { NftCard } from './NftCard';
import { NftCardSkeleton } from './NftCardSkeleton';

/* Skeleton derivado (ADR-12): mesma caixa do NftCard (C25.7); formas internas derivadas das medidas do card. */
const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250'><rect width='250' height='250' fill='%23D28A4C'/></svg>";

afterEach(async () => {
  await page.viewport(1440, 900);
  await userEvent.unhover(document.body);
});

const box = (el: Element) => {
  const r = el.getBoundingClientRect();
  return [r.width, r.height];
};

async function sizes(width: number) {
  await render(
    <div style={{ width }}>
      <div data-testid="real">
        <NftCard title="Emerald Ape #042" priceLabel="1.19 ETH" image={{ src: IMG, alt: 'Arte do NFT' }} />
      </div>
      <div data-testid="skel">
        <NftCardSkeleton />
      </div>
    </div>,
  );
  await expect.element(page.getByRole('img', { name: 'Arte do NFT' })).toBeInTheDocument();
  const real = document.querySelector('[data-testid="real"] [data-slot="nft-card"]') as Element;
  const skel = document.querySelector('[data-testid="skel"] [data-slot="nft-card-skeleton"]') as Element;
  return { real, skel };
}

describe('NftCardSkeleton', () => {
  it('em 1440 tem o mesmo bounding box do NftCard (258x350)', async () => {
    const { real, skel } = await sizes(258);
    expect(skel).not.toBeNull();
    expect(box(real)).toEqual([258, 350]);
    expect(box(skel)).toEqual(box(real));
  });

  it('em 390 tem o mesmo bounding box do NftCard (175x244)', async () => {
    await page.viewport(390, 844);
    const { real, skel } = await sizes(175);
    expect(skel).not.toBeNull();
    expect(box(real)).toEqual([175, 244]);
    expect(box(skel)).toEqual(box(real));
  });

  it('e decorativo: aria-hidden, sem foco, sem texto nem imagem', async () => {
    await render(<NftCardSkeleton />);
    const skel = document.querySelector('[data-slot="nft-card-skeleton"]') as Element;
    expect(skel.getAttribute('aria-hidden')).toBe('true');
    expect(skel.querySelectorAll('a, button, img, input').length).toBe(0);
    expect(skel.textContent).toBe('');
  });

  it('usa o shimmer dos Skeletons internos (movimento normal)', async () => {
    await render(<NftCardSkeleton />);
    const bars = document.querySelectorAll('[data-slot="nft-card-skeleton"] [data-slot="skeleton"]');
    expect(bars.length).toBe(3);
    for (const bar of bars) expect(getComputedStyle(bar).animationName).toContain('shimmer');
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<NftCardSkeleton />);
    await expectNoA11yViolations(container);
  });
});
