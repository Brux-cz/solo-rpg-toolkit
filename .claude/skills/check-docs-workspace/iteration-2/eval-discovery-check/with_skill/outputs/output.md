# Verifikacni report: Discovery Check mechanika pro thready

## Phase 1: Klasifikace zmeny

**Kategorie: MIX (DATA + MECHANIC)**

- DATA: Thread entita potrebuje nova pole (flashpointy, plot armor, delka tracku, faze). Existujici pole `progressTrack` v datovem modelu vs `progress`/`total` v kodu.
- MECHANIC: Discovery Check flow (Fate Q -> d10+progress -> Thread Discovery Table -> Meaning Tables -> body progressu).

## Phase 2: Prectene docs

### Datovy model (`src/docs/datovy-model.jsx`)

- **Radek 243-246**: Thread v `threadSeznam` ma pole:
  - `popis` (string) — aktivni dejova linka
  - `progressTrack` (number 0-10) — linearni pokrok
  - `vaha` (number) — kolikrat v seznamu
- **Poznamka u progressTrack (r. 245)**: "Discovery Check: akce -> Fate Q 'Je neco objeveno?' (min 50/50) -> Yes=d10+progress na Thread Discovery Table -> Meaning Tables."

### Diagram (`src/docs/solo-rpg-diagram.jsx`)

- **Radky 615-645** (Thread Progress Track sekce):
  - Delka tracku: 10 (kratky), 15 (standardni), 20 (komplexni)
  - Progress points: +2 za standardni pokrok, +2 za flashpoint, +1/+2/+3 za Discovery Check Table
  - Flashpointy: dramaticke momenty, vynucene na konci faze (kazda faze = 5 bodu)
  - Plot Armor: thread nemuze byt nahodne uzavren dokud nedosahne konce
  - Conclusion: na konci tracku Plot Armor zmizi

- **Radky 636-640** (Discovery Check):
  - Kdyz se pribeh zasekne
  - Postava vyvine usili
  - Fate Q "Je neco objeveno?" — sance min 50/50
  - Uspech -> Thread Discovery Check Table -> typ objevu + bonusove body (+1 az +3)

- **Radek 1026** (poznatky ze sucheho pruchodu):
  - d10+progress na Thread Discovery Table
  - ExcNo blokuje dalsi pokusy ve scene!

- **Radky 297-302** (Thread wiki zaznam):
  - Volitelny Progress Track: delka 10/15/20
  - Aktualni body, faze (po 5 bodech)
  - Flashpointy (zaznamenane/vynucene)
  - Plot Armor status (aktivni / zrusen pri Conclusion)

- **Radky 802-805** (Bookkeeping):
  - Pridej Progress Points za pokrok (+2)
  - Nastal Flashpoint? Pokud ne a konec faze -> vynuť ho
  - Dosahl track konce -> Conclusion, Plot Armor zmizi

### Aktualni kod (`src/store/gameStore.js`)

- **Radek 11**: `threads: []`
- **Radek 46** (migrace 2->3): Thread ma pole `name`, `weight`, `progress`, `total`
- **CURRENT_VERSION = 6**

## Phase 2b: Cross-check — NESROVNALOSTI

### NESROVNALOST 1: Rozsah progressTrack

| Zdroj | Hodnota |
|-------|---------|
| Datovy model (r. 245) | `number (0-10)` — fixne 0-10 |
| Diagram (r. 619) | 10 (kratky), 15 (standardni), 20 (komplexni) |
| Kod (gameStore r. 46) | `total: 10` (konfigurovatelne) |

Datovy model rika 0-10, ale diagram jasne definuje tri delky (10/15/20). Kod uz pouziva `total` (default 10), coz odpovida diagramu. **Datovy model je zastaraly — chybi variabilni delka.**

### NESROVNALOST 2: Nazvy poli

| Zdroj | Nazev pole pro pokrok | Nazev pole pro popis |
|-------|----------------------|---------------------|
| Datovy model (r. 245) | `progressTrack` | `popis` |
| Kod (gameStore r. 46) | `progress` + `total` | `name` |

Datovy model pouziva `progressTrack` (jedno cislo), kod pouziva `progress` (aktualni) + `total` (cilova hodnota). Datovy model pouziva `popis`, kod pouziva `name`. **Model a kod se rozchazeji v nazvech poli.**

### NESROVNALOST 3: Chybejici pole v datovem modelu

Diagram (r. 297-302) definuje pro thread wiki zaznam:
- `faze` (po 5 bodech)
- `flashpointy` (zaznamenane/vynucene)
- `plotArmor` (aktivni/zrusen)
- `stav` (aktivni/vyreseny/opusteny)
- `typ` (hlavni/vedlejsi/osobni)

**Zadne z techto poli NENI v datovem modelu** (`datovy-model.jsx` r. 243-246 ma jen popis, progressTrack, vaha).

### NESROVNALOST 4: Thread Discovery Table — NENI DEFINOVANA

Oba dokumenty odkazuji na "Thread Discovery Table" / "Thread Discovery Check Table", ale **zadny z nich neobsahuje samotnou tabulku** (jake vysledky pro jake hody d10+progress). Pouze vime:
- Vstup: d10 + aktualni progress
- Vystup: typ objevu + bonusove body (+1 az +3)
- Nasleduje: Meaning Tables pro interpretaci

Bez teto tabulky nelze mechaniku implementovat.

### NESROVNALOST 5: ExcNo pravidlo

Radek 1026 diagramu zminuje: "ExcNo=blokuje dalsi pokusy ve scene!" — toto neni zmíneno v hlavni sekci Discovery Check (r. 636-640). Je to pouze v sekcí poznatku ze sucheho pruchodu.

## Phase 3: Verdikt

**NESROVNALOST + CHYBI V DOCS**

Implementace Discovery Check mechaniky NELZE bezpecne provest bez vyreseni nasledujicich problemu:

1. **Datovy model je zastaraly** — neodpovida diagramu ani kodu (rozsah 0-10 vs 10/15/20, chybejici pole flashpointy/plotArmor/stav/typ)
2. **Nazvy poli se rozchazeji** mezi modelem a kodem (progressTrack vs progress+total, popis vs name)
3. **Thread Discovery Table chybi** — oba docs na ni odkazuji, ale nikde neni definovana

## Phase 4: NotebookLM dotaz

Protoze Thread Discovery Table neni v docs definovana, je nutne se zeptat:

```
NOTEBOOKLM DOTAZ:
Kontext: Implementace Discovery Check mechaniky pro Thread Progress Track v Mythic GME 2e.
Otazka: Jak presne vypada Thread Discovery Check Table? Jake jsou rozsahy vysledku pro d10+progress a jake typy objevu (+ bonusove body) odpovidaji kazdemu rozsahu? Existuji specialni vysledky pro nizke/vysoke hody?
Zdroj: Mythic GME 2e rulebook
```

## Doporuceny postup pred implementaci

1. Ziskat Thread Discovery Table z Mythic GME 2e (NotebookLM dotaz vyse)
2. Aktualizovat `datovy-model.jsx` — thread entita:
   - Opravit rozsah progressTrack na variabilni (10/15/20)
   - Pridat pole: stav, typ, flashpointy, plotArmor
   - Sjednotit nazvy s kodem (nebo kod s modelem)
3. Pridat Thread Discovery Table do `constants/tables.js`
4. Teprve pak implementovat mechaniku
5. Migrace: nova pole na thread entite = CURRENT_VERSION 7, nova MIGRATIONS[6] entry
