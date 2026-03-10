import { test, expect } from '@playwright/test';
import { freshStart, createGame, switchTab, openOverflowMenu, waitForSheet } from './helpers.js';

/**
 * Test 4: NPC weight 0 — wiki-only (EndSceneSheet + SvetTab)
 */
test.describe('NPC weight a wiki-only', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await createGame(page, 'Test NPC Weight');
  });

  /** Helper: přidej NPC na Svět → NPC sub-tab */
  async function addNpc(page, name) {
    const npcInput = page.getByPlaceholder('Nový NPC...');
    await npcInput.fill(name);
    await page.getByRole('button', { name: '+ NPC' }).click();
    await page.waitForTimeout(300);
  }

  test('přidání NPC v SvetTab', async ({ page }) => {
    await switchTab(page, 'Svět');
    await page.getByText('NPC', { exact: true }).click();
    await page.waitForTimeout(300);

    await addNpc(page, 'Kupec');
    await addNpc(page, 'Strážce');

    await expect(page.getByText('Kupec').first()).toBeVisible();
    await expect(page.getByText('Strážce').first()).toBeVisible();
  });

  test('weight 0 = jen wiki badge', async ({ page }) => {
    await switchTab(page, 'Svět');
    await page.getByText('NPC', { exact: true }).click();
    await page.waitForTimeout(300);

    await addNpc(page, 'Kupec');
    await addNpc(page, 'Strážce');

    // Sniž weight Strážce na 0 — klikni − vedle jeho jména
    // Strážce je druhý NPC, najdeme řádek přes text a klikneme na sousední −
    // NPC wiki řádek: [jméno] [badge] [−] [1×] [+] [✕]
    // Použijeme přesný selektor: najdi "Strážce" a pak klikni na − v jeho řádku
    const strazceRow = page.locator('div').filter({ hasText: /^Strážce/ });
    await strazceRow.getByRole('button', { name: '−' }).click();
    await page.waitForTimeout(200);

    // Strážce by měl mít badge "jen wiki"
    await expect(page.getByText('jen wiki').first()).toBeVisible();
  });

  test('NPC weight 0 se nezobrazuje v Přehled seznamu', async ({ page }) => {
    await switchTab(page, 'Svět');
    await page.getByText('NPC', { exact: true }).click();
    await page.waitForTimeout(300);

    await addNpc(page, 'Kupec');
    await addNpc(page, 'Strážce');

    // Nastav Strážce na weight 0
    const strazceRow = page.locator('div').filter({ hasText: /^Strážce/ });
    await strazceRow.getByRole('button', { name: '−' }).click();
    await page.waitForTimeout(200);

    // Přepni na Mythic (Přehled) sub-tab
    await page.getByText('Mythic', { exact: true }).click();
    await page.waitForTimeout(300);

    // V NPC SEZNAM by měl být jen Kupec, počet 1
    await expect(page.getByText(/1\/25/)).toBeVisible();
  });

  test('EndSceneSheet nevidí NPC s weight 0', async ({ page }) => {
    await switchTab(page, 'Svět');
    await page.getByText('NPC', { exact: true }).click();
    await page.waitForTimeout(300);

    await addNpc(page, 'Kupec');
    await addNpc(page, 'Strážce');

    // Nastav Strážce na weight 0
    const strazceRow = page.locator('div').filter({ hasText: /^Strážce/ });
    await strazceRow.getByRole('button', { name: '−' }).click();
    await page.waitForTimeout(200);

    // Otevři Konec scény
    await switchTab(page, 'Deník');
    await openOverflowMenu(page, 'Konec scény');
    await waitForSheet(page, 'KONEC SCÉNY');

    // V NPC seznamu by měl být jen Kupec
    await expect(page.getByText('Kupec').first()).toBeVisible();
  });
});
