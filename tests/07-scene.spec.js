import { test, expect } from '@playwright/test';
import { freshStart, createGame, waitForSheet, clickToolbar } from './helpers.js';

/**
 * Test: Scéna — vytvoření a chaos test
 */
test.describe('Scéna (SceneSheet)', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test Scene');
  });

  test('nová scéna — chaos test a vložení', async ({ page }) => {
    await clickToolbar(page, /Scéna/);
    await waitForSheet(page, 'NOVÁ SCÉNA');

    // Vyplň očekávání — textbox s placeholderem
    await page.getByPlaceholder(/projde/).fill('Ada prohledá strom');

    // CF info
    await expect(page.getByText(/CF/).first()).toBeVisible();

    // Testovat chaos
    await page.getByRole('button', { name: /TESTOVAT CHAOS/ }).click();
    await page.waitForTimeout(500);

    // Výsledek — jeden z: OČEKÁVANÁ / POZMĚNĚNÁ / PŘERUŠENÁ
    await expect(page.locator('text=/OČEKÁVANÁ|POZMĚNĚNÁ|PŘERUŠENÁ/').first()).toBeVisible();

    // d10 roll
    await expect(page.getByText(/d10/).first()).toBeVisible();

    // Vložit scénu
    await page.getByRole('button', { name: /VLOŽIT SCÉNU/ }).click();
    await page.waitForTimeout(300);
  });

  test('opakované chaos testy (re-open)', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await clickToolbar(page, /Scéna/);
      await page.waitForTimeout(300);
      await waitForSheet(page, 'NOVÁ SCÉNA');

      await page.getByPlaceholder(/projde/).fill(`Test ${i + 1}`);
      await page.getByRole('button', { name: /TESTOVAT CHAOS/ }).click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=/OČEKÁVANÁ|POZMĚNĚNÁ|PŘERUŠENÁ/').first()).toBeVisible();
      await page.getByRole('button', { name: /VLOŽIT SCÉNU/ }).click();
      await page.waitForTimeout(300);
    }
  });
});
