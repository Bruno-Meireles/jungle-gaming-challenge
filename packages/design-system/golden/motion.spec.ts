import { expect, test, type Page } from '@playwright/test';

/*
 * Skeleton (C4): o shimmer anima com prefers-reduced-motion: no-preference e para com reduce.
 * O playwright.config.ts fixa reducedMotion: 'reduce' globalmente; cada teste abaixo sobrescreve.
 * Vitest browser nao alterna a media query, por isso a prova e feita aqui.
 */
const STORY = '/iframe.html?id=primitives-skeleton--default&viewMode=story';

async function animationName(page: Page): Promise<string> {
  await page.goto(STORY);
  const skeleton = page.locator('[data-slot="skeleton"]');
  await expect(skeleton).toBeAttached();
  return skeleton.evaluate((el) => getComputedStyle(el).animationName);
}

test.describe('Skeleton com movimento normal', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('shimmer anima (animation-name diferente de none)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'plano C4.5: apenas 1440');
    const name = await animationName(page);
    expect(name).not.toBe('none');
    expect(name).toContain('shimmer');
  });
});

test.describe('Skeleton com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shimmer desligado (animation-name none)', async ({ page }, testInfo) => {
    test.skip(
      !['desktop-1440', 'mobile-390'].includes(testInfo.project.name),
      'plano C4.6: apenas 1440 e 390',
    );
    expect(await animationName(page)).toBe('none');
  });
});
