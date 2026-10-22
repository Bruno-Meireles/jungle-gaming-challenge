import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('junta classes ignorando valores falsy', () => {
    const hidden = false as boolean;
    expect(cn('a', hidden && 'b', undefined, null, 'c')).toBe('a c');
  });

  it('aceita objeto e array como o clsx', () => {
    expect(cn({ x: true, y: false }, ['z'])).toBe('x z');
  });

  it('resolve conflitos de utilitarios do Tailwind mantendo o ultimo', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('bg-primary', 'bg-ink')).toBe('bg-ink');
  });

  it('resolve conflito entre cores de texto customizadas do DS mantendo a ultima', () => {
    expect(cn('text-foreground', 'text-ink')).toBe('text-ink');
  });

  it('mantem cor e tamanho de texto do DS juntos, em qualquer ordem', () => {
    expect(cn('text-ink', 'text-body-14-bold-lh-16')).toBe('text-ink text-body-14-bold-lh-16');
    expect(cn('text-body-14-bold-lh-16', 'text-ink')).toBe('text-body-14-bold-lh-16 text-ink');
  });

  it('resolve conflito entre dois tamanhos de texto do DS mantendo o ultimo', () => {
    // Figma TEXT styles: "Title/22 Bold" e "Body/14 Bold · lh 16"
    expect(cn('text-title-22-bold', 'text-body-14-bold-lh-16')).toBe('text-body-14-bold-lh-16');
    expect(cn('text-body-14-bold-lh-16', 'text-title-22-bold')).toBe('text-title-22-bold');
  });
});
