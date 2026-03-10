# Check-docs verifikace: NPC pole `povolani`

## Zadani

"Pridej ke kazdemu NPC pole `povolani` kde si hrac zapise cim se NPC zivi"

---

## Phase 1: Klasifikace zmeny

**Kategorie: DATA**

Pridava se nove pole (`povolani`) k existujici entite (NPC). Zadna zmena mechaniky, zadna zmena UI-only — je to rozsireni datoveho modelu.

---

## Phase 2: Cteni relevantnich docs

### 2.1 Datovy model — `src/docs/datovy-model.jsx`, radky 200–233

NPC entita definuje tato pole:

- `id` (string)
- `jmeno, prijmeni` (string)
- `druh` (enum: Mys | Hlodavec | Savec | Ostatni)
- `spolecenskePostaveni` (string)
- `vzhled` (string)
- `zvlastnost` (string)
- `znameni` (string)
- `motivace` (string)
- `vztah` (string)
- `reakce` ({hod, stav})
- `osadaId` (string?)
- `frakceId` (string?)
- `str, dex, wil` ({akt, max}?)
- `bo` ({akt, max}?)
- `zbran` (string?)
- `zbroj` (number?)
- `predmetyUSebe` (string[]?)
- `poznamky` (string)

**Pole `povolani` v datovem modelu NEEXISTUJE.**

### 2.2 Diagram — `src/docs/solo-rpg-diagram.jsx`, radky 253–269

NPC wiki zaznam definuje:

- Jmeno
- Popis
- Lokace
- Frakce
- Vztah k hraci
- Reakce (2d6)
- Poznamky
- Bojove statistiky (volitelne)

**Pole `povolani` ani zadny ekvivalent (zamestnani, remeslo, profese) neni v diagramu zminen.**

### 2.3 Mausritter pravidla (z diagramu)

V tvorbe NPC (d6 spolecenskePostaveni) existuje socialni vrstva (Chudas, Prosta, Mestan, Cech, Slechtic), ale NE konkretni povolani/remeslo.

### 2.4 Soucasna implementace

V `SvetTab.jsx` existuji pole: `popis`, `lokace`, `vztah`, `poznamky`, `zbran`, `dmg`, `zbroj`, `predmetyUSebe` + bojove staty. Pole `povolani` neni implementovano.

---

## Phase 3: Verdikt

### CHYBI V DOCS

Pole `povolani` neni definovano ani v datovem modelu (`datovy-model.jsx`), ani v diagramu (`solo-rpg-diagram.jsx`). Pred implementaci je treba rozhodnout:

1. **Pridat `povolani` do datoveho modelu?** — Pokud ano, je treba nejdriv aktualizovat `src/docs/datovy-model.jsx` (NPC entitu, radek ~222, pred `poznamky`) a pridat pole `{ name: "povolani", type: "string?", note: "Cim se NPC zivi (kupec, kovar, straze...)" }`.

2. **Migrace je NUTNA** — Pole se pridava k existujici entite. Je treba:
   - Zvysit `CURRENT_VERSION` v `src/store/gameStore.js`
   - Pridat migraci ktera projde `game.npcs` (pokud NPC data zustavaji na urovni Mythic seznamu) nebo NPC wiki objekty a prida `povolani: ""` kde chybi

3. **Neni uz `popis` dostatecne?** — Pole `popis` ("kdo to je, jak vypada, cim je zajimavy") by mohlo slouzit ke stejnemu ucelu. Otazka pro uzivatele: je `povolani` skutecne potreba jako samostatne pole, nebo staci zapsat povolani do `popis`?

---

## Phase 4: Doporuceni (bez implementace)

Pokud uzivatel potvrdi, ze `povolani` chce jako samostatne pole:

1. Aktualizovat `src/docs/datovy-model.jsx` — pridat `povolani` do NPC entity
2. Aktualizovat `src/docs/solo-rpg-diagram.jsx` — pridat "Povolani" do NPC wiki zaznamu (radek ~260)
3. Pridat migraci v `src/store/gameStore.js` (CURRENT_VERSION++)
4. Pridat UI pole v `src/components/tabs/SvetTab.jsx`
5. Neexistuje NOTEBOOKLM dotaz — Mausritter pravidla NPC povolani nedefinuji, je to ciste uzivatelsky pozadavek (volny text)

---

## Soubory kontrolovane behem verifikace

- `/home/brux/projekty/solo-rpg-toolkit/src/docs/datovy-model.jsx` (radky 200–233)
- `/home/brux/projekty/solo-rpg-toolkit/src/docs/solo-rpg-diagram.jsx` (radky 253–269)
- `/home/brux/projekty/solo-rpg-toolkit/src/store/gameStore.js` (radky 10, 45)
- `/home/brux/projekty/solo-rpg-toolkit/src/components/tabs/SvetTab.jsx` (radky s NPC poli)
