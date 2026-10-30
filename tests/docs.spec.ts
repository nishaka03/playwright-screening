import { test, expect } from '@playwright/test';

test.describe('playwright.dev docs site', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page title contains Playwright', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('Get started goes to the intro page', async ({ page }) => {
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page).toHaveURL(/\/docs\/intro/);
  });

  test('Installation heading is visible', async ({ page }) => {
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page.getByRole('heading', { name: 'Installation', level: 1 })).toBeVisible();
  });

  test('search for "locators" shows results', async ({ page }) => {
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByPlaceholder('Search docs').fill('locators');
    await expect(page.getByRole('option').first()).toBeVisible();
  });

});
