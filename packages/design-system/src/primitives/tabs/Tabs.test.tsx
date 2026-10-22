import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Tabs } from './Tabs';
import { TabsContent } from './TabsContent';
import { TabsList } from './TabsList';
import { TabsTrigger } from './TabsTrigger';

const Example = ({ defaultValue = 'todos' }: { defaultValue?: string }) => (
  <Tabs defaultValue={defaultValue}>
    <TabsList aria-label="Categorias">
      <TabsTrigger value="todos">Todos os NFTs</TabsTrigger>
      <TabsTrigger value="novos">Novos lançamentos</TabsTrigger>
      <TabsTrigger value="alta">Em alta</TabsTrigger>
    </TabsList>
    <TabsContent value="todos">Conteúdo de todos</TabsContent>
    <TabsContent value="novos">Conteúdo de novos</TabsContent>
    <TabsContent value="alta">Conteúdo em alta</TabsContent>
  </Tabs>
);

const PRIMARY = 'rgb(210, 138, 76)';
const TEXT_ACCENT = 'rgb(232, 155, 85)';
const FOREGROUND = 'rgb(245, 241, 235)';

afterEach(async () => {
  await userEvent.unhover(document.body);
});

describe('Tabs - comportamento', () => {
  it('expoe tablist com nome, tabs com nome e um tabpanel visivel', async () => {
    await render(<Example />);
    await expect.element(page.getByRole('tablist', { name: 'Categorias' })).toBeInTheDocument();
    expect(page.getByRole('tab').elements()).toHaveLength(3);
    await expect.element(page.getByRole('tab', { name: 'Todos os NFTs' })).toBeInTheDocument();
    const panel = page.getByRole('tabpanel');
    await expect.element(panel).toHaveTextContent('Conteúdo de todos');
    expect(panel.elements()).toHaveLength(1);
  });

  it('aria-selected marca somente a aba ativa; clique troca aba e painel', async () => {
    await render(<Example />);
    const todos = page.getByRole('tab', { name: 'Todos os NFTs' });
    const novos = page.getByRole('tab', { name: 'Novos lançamentos' });
    await expect.element(todos).toHaveAttribute('aria-selected', 'true');
    await expect.element(novos).toHaveAttribute('aria-selected', 'false');
    await novos.click();
    await expect.element(novos).toHaveAttribute('aria-selected', 'true');
    await expect.element(todos).toHaveAttribute('aria-selected', 'false');
    await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Conteúdo de novos');
  });

  it('setas movem foco e selecao entre as abas; Home/End vao as pontas', async () => {
    await render(<Example />);
    page.getByRole('tab', { name: 'Todos os NFTs' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    const novos = page.getByRole('tab', { name: 'Novos lançamentos' });
    expect(document.activeElement).toBe(novos.element());
    await expect.element(novos).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect.element(page.getByRole('tab', { name: 'Em alta' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(novos).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Home}');
    await expect.element(page.getByRole('tab', { name: 'Todos os NFTs' })).toHaveAttribute('aria-selected', 'true');
  });

  it('modo controlado dispara onValueChange', async () => {
    const seen: string[] = [];
    await render(
      <Tabs value="todos" onValueChange={(v) => seen.push(v)}>
        <TabsList aria-label="Categorias">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="novos">Novos</TabsTrigger>
        </TabsList>
        <TabsContent value="todos">a</TabsContent>
        <TabsContent value="novos">b</TabsContent>
      </Tabs>,
    );
    await page.getByRole('tab', { name: 'Novos' }).click();
    expect(seen).toEqual(['novos']);
    await expect.element(page.getByRole('tab', { name: 'Todos' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs - medidas (Figma mobile 70395:241)', () => {
  it('aba ativa: 14px bold, cor text-accent, altura 20, sublinhado primary de 2px', async () => {
    await render(<Example />);
    const el = page.getByRole('tab', { name: 'Todos os NFTs' }).element();
    const cs = getComputedStyle(el);
    expect(el.getBoundingClientRect().height).toBe(20);
    expect(cs.fontSize).toBe('14px');
    expect(cs.fontWeight).toBe('700');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.color).toBe(TEXT_ACCENT);
    const line = getComputedStyle(el, '::after');
    expect(line.backgroundColor).toBe(PRIMARY);
    expect(line.height).toBe('2px');
  });

  it('aba inativa: 14px regular, cor foreground, sem sublinhado', async () => {
    await render(<Example />);
    const el = page.getByRole('tab', { name: 'Novos lançamentos' }).element();
    const cs = getComputedStyle(el);
    expect(cs.fontWeight).toBe('400');
    expect(cs.color).toBe(FOREGROUND);
    expect(getComputedStyle(el, '::after').backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('lista em linha com gap 16 entre abas', async () => {
    await render(<Example />);
    const a = page.getByRole('tab', { name: 'Novos lançamentos' }).element().getBoundingClientRect();
    const b = page.getByRole('tab', { name: 'Em alta' }).element().getBoundingClientRect();
    expect(b.left - a.right).toBe(16);
    expect(a.top).toBe(b.top);
  });

  it('foco por teclado: outline 2px solid focus', async () => {
    await render(<Example />);
    await userEvent.tab();
    const el = page.getByRole('tab', { name: 'Todos os NFTs' }).element();
    expect(document.activeElement).toBe(el);
    const cs = getComputedStyle(el);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Example />);
    await expect.element(page.getByRole('tablist')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
