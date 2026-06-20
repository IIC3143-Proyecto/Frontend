import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, provide) => {
    await provide(page);
    await page.evaluate(() => {
      (window as Window & { __resetErrorScenario?: () => void }).__resetErrorScenario?.();
      (window as Window & { __resetMockUser?: () => void }).__resetMockUser?.();
    }).catch(() => {});
  },
});
