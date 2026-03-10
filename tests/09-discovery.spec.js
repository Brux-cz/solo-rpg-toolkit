import { test, expect } from '@playwright/test';
import { freshStart, createGame, switchTab, openOverflowMenu, waitForSheet } from './helpers.js';

/**
 * Test 7: Discovery Check (DiscoveryCheckSheet)
 */
test.describe('Discovery Check', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test Discovery');
  });

  test('otevření sheetu a výběr threadu', async ({ page }) => {
    // Přidej thread
    await switchTab(page, 'Svět');
    await page.getByText('Thready', { exact: true }).click();
    await page.waitForTimeout(300);

    const threadInput = page.getByPlaceholder(/Thread|jméno/i).first();
    await threadInput.fill('Záhada jeskyně');
    await page.getByRole('button', { name: /\+ Thread/ }).click();
    await page.waitForTimeout(300);

    // Otevři Discovery Check
    await switchTab(page, 'Deník');
    await openOverflowMenu(page, 'Discovery');
    await page.waitForTimeout(500);

    // Thread by měl být viditelný v sheetu
    await expect(page.getByText('Záhada jeskyně').first()).toBeVisible();
  });
});
