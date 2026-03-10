# Verifikacni report: Discovery Check mechanika pro thready

## Phase 1: Klasifikace zmeny

**Kategorie: MIX (DATA + MECHANIC)**

- DATA: Thready potrebuji nova/zmenena pole (progressTrack, delka tracku, flashpointy, plot armor)
- MECHANIC: Discovery Check je nova herni mechanika (Fate Q + tabulka + progress body)

## Phase 2: Cteni dokumentace

### Prectene sekce

**Datovy model (`src/docs/datovy-model.jsx`):**
- r. 234-265: Mythic GME entita — threadSeznam, progressTrack, keyedScenes, perilPoints
- r. 284-291: Scena (bookkeeping)

**Diagram (`src/docs/solo-rpg-diagram.jsx`):**
- r. 284-314: Thread wiki zaznam (pole, progress track, propojeni)
- r. 344-362: Thread Seznam (mechanicky)
- r. 614-645: Thread Progress Track (kompletni sekce)
- r. 795-805: Bookkeeping — integrace progress tracku
- r. 1020-1039: Poznatky ze sucheho pruchodu — Discovery Check detail

### Co dokumentace definuje

**Thread Progress Track (diagram r. 614-645):**
- Track delky: 10 (kratky), 15 (standardni), 20 (komplexni)
- Progress Points: standardni pokrok = +2, flashpoint = +2, Discovery Check = +1/+2/+3
- Faze po 5 bodech, flashpointy (prirozene/vynucene)
- Plot Armor: thread nemuze byt nahodne uzavren dokud nedosahne konce
- Conclusion: na konci tracku Plot Armor zmizi

**Discovery Check (diagram r. 636-640 + r. 1026):**
- Trigger: zaseknuty thread, postava vyvine usili
- Postup: Fate Q "Je neco objeveno?" (min 50/50)
- Uspech: d10 + progress na Thread Discovery Table -> Meaning Tables
- ExcNo: blokuje dalsi pokusy ve scene!
- Vysledek: +1 az +3 progress body

**Datovy model (r. 245):**
- `progressTrack`: type `number (0-10)`, poznamka: "2e! Linearni pokrok."

### Co implementace v kodu aktualne ma

**gameStore.js (r. 46):**
- Thread objekt: `{ name, weight, progress, total }`
- `progress` default 0, `total` default 10
- Migrace v2->v3 prida tyto pole

**SvetTab.jsx + EndSceneSheet.jsx:**
- Zobrazuji progress bar u threadu
- Tlacitko pro +2 progress (standardni pokrok)
- Zadny Discovery Check UI

## Phase 3: Verdikt

### NESROVNALOST #1 — Struktura thread objektu

**Docs rikaji:**
- Datovy model (r. 245): `progressTrack: number (0-10)` — jednoduche cislo
- Diagram (r. 297-302): Thread wiki ma pole: delka (10/15/20), aktualni body, faze, flashpointy, Plot Armor status

**Kod ma:**
- `progress: number` a `total: number` (default 10) — castecne sedi

**Konflikt:** Datovy model definuje `progressTrack` jako `number (0-10)`, ale diagram jasne popisuje tracky delky 10, 15 i 20. Datovy model je v tomto neuplny/zastaraly — rika jen 0-10, ale diagram podporuje 15 a 20.

Navic chybi pole pro:
- `flashpointy` (zaznamenane/vynucene)
- `plotArmor` (aktivni/zruseny)
- `stav` (aktivni/vyreseny/opusteny)
- `typ` (hlavni/vedlejsi/osobni)

### NESROVNALOST #2 — Nazvy poli

**Docs rikaji:** `progressTrack`, `vaha`
**Kod ma:** `progress`, `total`, `weight`

Toto je presne ten typ chyby zminenej v CLAUDE.md (Common Pitfalls): "Invented field: Added weight/progress to a thread without checking the model first. The model uses vaha and progressTrack."

### CHYBI V DOCS #1 — Thread Discovery Check Table

Diagram (r. 640) a datovy model (r. 245) oba odkazuji na "Thread Discovery Table" / "Thread Discovery Check Table", ale **samotna tabulka neni nikde definovana**. Neni jasne:
- Jake jsou radky tabulky?
- Jak presne se pouziva d10+progress?
- Jake typy objevu existuji?
- Kolik bodu (+1, +2, +3) za jaky vysledek?

### CHYBI V DOCS #2 — ExcNo blokace

Diagram (r. 1026) zminuje "ExcNo=blokuje dalsi pokusy ve scene!" — ale neni specifikovano jak to implementovat (per-scene flag? per-thread?).

## Shrnuti pro implementaci

Pred implementaci Discovery Check je nutne vyresit:

1. **Aktualizovat datovy model** — `progressTrack: number (0-10)` je prilis jednoduchy. Potrebuje reflektovat:
   - Ruzne delky (10/15/20)
   - Flashpointy
   - Plot Armor
   - Stav a typ threadu

2. **Opravit nazvy poli v kodu** — `weight` -> `vaha`, `progress` -> aktualni hodnota progressTracku. Toto vyzaduje MIGRACI (bump CURRENT_VERSION na 7).

3. **Doplnit Thread Discovery Check Table do dokumentace** — bez ni nelze implementovat. Nutny dotaz na zdroj (Mythic GME 2e rulebook).

4. **Ujasnit ExcNo blokaci** — per-scene nebo per-thread?

## NOTEBOOKLM DOTAZ

```
NOTEBOOKLM DOTAZ:
Kontext: Implementace Discovery Check mechaniky pro Thread Progress Track
Otazka: Jak presne vypada Thread Discovery Check Table? Jake jsou radky, jake vysledky d10+progress, kolik progress bodu za jaky vysledek? A jak presne funguje ExcNo blokace — blokuje vsechny Discovery Checks ve scene, nebo jen pro konkretni thread?
Zdroj: Mythic GME 2e rulebook
```

---

**Celkovy verdikt: NESROVNALOST + CHYBI V DOCS**

Nelze implementovat bez:
1. Opravy nesrovnalosti v datovem modelu (delka tracku, nazvy poli)
2. Doplneni Thread Discovery Check Table ze zdrojove knihy
3. Migrace existujicich dat (prejmenovani poli, pridani novych)
