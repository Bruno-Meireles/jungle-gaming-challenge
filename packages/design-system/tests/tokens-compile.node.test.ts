import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { compile } from 'tailwindcss';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const TOKENS_CSS = resolve(import.meta.dirname, '../src/styles/tokens.css');

// Equivalente ao consumidor: tema padrao do Tailwind + tokens.css + utilitarios.
const ENTRY_CSS = `
@import "tailwindcss/theme.css" layer(theme);
@import "${TOKENS_CSS.replaceAll('\\', '/')}";
@tailwind utilities;
`;

async function loadStylesheet(id: string, base: string) {
  const path = id === 'tailwindcss/theme.css' ? require.resolve('tailwindcss/theme.css') : resolve(base, id);
  return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
}

describe('tokens.css compilado com o tema padrao do Tailwind', () => {
  it('gera utilitarios dos tokens do Figma e nao gera os da paleta padrao', async () => {
    const compiler = await compile(ENTRY_CSS, { base: import.meta.dirname, loadStylesheet });
    const css = compiler.build(['bg-primary', 'bg-red-500', 'text-ink', 'text-blue-600']);

    expect(css).toMatch(/\.bg-primary\s*\{[^}]*var\(--color-primary\)/);
    expect(css).toContain('.text-ink');
    expect(css).not.toContain('.bg-red-500');
    expect(css).not.toContain('.text-blue-600');
  });

  it('gera utilitarios rounded-, shadow- e text- para tokens novos de cada grupo', async () => {
    const compiler = await compile(ENTRY_CSS, { base: import.meta.dirname, loadStylesheet });
    const css = compiler.build(['rounded-17p5', 'rounded-2p12', 'shadow-x0-y6-b20-a45-0a0604', 'text-heading-24-bold', 'text-primary-hover', 'rounded-lg', 'shadow-md']);

    expect(css).toMatch(/\.rounded-17p5\s*\{[^}]*var\(--radius-17p5\)/);
    expect(css).toMatch(/\.rounded-2p12\s*\{[^}]*var\(--radius-2p12\)/);
    expect(css).toMatch(/\.shadow-x0-y6-b20-a45-0a0604\s*\{[^}]*0px 6px 20px[^}]*rgba\(10, 6, 4, 0\.45\)/); // o Tailwind inlina o valor da sombra
    expect(css).toMatch(/\.text-heading-24-bold\s*\{[^}]*var\(--text-heading-24-bold\)/);
    expect(css).toMatch(/\.text-heading-24-bold\s*\{[^}]*var\(--text-heading-24-bold--line-height\)/);
    expect(css).toMatch(/\.text-primary-hover\s*\{[^}]*var\(--color-primary-hover\)/);
    expect(css).not.toContain('.rounded-lg');
    expect(css).not.toContain('.shadow-md');
  });

  it('breakpoints: gera tablet: e desktop: e nao gera sm:/md:/lg:', async () => {
    const compiler = await compile(ENTRY_CSS, { base: import.meta.dirname, loadStylesheet });
    const css = compiler.build(['tablet:flex', 'desktop:flex', 'md:flex', 'sm:flex', 'lg:flex']);

    expect(css).toMatch(/@media[^{]*768px[^{]*\{[^}]*\.tablet\\:flex/);
    expect(css).toMatch(/@media[^{]*1440px[^{]*\{[^}]*\.desktop\\:flex/);
    expect(css).not.toContain('md\\:flex');
    expect(css).not.toContain('sm\\:flex');
    expect(css).not.toContain('lg\\:flex');
  });
});
