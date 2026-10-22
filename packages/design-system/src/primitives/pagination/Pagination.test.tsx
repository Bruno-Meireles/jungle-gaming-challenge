import { afterEach, describe, expect, it } from 'vitest';
import { page as screen, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Pagination } from './Pagination';
import { PaginationLink } from './PaginationLink';

/* O ponteiro fica onde o hover terminou e contamina a medida do teste seguinte (flake sob carga). */
afterEach(async () => {
  await userEvent.unhover(document.body);
});

const getItemProps = (n: number) => ({ href: `#pagina-${n}` });

describe('Pagination - comportamento', () => {
  it('renderiza um <nav> com nome "Paginação" e um link por pagina', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={2} pageCount={4} getItemProps={getItemProps} />);
    const nav = screen.getByRole('navigation', { name: 'Paginação' });
    await expect.element(nav).toBeInTheDocument();
    expect(nav.element().tagName).toBe('NAV');
    for (const n of [1, 2, 3, 4]) {
      await expect.element(screen.getByRole('link', { name: String(n), exact: true })).toHaveAttribute('href', `#pagina-${n}`);
    }
  });

  it('marca somente a pagina atual com aria-current="page"', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={2} pageCount={4} getItemProps={getItemProps} />);
    await expect.element(screen.getByRole('link', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page');
    for (const n of [1, 3, 4]) {
      await expect.element(screen.getByRole('link', { name: String(n), exact: true })).not.toHaveAttribute('aria-current');
    }
  });

  it('"Próxima" tem nome acessivel e aponta para a pagina seguinte', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={2} pageCount={4} getItemProps={getItemProps} />);
    await expect.element(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '#pagina-3');
  });

  it('na ultima pagina "Próxima" fica desabilitada e nao navega', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={4} pageCount={4} getItemProps={getItemProps} />);
    /* <a> sem href tem papel generico e proibe aria-label (axe aria-prohibited-attr): o desabilitado usa role="link" + aria-disabled. */
    const next = screen.getByRole('link', { name: 'Próxima' });
    await expect.element(next).toHaveAttribute('aria-disabled', 'true');
    await expect.element(next).not.toHaveAttribute('href');
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).not.toBe(next.element());
  });

  it('repassa className e props ao <nav>', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={1} pageCount={2} getItemProps={getItemProps} className="extra" data-testid="pg" />);
    await expect.element(screen.getByTestId('pg')).toHaveClass('extra');
  });
});

