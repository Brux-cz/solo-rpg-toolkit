# Engine & CLI Agent — Zpráva o chybách a vylepšeních

Sestaveno z auditů scén 2–24 (okral-log.md) a analýzy engine.js + cli.js.

---

## 1. BUG: Fate odds labels — tichá degradace na 50/50

**Závažnost: VYSOKÁ** (ovlivňuje správnost všech Fate hodů)

**Problém:** `engine.fate()` hledá oddsLabel přes `ODDS_LABELS.indexOf(label)`. Pokud label neexistuje (překlep, podtržítko, neexistující stupeň), vrátí -1 a engine tiše defaultuje na 50/50.

**Příčiny:**
1. Agent posílá `"Very_likely"` (podtržítko) místo `"Very likely"` (mezera)
2. Agent používá `"Somewhat_likely"` — stupeň, který v Mythic GME 2e **vůbec neexistuje**
3. Žádná chybová hláška, žádný warning — tichý fallback

**Dopad:** Všechny nestandardní labels se počítají jako 50/50. Při CF 1 je threshold pro 50/50 = 10, zatímco Likely = 15, Very likely = 25. Výsledky v praxi nebyly ovlivněny (hody vždy vysoké), ale je to časovaná bomba.

**Řešení v engine.js (ř. 70–72):**
```js
// PŘED:
const oddsIndex = ODDS_LABELS.indexOf(oddsLabel);
const idx = oddsIndex >= 0 ? oddsIndex : 4;

// PO — fuzzy match + warning:
fate(question, oddsLabel) {
  let oddsIndex = ODDS_LABELS.indexOf(oddsLabel);
  // Fuzzy: zkus normalizovat (podtržítka → mezery, case-insensitive)
  if (oddsIndex < 0 && oddsLabel) {
    const normalized = oddsLabel.replace(/_/g, " ");
    oddsIndex = ODDS_LABELS.findIndex(l => l.toLowerCase() === normalized.toLowerCase());
  }
  if (oddsIndex < 0) {
    console.error(`WARNING: Neznámý odds label "${oddsLabel}", fallback na 50/50`);
  }
  const idx = oddsIndex >= 0 ? oddsIndex : 4;
  // ...zbytek beze změny
}
```

**Řešení v cli.js (ř. 147–152):**
```js
// Přidat validaci před voláním engine:
case "fate": {
  const question = args[1] || "?";
  let odds = args[2] || "50/50";
  // Normalizace: podtržítka → mezery
  odds = odds.replace(/_/g, " ");
  // Validace
  if (!ODDS_LABELS.includes(odds)) {
    output({ error: `Neznámý odds label "${odds}". Platné: ${ODDS_LABELS.join(", ")}` });
    process.exit(1);
  }
  result = engine.fate(question, odds);
  break;
}
```

---

## 2. BUG: `combat-save` nefunguje s názvem "hráč" a atributem mimo aktivní boj

**Závažnost: STŘEDNÍ**

**Problém:** `combatSavingThrow()` v engine.js (ř. 523) hledá atribut přes `_getAttrValue()`, která pro hráče vrací `this.game.character[attr]?.akt`. Funguje pro `"str"`, `"dex"`, `"wil"`. Ale CLI command `combat-save Okřál dex` selhává, protože `_getAttrValue` hledá jméno "Okřál" — nenajde ho jako "hráč" ani jako nepřítele.

**Dopad:** Agent nemůže volat záchranné hody jménem postavy, musí používat `dice 20` a ručně porovnávat.

**Řešení v engine.js `_getAttrValue` (ř. 988):**
```js
_getAttrValue(name, attr) {
  const lower = name.toLowerCase();
  // Rozšířit match na jméno postavy
  const charName = this.game.character.jmeno?.toLowerCase();
  if (lower === "hráč" || lower === charName) return this.game.character[attr]?.akt ?? null;
  // ...zbytek beze změny
}
```

