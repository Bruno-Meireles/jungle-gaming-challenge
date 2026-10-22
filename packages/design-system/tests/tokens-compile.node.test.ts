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
});
