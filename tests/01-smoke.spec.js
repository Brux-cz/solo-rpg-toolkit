import { test, expect } from '@playwright/test';
import { freshStart, createGame, switchTab, openOverflowMenu, createCharacter, clickToolbar, waitForSheet } from './helpers.js';

/**
 * Rychlý smoke test — ověří základní flow:
 * Nová hra → Postava → Fate → Scéna → NPC Akce → Odpočinek → Svět → Konec scény → Deník
 */
test.describe('Smoke test', () => {
  test('základní flow celou appkou', async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Smoke Test');

    // 1. Vidíme prázdný deník
    await expect(page.getByText('Deník')).toBeVisible();

    // 2. Vytvoř postavu
    await createCharacter(page);
    await expect(page.getByText('STR', { exact: true })).toBeVisible();

    // 3. ❓ Fate
    await switchTab(page, 'Deník');
    await clickToolbar(page, /Fate/);
    await waitForSheet(page, 'FATE');
    await page.getByPlaceholder('Je tu stráž').fill('Je tu past?');
    await page.getByRole('button', { name: '50/50' }).click();
    await page.getByRole('button', { name: /HODIT/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /VLOŽIT DO TEXTU/ }).click();

    // 4. 🎬 Scéna
    await clickToolbar(page, /Scéna/);
    await waitForSheet(page, 'NOVÁ SCÉNA');
    await page.getByPlaceholder(/projde/).fill('Průzkum jeskyně');
    await page.getByRole('button', { name: /TESTOVAT CHAOS/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /VLOŽIT SCÉNU/ }).click();

    // 5. 🎭 NPC Akce
    await openOverflowMenu(page, 'NPC Akce');
    await waitForSheet(page, 'NPC AKCE');
    await page.getByPlaceholder(/Jméno NPC/).fill('Šedivec');
    await page.getByRole('button', { name: /HODIT/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /VLOŽIT DO TEXTU/ }).click();

    // 6. 💤 Krátký odpočinek
    await clickToolbar(page, '💤');
    await waitForSheet(page, 'Odpočinek');
    await page.getByRole('button', { name: /Krátký odpočinek/ }).click();
    await page.waitForTimeout(500);
    // Zavři sheet kliknutím na overlay (horní tmavá oblast)
    await page.mouse.click(195, 50);
    await page.waitForTimeout(300);

    // 7. Tab Svět
    await switchTab(page, 'Svět');
    await expect(page.getByText('CF:').first()).toBeVisible();

    // 8. Konec scény
    await switchTab(page, 'Deník');
    await openOverflowMenu(page, 'Konec scény');
    await waitForSheet(page, 'KONEC SCÉNY');
    await page.getByRole('button', { name: /ANO/ }).first().click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /UKONČIT SCÉNU/ }).click();

    // 9. Deník by měl mít bloky
    await page.waitForTimeout(500);
    await expect(page.getByText('❓').first()).toBeVisible();
  });
});
