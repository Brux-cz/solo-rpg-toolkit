/**
 * Společné helper funkce pro Playwright testy.
 * Simulují kroky, které dělá člověk — klikání, čekání na UI.
 */

/** Smaže localStorage a načte appku od nuly. */
export async function freshStart(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForSelector('text=Solo RPG Companion');
}

/** Vytvoří novou hru a vstoupí do ní. */
export async function createGame(page, name = '') {
  await page.getByText('+ Nová hra').click();
  if (name) {
    await page.locator('input').last().fill(name);
  }
  await page.getByText('Vytvořit').click();
  // Měli bychom být v hře — vidíme spodní navigaci
  await page.waitForSelector('text=Deník');
}

/** Přepne na tab (Deník / Postava / Svět). */
export async function switchTab(page, tabName) {
  // Klikáme na spodní navigaci — force: true protože sheet může překrývat
  if (tabName === 'Deník') {
    await page.locator('text=📖').first().click({ force: true });
  } else if (tabName === 'Postava') {
    await page.locator('text=🐭').first().click({ force: true });
  } else if (tabName === 'Svět') {
    await page.locator('text=🗺️').first().click({ force: true });
  }
  await page.waitForTimeout(300);
}

/** Klikne na toolbar tlačítko (v deníku). */
export async function clickToolbar(page, buttonName) {
  await page.getByRole('button', { name: buttonName }).click();
}

/** Otevře overflow menu (⋯) a klikne na položku. */
export async function openOverflowMenu(page, itemText) {
  await page.getByRole('button', { name: '⋯' }).click();
  await page.waitForTimeout(200);
  await page.getByText(itemText).click();
}

/** Počká na otevření bottom sheetu (sheet s daným textem v hlavičce). */
export async function waitForSheet(page, titleText) {
  await page.waitForSelector(`text=${titleText}`, { timeout: 3000 });
}

/** Projde celou tvorbou postavy (5 kroků) a vrátí se na PostavaTab. */
export async function createCharacter(page) {
  await switchTab(page, 'Postava');
  // Klikni na tlačítko tvorby postavy
  await page.getByRole('button', { name: /Vytvořit postavu/ }).click();
  await waitForSheet(page, 'TVORBA POSTAVY');

  // Krok 1 — Vlastnosti: Hodit
  await page.getByRole('button', { name: /Hodit/ }).first().click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Další/ }).click();

  // Krok 2 — BO a Ďobky: Hodit
  await page.getByRole('button', { name: /Hodit/ }).first().click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Další/ }).click();

  // Krok 3 — Původ (zobrazí se automaticky)
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Další/ }).click();

  // Krok 4 — Zbraň: klikni na první zbraň v gridu
  await page.waitForTimeout(300);
  // Zbraně mají názvy jako "Improvizovaná", "Lehká (dýka, jehla)", atd.
  await page.getByText('Improvizovaná').click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Další/ }).click();

  // Krok 5 — Vzhled: Hodit vše
  await page.waitForTimeout(300);
  const hoditVseBtn = page.getByRole('button', { name: /Hodit/ }).first();
  await hoditVseBtn.click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Dokončit/ }).click();

  // Sheet zmizí, jsme zpět na PostavaTab s postavou
  await page.waitForTimeout(500);
}
