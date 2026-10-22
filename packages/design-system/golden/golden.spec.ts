import { expect, test } from '@playwright/test';
import { goldenManifest } from './manifest';

test('todo id do manifest existe no index.json do Storybook estático', async ({ request }) => {
  const response = await request.get('/index.json');
  expect(response.ok()).toBe(true);
  const index = (await response.json()) as { entries: Record<string, unknown> };
  for (const { id } of goldenManifest) {
    expect(id in index.entries, `story ausente no index.json: ${id}`).toBe(true);
  }
});

for (const entry of goldenManifest) {
  test(`golden ${entry.kind}: ${entry.id}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${entry.id}&viewMode=story`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#storybook-root > *').first()).toBeAttached();
    await expect(page).toHaveScreenshot(`${entry.id}.png`);
  });
}
