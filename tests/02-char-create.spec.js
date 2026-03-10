import { test, expect } from '@playwright/test';
import { freshStart, createGame, switchTab, waitForSheet } from './helpers.js';

/**
 * Test 1: Tvorba postavy (CharCreateSheet)
 */
test.describe('Tvorba postavy', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test Postava');
  });

  test('kompletní průchod 5 kroky', async ({ page }) => {
    await switchTab(page, 'Postava');

    const createBtn = page.getByRole('button', { name: /Vytvořit postavu/ });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    await waitForSheet(page, 'TVORBA POSTAVY');

    // Krok 1/5 — Vlastnosti
    await expect(page.getByText('1 / 5')).toBeVisible();
    await page.getByRole('button', { name: /Hodit/ }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Další/ }).click();

    // Krok 2/5 — BO a Ďobky
    await expect(page.getByText('2 / 5')).toBeVisible();
    await page.getByRole('button', { name: /Hodit/ }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Další/ }).click();

    // Krok 3/5 — Původ
    await expect(page.getByText('3 / 5')).toBeVisible();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Další/ }).click();

    // Krok 4/5 — Zbraň
    await expect(page.getByText('4 / 5')).toBeVisible();
    await page.getByText('Improvizovaná').click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Další/ }).click();

    // Krok 5/5 — Vzhled
    await expect(page.getByText('5 / 5')).toBeVisible();
    await page.getByRole('button', { name: /Hodit/ }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Dokončit/ }).click();
    await page.waitForTimeout(500);

    // Výsledek: PostavaTab s postavou — staty viditelné
    await expect(page.getByText('STR', { exact: true })).toBeVisible();
    await expect(page.getByText('DEX', { exact: true })).toBeVisible();
    await expect(page.getByText('WIL', { exact: true })).toBeVisible();
    await expect(page.getByText('BO', { exact: true })).toBeVisible();
    // Inventář by měl mít zbraň
    await expect(page.getByText('INVENTÁŘ').first()).toBeVisible();
  });

  test('výběr různých zbraní', async ({ page }) => {
    await switchTab(page, 'Postava');
    await page.getByRole('button', { name: /Vytvořit postavu/ }).click();
    await waitForSheet(page, 'TVORBA POSTAVY');

    // Projdi na krok 4
    await page.getByRole('button', { name: /Hodit/ }).first().click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Další/ }).click();
    await page.getByRole('button', { name: /Hodit/ }).first().click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Další/ }).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Další/ }).click();

    // Krok 4 — ověř všechny zbraně
    const weapons = [
      'Improvizovaná',
      'Lehká (dýka, jehla)',
      'Střední (meč, sekera)',
      'Těžká (kopí, hákopí)',
      'Lehká střelná (prak)',
      'Těžká střelná (luk)',
    ];

    for (const w of weapons) {
      await expect(page.getByText(w).first()).toBeVisible();
    }

    // Vyber těžkou zbraň
    await page.getByText('Těžká (kopí, hákopí)').click();
    await page.waitForTimeout(200);
    await expect(page.getByText('d10').first()).toBeVisible();
  });
});
