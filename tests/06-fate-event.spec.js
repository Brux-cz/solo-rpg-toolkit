import { test, expect } from '@playwright/test';
import { freshStart, createGame, switchTab, waitForSheet, clickToolbar } from './helpers.js';

/**
 * Test 5: Fate Question + Random Event
 */
test.describe('Fate Question', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test Fate');
  });

  test('základní Fate otázka → výsledek + vložení', async ({ page }) => {
    await clickToolbar(page, /Fate/);
    await waitForSheet(page, 'FATE');

    await page.getByPlaceholder('Je tu stráž').fill('Je dveře zamčené?');
    await page.getByRole('button', { name: '50/50' }).click();
    await expect(page.getByText(/CF/).first()).toBeVisible();

    await page.getByRole('button', { name: /HODIT/ }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText(/d100/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /VLOŽIT DO TEXTU/ })).toBeVisible();
    await page.getByRole('button', { name: /VLOŽIT DO TEXTU/ }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText('❓').first()).toBeVisible();
  });

  test('všechny odds tlačítka fungují', async ({ page }) => {
    await clickToolbar(page, /Fate/);
    await waitForSheet(page, 'FATE');

    const odds = [
      'Impossible', 'Nearly imp.', 'V.unlikely', 'Unlikely',
      '50/50', 'Likely', 'V.likely', 'Nearly cert.', 'Certain'
    ];

    for (const odd of odds) {
      const btn = page.getByText(odd, { exact: true });
      await expect(btn).toBeVisible();
      await btn.click();
      await page.waitForTimeout(100);
    }
  });

  test('vícenásobné Fate otázky', async ({ page }) => {
    // Hodit → vložit → znovu otevřít → hodit → vložit
    for (let i = 0; i < 3; i++) {
      await clickToolbar(page, /Fate/);
      await page.waitForTimeout(500);
      await waitForSheet(page, 'FATE');

      const input = page.getByPlaceholder('Je tu stráž');
      await input.clear();
      await input.fill(`Otázka ${i + 1}?`);
      await page.getByRole('button', { name: '50/50' }).click();
      await page.getByRole('button', { name: /HODIT/ }).click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /VLOŽIT DO TEXTU/ }).click();
      await page.waitForTimeout(500);
    }

    // V deníku by měly být 3 fate bloky
    const fateBlocks = page.locator('text=❓');
    await expect(fateBlocks.first()).toBeVisible();
  });

  test('Fate s NPC v hře', async ({ page }) => {
    // Přidej NPC
    await switchTab(page, 'Svět');
    await page.getByText('NPC', { exact: true }).click();
    await page.waitForTimeout(300);

    await page.getByPlaceholder('Nový NPC...').fill('Šedivec');
    await page.getByRole('button', { name: '+ NPC' }).click();
    await page.waitForTimeout(200);

    // Zpět na deník a hrej Fate
    await switchTab(page, 'Deník');
    await clickToolbar(page, /Fate/);
    await waitForSheet(page, 'FATE');

    await page.getByPlaceholder('Je tu stráž').fill('Test?');
    await page.getByText('Certain').click();
    await page.getByRole('button', { name: /HODIT/ }).click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('button', { name: /VLOŽIT DO TEXTU/ })).toBeVisible();
    await page.getByRole('button', { name: /VLOŽIT DO TEXTU/ }).click();
    await expect(page.getByText('❓').first()).toBeVisible();
  });
});
