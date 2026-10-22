import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from './index';

function Trail() {
  return (
    <Breadcrumb>
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
      <Breadcrumb>
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
