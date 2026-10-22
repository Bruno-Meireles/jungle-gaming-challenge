import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Breadcrumb,BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from './index';

function Trail() {
  return (
    <Breadcrumb label="Trilha">
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Início</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/mercado">Mercado</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Pagamento</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}

describe('Breadcrumb - comportamento', () => {
  it('renderiza <nav aria-label="Trilha"> com lista ordenada de itens', async () => {
    await render(<Trail />);
    const nav = page.getByRole('navigation', { name: 'Trilha' });
    await expect.element(nav).toBeInTheDocument();
    expect(nav.element().tagName).toBe('NAV');
    const list = nav.element().querySelector('ol');
    expect(list).not.toBeNull();
    expect(list?.querySelectorAll(':scope > li')).toHaveLength(3);
  });

  it('a pagina atual expoe aria-current="page" e os links nao', async () => {
    await render(<Trail />);
    await expect.element(page.getByText('Pagamento')).toHaveAttribute('aria-current', 'page');
    await expect
      .element(page.getByRole('link', { name: 'Início' }))
      .not.toHaveAttribute('aria-current');
    await expect
      .element(page.getByRole('link', { name: 'Mercado' }))
      .toHaveAttribute('href', '/mercado');
  });

  it('BreadcrumbLink asChild renderiza o filho com as mesmas classes e data-slot', async () => {
    await render(
      <Breadcrumb label="Trilha">
        <BreadcrumbItem>
          <BreadcrumbLink href="/a">Normal</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <button type="button">Roteado</button>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    await expect.element(page.getByRole('button', { name: 'Roteado' })).toBeInTheDocument();
    const normal = page.getByRole('link', { name: 'Normal' }).element();
    const child = page.getByRole('button', { name: 'Roteado' }).element();
    expect(child.tagName).toBe('BUTTON');
    expect(child.getAttribute('data-slot')).toBe('breadcrumb-link');
    expect(child.className).toBe(normal.className);
  });
});

describe('Breadcrumb - rotulo recebido', () => {
  it('expoe o nome recebido via label em nav', async () => {
    await render(
      <Breadcrumb label="Breadcrumb">
        <BreadcrumbItem>
          <BreadcrumbPage>Pagamento</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    await expect.element(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });
});

/*
 * Medida (ADR-08) - trilha "Início / Mercado" (texto 10:290, docs/figma/file.json:42042; variantes
 * "Início / Mercado / Carrinho" 76356 e "/ Pagamento" 107123): um unico TEXT, Roboto Mono 700 15px,
 * lineHeightPx 16 (= --text-body-15-bold-lh-16), fill #F5F1EB (= --color-foreground, variavel 70320:308).
 * O Figma nao desenha item ativo vs link: link e pagina atual usam o mesmo estilo (DERIVADO: separado em
 * itens; "/" decorativo com gap de 8px, valor derivado - os espacos do texto nao tem medida propria).
 */
const FOREGROUND = 'rgb(245, 241, 235)';

describe('Breadcrumb - medidas', () => {
  it('link e pagina atual: Roboto Mono 700 15/16 na cor foreground', async () => {
    await render(<Trail />);
    await expect.element(page.getByRole('link', { name: 'Início' })).toBeInTheDocument();
    for (const el of [
      page.getByRole('link', { name: 'Início' }).element(),
      page.getByText('Pagamento').element(),
    ]) {
      const cs = getComputedStyle(el);
      expect(cs.fontFamily).toContain('Roboto Mono');
      expect(cs.fontSize).toBe('15px');
      expect(cs.fontWeight).toBe('700');
      expect(cs.lineHeight).toBe('16px');
      expect(cs.color).toBe(FOREGROUND);
      expect(cs.textDecorationLine).toBe('none');
    }
  });

  it('separador "/" decorativo: mesma tipografia, gap de 8px e oculto no ultimo item', async () => {
    await render(<Trail />);
    await expect.element(page.getByRole('link', { name: 'Início' })).toBeInTheDocument();
    const separators = Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="breadcrumb-separator"]'),
    );
    expect(separators).toHaveLength(3);
    expect(separators[0]?.getAttribute('aria-hidden')).toBe('true');
    const cs = getComputedStyle(separators[0] as HTMLElement);
    expect(cs.fontSize).toBe('15px');
    expect(cs.fontWeight).toBe('700');
    expect(cs.color).toBe(FOREGROUND);
    const item = separators[0]?.parentElement as HTMLElement;
    expect(getComputedStyle(item).columnGap).toBe('8px');
    expect(getComputedStyle(separators[2] as HTMLElement).display).toBe('none');
    const list = document.querySelector('[data-slot="breadcrumb-list"]') as HTMLElement;
    expect(getComputedStyle(list).display).toBe('flex');
    expect(getComputedStyle(list).columnGap).toBe('8px');
  });
});

describe('Breadcrumb - acessibilidade', () => {
  it('nao tem violacoes axe (links, pagina atual e separadores)', async () => {
    const { container } = await render(<Trail />);
    await expect.element(page.getByRole('navigation', { name: 'Trilha' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
