import { test, expect } from '@playwright/test';
import { freshStart, createGame, switchTab, createCharacter, waitForSheet, clickToolbar } from './helpers.js';

/**
 * Test 3: Odpočinek — RestSheet (💤)
 */
test.describe('Odpočinek (RestSheet)', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test Rest');
    await createCharacter(page);
    await switchTab(page, 'Deník');
  });

  test('krátký odpočinek', async ({ page }) => {
    await clickToolbar(page, '💤');
    await waitForSheet(page, 'Odpočinek');

    // Klikni na tlačítko (má emoji prefix "💤 Krátký odpočinek")
    await page.getByRole('button', { name: /Krátký odpočinek/ }).click();
    await page.waitForTimeout(500);

    // Výsledek
    await expect(page.getByText(/BO/).first()).toBeVisible();
  });

  test('dlouhý odpočinek', async ({ page }) => {
    await clickToolbar(page, '💤');
    await waitForSheet(page, 'Odpočinek');

    await page.getByRole('button', { name: /Dlouhý odpočinek/ }).click();
    await page.waitForTimeout(500);

    const anyResult = page.getByText(/BO|STR|DEX|WIL|obnoveno|léčení|plné/).first();
    await expect(anyResult).toBeVisible();
  });

  test('úplný odpočinek obnoví vše', async ({ page }) => {
    await clickToolbar(page, '💤');
    await waitForSheet(page, 'Odpočinek');

    await page.getByRole('button', { name: /Úplný odpočinek/ }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText(/obnoveno|maximum/).first()).toBeVisible();
  });

  test('všechny 3 typy odpočinku jsou viditelné', async ({ page }) => {
    await clickToolbar(page, '💤');
    await waitForSheet(page, 'Odpočinek');

    await expect(page.getByRole('button', { name: /Krátký odpočinek/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dlouhý odpočinek/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Úplný odpočinek/ })).toBeVisible();
  });
});