describe('Pagination - nomes recebidos por props', () => {
  it('expoe label e nextLabel recebidos em pagina intermediaria', async () => {
    await render(<Pagination label="Pagination" nextLabel="Next" page={2} pageCount={4} getItemProps={getItemProps} />);
    await expect.element(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    await expect.element(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '#pagina-3');
  });

  it('na ultima pagina "Next" continua exposto com aria-disabled="true"', async () => {
    await render(<Pagination label="Pagination" nextLabel="Next" page={4} pageCount={4} getItemProps={getItemProps} />);
    await expect.element(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('PaginationLink - asChild', () => {
  it('renderiza <a> por padrao com data-slot', async () => {
    await render(<PaginationLink href="#x">Item</PaginationLink>);
    const link = screen.getByRole('link', { name: 'Item' });
    expect(link.element().tagName).toBe('A');
    await expect.element(link).toHaveAttribute('data-slot', 'pagination-link');
  });

  it('asChild renderiza o filho com as mesmas classes do link padrao', async () => {
    await render(
      <>
        <PaginationLink href="#a">Padrao</PaginationLink>
        <PaginationLink asChild>
          <button type="button">Filho</button>
        </PaginationLink>
      </>,
    );
    const child = screen.getByRole('button', { name: 'Filho' });
    expect(child.element().tagName).toBe('BUTTON');
    await expect.element(child).toHaveAttribute('data-slot', 'pagination-link');
    expect(child.element().className).toBe(screen.getByRole('link', { name: 'Padrao' }).element().className);
  });
});

/*
 * Medida (ADR-08), docs/figma/file.json, "Pagination" 70342:2825 (207x35, horizontal, gap 8).
 * Item = 35x35, cornerRadius 4 (= --radius-4), texto Roboto Mono 18/16.
 *  - atual "Frame 224" 70342:2820: fill #D28A4C (--color-primary), sem stroke, texto "1" #140D0A (--color-ink), peso 700
 *    (= --text-body-large-18-bold-lh-16).
 *  - demais "Frame 225-227": sem fill, stroke 1px #3F2319 (--color-border), texto #F5F1EB (--color-foreground), peso 400
 *    (= --text-body-large-18-regular).
 *  - seta "Frame 228" 70342:2824: igual aos demais, icone 18x18 (traco #F5F1EB).
 * disabled (sem no no Figma): tokens --color-disabled-text #B39463.
 */
const PRIMARY = 'rgb(210, 138, 76)';
const INK = 'rgb(20, 13, 10)';
const FOREGROUND = 'rgb(245, 241, 235)';
const BORDER = 'rgb(63, 35, 25)';
const DISABLED_TEXT = 'rgb(179, 148, 99)';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

describe('Pagination - medidas', () => {
  it('pagina atual: 35x35, raio 4, fundo primary, texto ink 18/16 peso 700', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={1} pageCount={4} getItemProps={getItemProps} />);
    const el = screen.getByRole('link', { name: '1', exact: true });
    await expect.element(el).toBeInTheDocument();
    const cs = getComputedStyle(el.element());
    const rect = el.element().getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([35, 35]);
    expect(cs.borderTopLeftRadius).toBe('4px');
    expect(cs.backgroundColor).toBe(PRIMARY);
    expect(cs.color).toBe(INK);
    expect(cs.fontSize).toBe('18px');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.fontWeight).toBe('700');
  });

  it('pagina comum: 35x35, raio 4, sem fundo, borda 1px border, texto foreground 18/16 peso 400', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={1} pageCount={4} getItemProps={getItemProps} />);
    const el = screen.getByRole('link', { name: '2', exact: true });
    await expect.element(el).toBeInTheDocument();
    const cs = getComputedStyle(el.element());
    const rect = el.element().getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([35, 35]);
    expect(cs.borderTopLeftRadius).toBe('4px');
    expect(cs.backgroundColor).toBe(TRANSPARENT);
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopColor).toBe(BORDER);
    expect(cs.color).toBe(FOREGROUND);
    expect(cs.fontSize).toBe('18px');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.fontWeight).toBe('400');
  });

  it('"Próxima": 35x35 como os demais; itens separados por 8px', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={1} pageCount={4} getItemProps={getItemProps} />);
    const first = screen.getByRole('link', { name: '1', exact: true });
    const second = screen.getByRole('link', { name: '2', exact: true });
    const next = screen.getByRole('link', { name: 'Próxima' });
    await expect.element(next).toBeInTheDocument();
    const n = next.element().getBoundingClientRect();
    expect([n.width, n.height]).toEqual([35, 35]);
    const a = first.element().getBoundingClientRect();
    const b = second.element().getBoundingClientRect();
    expect(b.left - a.right).toBe(8);
  });

  it('"Próxima" desabilitada usa o texto de disabled', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={4} pageCount={4} getItemProps={getItemProps} />);
    const next = screen.getByLabelText('Próxima');
    await expect.element(next).toBeInTheDocument();
    expect(getComputedStyle(next.element()).color).toBe(DISABLED_TEXT);
  });

  it('foco por teclado: outline 2px solid primary com offset 2px', async () => {
    await render(<Pagination label="Paginação" nextLabel="Próxima" page={1} pageCount={4} getItemProps={getItemProps} />);
    await userEvent.tab();
    const el = screen.getByRole('link', { name: '1', exact: true });
    await expect.element(el).toHaveFocus();
    const cs = getComputedStyle(el.element());
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineOffset).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });
});

describe('Pagination - acessibilidade (axe)', () => {
  it('sem violacoes na primeira, no meio e na ultima pagina', async () => {
    for (const p of [1, 2, 4]) {
      const { container, unmount } = await render(<Pagination label="Paginação" nextLabel="Próxima" page={p} pageCount={4} getItemProps={getItemProps} />);
      await expectNoA11yViolations(container);
      await unmount();
    }
  });
});
