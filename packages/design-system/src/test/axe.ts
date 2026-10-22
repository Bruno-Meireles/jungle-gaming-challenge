import axe from 'axe-core';
import { expect } from 'vitest';

export const AXE_TAGS = ['wcag2a', 'wcag2aa'];

/** Roda axe (wcag2a/wcag2aa) no container e falha listando as violacoes. */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, { runOnly: { type: 'tag', values: AXE_TAGS } });
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} no(s))`);
  expect(summary).toEqual([]);
}
