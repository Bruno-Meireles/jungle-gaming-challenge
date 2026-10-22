import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { NftCard } from './NftCard';

/* Imagem local (data URI), sem rede. */
const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250'><rect width='250' height='250' fill='%23D28A4C'/></svg>";

const base = {
  title: 'Emerald Ape #042',
  priceLabel: '1.19 ETH',
  image: { src: IMG, alt: 'Macaco esmeralda com fundo laranja' },
};

afterEach(async () => {
  await page.viewport(1440, 900);
  await userEvent.unhover(document.body);
});

describe('NftCard - titulo como link e card clicavel (C25.1)', () => {
  it('com link, o titulo e um unico link com o nome do NFT e o href informado', async () => {
    await render(
      <NftCard {...base} link={<a href="#/nft/42" data-testid="lnk" />} />,
    );
    const link = page.getByRole('link', { name: 'Emerald Ape #042' });
    await expect.element(link).toBeInTheDocument();
    expect(link.element().getAttribute('href')).toBe('#/nft/42');
    expect(document.querySelectorAll('a').length).toBe(1);
  });

  it('o card inteiro e clicavel: o centro da imagem pertence ao link, sem link aninhado', async () => {
    await render(<NftCard {...base} link={<a href="#/nft/42" />} />);
    const img = page.getByRole('img', { name: base.image.alt });
    await expect.element(img).toBeInTheDocument();
    const r = img.element().getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    expect(hit?.closest('a')?.getAttribute('href')).toBe('#/nft/42');
    expect(document.querySelectorAll('a a').length).toBe(0);
  });

  it('clicar na imagem aciona o link do titulo', async () => {
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    await render(<NftCard {...base} link={<a href="#/nft/42" onClick={onClick} />} />);
    /* force: o ::after do link intercepta o ponteiro por desenho (e o que torna o card clicavel). */
    await page.getByRole('img', { name: base.image.alt }).click({ force: true });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('sem link, o titulo e texto simples e nao ha link', async () => {
    await render(<NftCard {...base} />);
    await expect.element(page.getByText('Emerald Ape #042')).toBeVisible();
    expect(document.querySelectorAll('a').length).toBe(0);
  });
});

describe('NftCard - foco visivel do card clicavel (C25.1)', () => {
  it('o foco do link por teclado desenha o contorno 2px primary sobre o card inteiro (::after), nao so sobre o titulo', async () => {
    await render(
      <div style={{ width: 258 }}>
        <NftCard {...base} link={<a href="#/nft/42" />} />
      </div>,
    );
    await userEvent.tab();
    const link = document.activeElement as HTMLElement;
    expect(link.tagName).toBe('A');
    // O link mantem contorno proprio transparente (visivel em modo de alto contraste); o anel visivel e o do ::after.
    const own = getComputedStyle(link);
    expect([own.outlineStyle, own.outlineColor]).toEqual(['solid', 'rgba(0, 0, 0, 0)']);
    const after = getComputedStyle(link, '::after');
    expect([after.outlineStyle, after.outlineWidth, after.outlineColor]).toEqual([
      'solid',
      '2px',
      'rgb(210, 138, 76)',
    ]);
    const card = document.querySelector('[data-slot="nft-card"]') as HTMLElement;
    expect(after.position).toBe('absolute');
    expect(card.getBoundingClientRect().height).toBe(350);
  });
});

describe('NftCard - imagem com alt obrigatorio (C25.2)', () => {
  it('renderiza a imagem com o alt informado', async () => {
    await render(<NftCard {...base} />);
    const img = page.getByRole('img', { name: base.image.alt });
    await expect.element(img).toBeInTheDocument();
    expect(img.element().tagName).toBe('IMG');
    expect(img.element().getAttribute('src')).toBe(IMG);
    expect(img.element().getAttribute('alt')).toBe(base.image.alt);
  });

  it('alt e obrigatorio no tipo', () => {
    // @ts-expect-error image sem alt nao compila
    const props: Parameters<typeof NftCard>[0] = { ...base, image: { src: IMG } };
    expect(props.image.src).toBe(IMG);
  });
});

describe('NftCard - priceLabel literal (C25.3)', () => {
  it('mostra o texto exatamente como recebido, sem arredondar nem reformatar', async () => {
    await render(<NftCard {...base} priceLabel="0.1000000000000000001 ETH" />);
    await expect.element(page.getByText('0.1000000000000000001 ETH', { exact: true })).toBeVisible();
  });

  it('preserva zeros finais e separadores', async () => {
    await render(<NftCard {...base} priceLabel="1.50 ETH" />);
    await expect.element(page.getByText('1.50 ETH', { exact: true })).toBeVisible();
  });

  it('um rotulo nao numerico passa intacto (nada e convertido em numero)', async () => {
    await render(<NftCard {...base} priceLabel="Preco sob consulta" />);
    await expect.element(page.getByText('Preco sob consulta', { exact: true })).toBeVisible();
  });
});

describe('NftCard - slots badge e action (C25.4)', () => {
  it('renderiza badge e action quando informados', async () => {
    await render(
      <NftCard
        {...base}
        badge={<span>RARO</span>}
        action={
          <button type="button" aria-label="Favoritar Emerald Ape #042">
            *
          </button>
        }
      />,
    );
    await expect.element(page.getByText('RARO')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Favoritar Emerald Ape #042' })).toBeVisible();
  });

  it('sem badge e action nao renderiza botoes', async () => {
    await render(<NftCard {...base} />);
    expect(document.querySelectorAll('button').length).toBe(0);
  });

  it('action recebe foco por Tab separado do link, depois dele', async () => {
    await render(
      <NftCard
        {...base}
        link={<a href="#/nft/42" />}
        action={
          <button type="button" aria-label="Favoritar">
            *
          </button>
        }
      />,
    );
    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe('A');
    await userEvent.tab();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Favoritar');
    expect(document.activeElement?.closest('a')).toBeNull();
  });

  it('clicar na action aciona so a action, nao o link do card', async () => {
    const onLink = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const onAction = vi.fn();
    await render(
      <NftCard
        {...base}
        link={<a href="#/nft/42" onClick={onLink} />}
        action={
          <button type="button" aria-label="Favoritar" onClick={onAction}>
            *
          </button>
        }
      />,
    );
    await page.getByRole('button', { name: 'Favoritar' }).click();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onLink).not.toHaveBeenCalled();
  });
});
