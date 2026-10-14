// Smoke test for the portfolio. Run with:
//   npm i -D @playwright/test && npx playwright install chromium
//   npx playwright test
// Serves index.html via a static server configured in playwright.config.js.
const { test, expect } = require('@playwright/test');

test.describe('portfolio smoke', () => {
  let errors;
  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/');
  });

  test('loads with zero console errors', async ({ page }) => {
    await expect(page.locator('.hero h1')).toHaveText('Forward Deployed Engineer');
    await page.waitForTimeout(1500); // let fluid/stars/theme init settle
    expect(errors).toEqual([]);
  });

  test('every quick chip renders its answer card', async ({ page }) => {
    const keys = ['me', 'experience', 'projects', 'skills', 'fun', 'contact'];
    for (const key of keys) {
      await page.locator(`.chip[data-key="${key}"]:visible, .qchip[data-key="${key}"]:visible`).first().click();
      await expect(page.locator('#thread .msg-ai .card').last()).toBeVisible({ timeout: 4000 });
    }
    expect(errors).toEqual([]);
  });

  test('all four themes cycle', async ({ page }) => {
    const seen = new Set();
    for (let i = 0; i < 4; i++) {
      seen.add(await page.evaluate(() => document.documentElement.dataset.theme));
      await page.locator('#themeBtn').click();
      await page.waitForTimeout(150);
    }
    expect([...seen].sort()).toEqual(['day', 'evening', 'night', 'rainy']);
    expect(errors).toEqual([]);
  });

  test('résumé link resolves', async ({ page, request }) => {
    const href = await page.locator('.resume-pill').getAttribute('href');
    const res = await request.get('/' + href);
    expect(res.ok()).toBeTruthy();
  });

  test('deep link opens chat', async ({ page }) => {
    await page.goto('/?query=What%20are%20your%20skills%3F');
    await expect(page.locator('#chat')).toBeVisible();
    await expect(page.locator('#thread .msg-ai .card').last()).toBeVisible({ timeout: 4000 });
  });
});
