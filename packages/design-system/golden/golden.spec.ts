import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { findUnknownGoldenTags, parseGoldenStories, type StorybookIndex } from './stories';

// O storybook:build precede os golden; o index.json é lido do disco no carregamento do módulo.
const index = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../storybook-static/index.json'), 'utf8'),
) as StorybookIndex;
const entries = parseGoldenStories(index);

test('existe ao menos uma story com tag golden', () => {
  expect(entries.length).toBeGreaterThan(0);
});

test('nenhuma story usa tag golden-* desconhecida', () => {
  expect(findUnknownGoldenTags(index)).toEqual([]);
});

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#storybook-root > *').first()).toBeAttached();
}

for (const { id, kinds } of entries) {
  for (const kind of kinds) {
    test(`golden ${kind}: ${id}`, async ({ page }) => {
      await openStory(page, id);
      if (kind === 'static') {
        await expect(page).toHaveScreenshot(`${id}.png`);
      } else if (kind === 'page') {
        await expect(page).toHaveScreenshot(`${id}--page.png`, { fullPage: true });
      } else if (kind === 'hover') {
        const target = page.locator('[data-golden-target], #storybook-root > *').first();
        await target.hover();
        await expect(page).toHaveScreenshot(`${id}--hover.png`);
      } else {
        await page.keyboard.press('Tab');
        await expect(page).toHaveScreenshot(`${id}--focus.png`);
      }
    });
  }
}
