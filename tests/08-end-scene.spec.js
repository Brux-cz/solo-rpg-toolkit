import { test, expect } from '@playwright/test';
import { freshStart, createGame, switchTab, openOverflowMenu, waitForSheet } from './helpers.js';

/**
 * Test: Konec scény — CF změna, NPC/Thread CRUD
 */
test.describe('Konec scény (EndSceneSheet)', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test End Scene');
  });

  test('CF se sníží při ANO (kontrola)', async ({ page }) => {
    await openOverflowMenu(page, 'Konec scény');
    await waitForSheet(page, 'KONEC SCÉNY');

    // Klikni ANO → CF−1
    await page.getByRole('button', { name: /ANO/ }).first().click();
    await page.waitForTimeout(300);

    // Měla by se zobrazit změna CF (→ symbol)
    await expect(page.getByText(/→/).first()).toBeVisible();
  });

  test('přidání NPC v EndSceneSheet', async ({ page }) => {
    await openOverflowMenu(page, 'Konec scény');
    await waitForSheet(page, 'KONEC SCÉNY');

    const npcInput = page.getByPlaceholder(/Nový NPC/);
    await npcInput.fill('Alchymista');
    await page.getByRole('button', { name: /\+ NPC/ }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText('Alchymista').first()).toBeVisible();
  });

  test('přidání a odebrání Thread', async ({ page }) => {
    await openOverflowMenu(page, 'Konec scény');
    await waitForSheet(page, 'KONEC SCÉNY');

    const threadInput = page.getByPlaceholder(/Nový Thread/);
    await threadInput.fill('Záhada lesa');
    await page.getByRole('button', { name: /\+ Thread/ }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText('Záhada lesa').first()).toBeVisible();

    // Odeber — klikni ✕ v řádku threadu
    const threadRow = page.locator('div').filter({ hasText: /^Záhada lesa/ });
    await threadRow.getByRole('button', { name: '✕' }).click();
    await page.waitForTimeout(300);
  });

  test('ukončení scény', async ({ page }) => {
    await openOverflowMenu(page, 'Konec scény');
    await waitForSheet(page, 'KONEC SCÉNY');

    await page.getByRole('button', { name: /ANO/ }).first().click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: /UKONČIT SCÉNU/ }).click();
    await page.waitForTimeout(500);
  });
});
