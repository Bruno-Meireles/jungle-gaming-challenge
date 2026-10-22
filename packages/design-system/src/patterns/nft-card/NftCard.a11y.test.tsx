import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import { NftCard } from './NftCard';

const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250'><rect width='250' height='250' fill='%23D28A4C'/></svg>";
const base = {
  title: 'Emerald Ape #042',
  priceLabel: '1.19 ETH',
  image: { src: IMG, alt: 'Macaco esmeralda' },
};

describe('NftCard - axe (C25.8)', () => {
  it('card completo (link, badge, action) nao tem violacoes', async () => {
    const { container } = await render(
      <NftCard
        {...base}
        link={<a href="#/nft/42" />}
        badge={<Badge variant="label">RARO</Badge>}
        action={
          <Button variant="icon" aria-label="Favoritar Emerald Ape #042">
            *
          </Button>
        }
      />,
    );
    await expect.element(page.getByRole('img', { name: 'Macaco esmeralda' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('card simples (sem link, badge nem action) nao tem violacoes', async () => {
    const { container } = await render(<NftCard {...base} />);
    await expect.element(page.getByRole('img', { name: 'Macaco esmeralda' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('o texto do link e do preco tem contraste suficiente sobre o fundo da pagina', async () => {
    const { container } = await render(<NftCard {...base} link={<a href="#/nft/42" />} />);
    await expect.element(page.getByRole('link', { name: 'Emerald Ape #042' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
    expect(getComputedStyle(page.getByRole('link').element()).color).toBe('rgb(245, 241, 235)');
  });
});
