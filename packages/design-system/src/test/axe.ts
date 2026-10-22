import axe from 'axe-core';
import { expect } from 'vitest';

/* Tags: WCAG 2.0/2.1/2.2 A e AA + best-practice. Nenhuma regra e desligada aqui. */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Roda axe no container e falha listando as violacoes. */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, { runOnly: { type: 'tag', values: AXE_TAGS } });
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} no(s))`);
  expect(summary, summary.join('; ')).toEqual([]);
}
