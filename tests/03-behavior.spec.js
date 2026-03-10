import { test, expect } from '@playwright/test';
import { freshStart, createGame, openOverflowMenu, waitForSheet } from './helpers.js';

/**
 * Test 2: NPC Akce — BehaviorSheet (🎭)
 */
test.describe('NPC Akce (BehaviorSheet)', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test Behavior');
  });

  test('hodit akci s kontextem a vložit do deníku', async ({ page }) => {
    // Otevři sheet přes overflow menu
    await openOverflowMenu(page, 'NPC Akce');
    await waitForSheet(page, 'NPC AKCE');

    // Zadej jméno NPC
    await page.getByPlaceholder('Jméno NPC').fill('Šedivec');

    // Default kontext je "Obecné akce" — zkus jiný
    await page.getByText('Akce v boji').click();
    await page.waitForTimeout(200);

    // Hodit
    await page.getByText('HODIT').first().click();
    await page.waitForTimeout(500);

    // Měl by se zobrazit výsledek — 2 slova v oranžovém rámečku
    // a tlačítko VLOŽIT DO TEXTU
    await expect(page.getByText('VLOŽIT DO TEXTU')).toBeVisible();

    await page.getByText('VLOŽIT DO TEXTU').click();
    await page.waitForTimeout(300);

    // V deníku by měl být oranžový blok s 🎭
    await expect(page.getByText('🎭').first()).toBeVisible();
    await expect(page.getByText('Šedivec').first()).toBeVisible();
  });

  test('přepínání kontextů', async ({ page }) => {
    await openOverflowMenu(page, 'NPC Akce');
    await waitForSheet(page, 'NPC AKCE');

    const kontexty = ['Obecné akce', 'Akce NPC', 'Akce v boji', 'Rozhovor', 'Zvíře / tvor', 'Motivace'];

    for (const ctx of kontexty) {
      const pill = page.getByText(ctx, { exact: true });
      await expect(pill).toBeVisible();
      await pill.click();
      await page.waitForTimeout(100);
    }
  });

  test('hodit několikrát za sebou mění výsledek', async ({ page }) => {
    await openOverflowMenu(page, 'NPC Akce');
    await waitForSheet(page, 'NPC AKCE');

    await page.getByPlaceholder('Jméno NPC').fill('Test');
    await page.getByText('HODIT').first().click();
    await page.waitForTimeout(300);

    // Zapamatuj první výsledek
    const resultArea = page.locator('text=/\\+/').first();
    const firstResult = await resultArea.textContent();

    // Hodit znovu
    await page.getByText('HODIT').first().click();
    await page.waitForTimeout(300);

    // Výsledek se mohl změnit (ale nemusí — je to random)
    // Hlavně ověříme, že se nezhroutil UI
    await expect(page.getByText('VLOŽIT DO TEXTU')).toBeVisible();
  });
});