Stejný fix aplikovat na `_findCombatant` (ř. 962) a `_findTarget` (ř. 975).

---

## 3. BUG: `discovery` CLI příkaz — textový argument místo indexu

**Závažnost: STŘEDNÍ**

**Problém:** `discovery kozisek` se parsuje jako `parseInt("kozisek")` → `NaN` → `0` → vybere první thread místo Kožíška. Agent musí vědět přesný index threadu.

**Řešení v cli.js (ř. 238–239):**
```js
case "discovery": {
  let threadIdx = parseInt(args[1]);
  // Pokud není číslo, hledej podle jména
  if (isNaN(threadIdx)) {
    const name = args.slice(1, args[2]?.startsWith("elements:") ? 2 : undefined).join(" ").toLowerCase();
    threadIdx = save.game.threads.findIndex(t => t.name.toLowerCase().includes(name));
    if (threadIdx < 0) {
      output({ error: `Thread "${name}" nenalezen` });
      process.exit(1);
    }
  }
  result = engine.discovery(threadIdx, args[2]);
  break;
}
```

---

## 4. BUG: `addnpc` parsování — poslední slovo jména interpretováno jako weight

**Závažnost: STŘEDNÍ**

**Problém (cli.js ř. 246–248):**
```js
result = engine.addNpc(args.slice(1, -1).join(" ") || args[1], parseInt(args[args.length - 1]) || 1);
```
`addnpc Hruška` → `args.slice(1, -1)` = `[]` (prázdné!), fallback `args[1]` = "Hruška", weight = `parseInt("Hruška")` = NaN → 1. Funguje náhodou.

Ale `addnpc Mistr Kožíšek` → `args.slice(1, -1)` = `["Mistr"]`, weight = `parseInt("Kožíšek")` = NaN → 1. Jméno = "Mistr" (ztratí se "Kožíšek"!).

**Řešení:**
```js
case "addnpc": {
  const weightIdx = args.findIndex((a, i) => i > 0 && /^\d+$/.test(a));
  const name = weightIdx > 0 ? args.slice(1, weightIdx).join(" ") : args.slice(1).join(" ");
  const weight = weightIdx > 0 ? parseInt(args[weightIdx]) : 1;
  result = engine.addNpc(name, weight);
  break;
}
```
Stejný fix pro `addthread`.

---

## 5. CHYBĚJÍCÍ FUNKCE: Inventář management přes CLI

**Závažnost: STŘEDNÍ** (workaround = ruční editace JSON)

**Problém:** CLI nemá příkaz pro přidání/odebrání předmětu do inventáře. `setslot` existuje, ale vyžaduje přesný slot index a všechny parametry. Agent musí editovat JSON přímo (error-prone).

**Návrh:** Přidat `additem` a `removeitem` příkazy:
```
additem <nazev> [typ=předmět] [tecky.akt=1] [tecky.max=1] [damage=d6] [armor=1]
  → najde první prázdný slot a vloží předmět
removeitem <nazev|slot>
  → vyprázdní slot podle jména nebo indexu
```

---

## 6. CHYBĚJÍCÍ FUNKCE: `eatSupply` nepřidává entry do deníku

**Závažnost: NÍZKÁ** (audit nemůže ověřit jedení z entries)

**Problém (engine.js ř. 785–801):** `eatSupply()` mění inventář, ale nepřidává entry do deníku. Auditor nemůže zpětně ověřit, kdy myš jedla.

**Řešení:**
```js
eatSupply() {
  // ...stávající kód...
  const result = { ok: true, item: food.nazev, teckyBefore: before, teckyAfter: food.tecky.akt };
  // PŘIDAT:
  this.addEntry({ type: "eat", item: food.nazev, teckyBefore: before, teckyAfter: food.tecky.akt });
  return result;
}
```

---

## 7. BUG: Short rest mechanika — špatný vzorec

**Závažnost: NÍZKÁ** (ovlivňuje léčení)

**Problém (engine.js ř. 809–813):**
```js
const heal = roll(6) + 1;  // d6+1 → rozsah 2-7
```
Mausritter pravidla (dle diagramu ř. 1284): short rest léčí d6 BO (ne d6+1). `+1` tam nemá co dělat.

**Řešení:**
```js
const heal = roll(6);  // d6 → rozsah 1-6
```

---

## 8. VYLEPŠENÍ: `state` command — přidat poslední entries

**Závažnost: NÍZKÁ** (UX)

**Problém:** `state` vrací jen `entriesCount`, ne obsah posledních entries. Agent nemůže ověřit co se stalo naposledy bez čtení celého JSON.

**Řešení v engine.js `getState()` (ř. 1030–1040):**
```js
getState() {
  return {
    // ...stávající kód...
    entriesCount: this.game.entries.length,
    lastEntries: this.game.entries.slice(-5).map(e => ({
      type: e.type,
      summary: e.text?.slice(0, 80) || e.question?.slice(0, 80) || e.name || e.sceneNum || ""
    })),
  };
}
```

---

## 9. VYLEPŠENÍ: Přidat `save-save` (záchranný hod) mimo boj

**Závažnost: NÍZKÁ** (workaround = `dice 20`)

**Problém:** `combatSavingThrow` funguje jen s aktivním bojem (`if (!c) return error`). Agent potřebuje záchranné hody i mimo boj (DEX pro stopování, WIL pro intuici).

**Řešení:** Přidat metodu `savingThrow()` (bez prefixu "combat"), která funguje vždy:
```js
savingThrow(name, attr, mode = "normal") {
  // Stejný kód jako combatSavingThrow, ale bez kontroly activeCombat
  // Log se nepřidává do combat logu, ale do entries
}
```
CLI příkaz: `save <name> <attr> [advantage|disadvantage]`

---

## 10. VYLEPŠENÍ: Validace v `updateNpc` / `updateThread`

**Závažnost: NÍZKÁ**

**Problém (engine.js ř. 871–883):** `Object.assign(npc, patch)` — žádná validace. Lze nastavit `weight=99`, přidat neexistující klíče, přepsat `name` prázdným řetězcem.

**Řešení:**
```js
updateNpc(index, patch) {
  const npc = this.game.npcs[index];
  if (!npc) return { error: "NPC neexistuje" };
  if (patch.weight !== undefined) patch.weight = Math.max(0, Math.min(3, patch.weight));
  const allowed = ["name", "weight", "flag", "popis", "lokace", "vztah", "poznamky",
    "druh", "vzhled", "zvlastnost", "motivace", "str", "dex", "wil", "bo", "zbran", "zbroj"];
  for (const key of Object.keys(patch)) {
    if (!allowed.includes(key)) delete patch[key];
  }
  Object.assign(npc, patch);
  return { ok: true, npc };
}
```

---

## Shrnutí priorit

| # | Typ | Závažnost | Popis |
|---|---|---|---|
| 1 | BUG | VYSOKÁ | Fate odds labels — tichá degradace na 50/50 |
| 2 | BUG | STŘEDNÍ | combat-save nefunguje s jménem postavy |
| 3 | BUG | STŘEDNÍ | discovery — textový arg místo indexu |
| 4 | BUG | STŘEDNÍ | addnpc — parsování víceslovného jména |
| 5 | CHYBÍ | STŘEDNÍ | Inventář management (additem/removeitem) |
| 6 | CHYBÍ | NÍZKÁ | eatSupply nepřidává entry do deníku |
| 7 | BUG | NÍZKÁ | Short rest d6+1 místo d6 |
| 8 | VYLEPŠENÍ | NÍZKÁ | state — přidat poslední entries |
| 9 | VYLEPŠENÍ | NÍZKÁ | Záchranný hod mimo boj |
| 10 | VYLEPŠENÍ | NÍZKÁ | Validace v updateNpc/updateThread |
