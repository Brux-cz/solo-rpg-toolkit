# Verifikacni report: Pridani pole `reakce` k NPC v SvetTab

## Phase 1: Klasifikace zmeny

**Kategorie: DATA + UI**

Zadani pridava nove pole `reakce` k NPC entite a zobrazuje ho v SvetTab. To znamena:
- Zmena datoveho modelu (nove pole na NPC objektu)
- Zmena UI (zobrazeni v NPC wiki karte)

Vyzaduje plnou verifikaci.

---

## Phase 2: Cteni relevantnich docs

### Datovy model (`src/docs/datovy-model.jsx`, r. 200-233)

Pole `reakce` na NPC entite **JIZ EXISTUJE** v datovem modelu:

```
{ name: "reakce", type: "{hod, stav}", note: "2d6 -> stav: 2=Agresivni, 3-5=Nepratelsky, 6-8=Opatrny, 9-11=Povidavy, 12=Napomocny" }
```

Klicove informace z modelu:
- Typ: objekt `{hod, stav}` (ne prosty string nebo cislo)
- `hod` = vysledek 2d6
- `stav` = textovy stav odvozeny z hodu podle tabulky
- Tabulka: 2=Agresivni, 3-5=Nepratelsky, 6-8=Opatrny, 9-11=Povidavy, 12=Napomocny

### Diagram (`src/docs/solo-rpg-diagram.jsx`)

Sekce `reakce_npc` (r. 1292-1320) popisuje mechaniku:

```
2: AGRESIVNI — okamzite zautoci
3-5: NEPRATELSKA — nepratelsky, ale lze zkusit uchlacholit
6-8: NEJISTA — vaha, mysi ho mohou presvedcit
9-11: POVIDAVA — ochoten mluvit, mozna obchod
12: NAPOMOCNA — pratelsky, aktivne pomuze
```

NPC wiki sekce v diagramu (r. 263):
```
Reakce (z 2d6 tabulky): agresivni -> napomocna
```

### Phase 2b: Cross-check mezi docs

**NESROVNALOST NALEZENA** v nazvech stavu pro rozsah 6-8:

| Hod | Datovy model | Diagram |
|-----|-------------|---------|
| 6-8 | **Opatrny** | **Nejista** |

Datovy model pouziva "Opatrny", diagram pouziva "Nejista". Jde o stejny koncept (NPC vaha, neni agresivni ale ani pratelsky), ale nazvy se lisi.

Ostatni hodnoty se shoduji:
- 2: Agresivni = Agresivni
- 3-5: Nepratelsky = Nepratelska
- 9-11: Povidavy = Povidava
- 12: Napomocny = Napomocna

---

## Phase 3: Soucasny stav implementace

Aktualni SvetTab (`src/components/tabs/SvetTab.jsx`):
- Pole `reakce` na NPC v SvetTab **NEEXISTUJE** — grep nenalezl zadny vyskyt
- NPC wiki karta zobrazuje: popis, lokace, vztah, poznamky, bojove staty, zbran, zbroj, predmetyUSebe
- Pole `reakce` v datovem modelu definovano, ale v UI zatim neimplementovano

---

## Phase 3: Verdikt

### NESROVNALOST

1. **Nazev stavu pro hod 6-8 se lisi mezi docs:**
   - `datovy-model.jsx` r. 214: "Opatrny"
   - `solo-rpg-diagram.jsx` r. 1298: "Nejista"
   - **Pred implementaci je treba rozhodnout, ktery nazev je spravny** (idealne overit v pravidlech Mausritter)

2. **Migrace NENI potreba:**
   - Pole `reakce` je volitelne (`{hod, stav}` — NPC ho proste nebudou mit dokud uzivatel neklikne na hod)
   - Existujici NPC objekty budou fungovat s `n.reakce || null` / fallback v UI
   - Jde o stejny vzor jako `popis`, `lokace`, `poznamky` — vsechno pouziva `|| ""` fallback

3. **Implementacni plan (pokud by se implementovalo):**
   - Pridat do NPC wiki karty v SvetTab.jsx input/button pro hod 2d6
   - Ulozit jako `{ hod: number, stav: string }` na NPC objekt
   - Zobrazit vysledek (napr. badge podobne jako `vztah`)
   - Bez migrace — volitelne pole s fallback

### Akce pred implementaci:
- [ ] Vyresit nesrovnalost "Opatrny" vs "Nejista" pro hod 6-8
- [ ] Po rozhodnuti sjednotit oba docs
- [ ] Teprve pak implementovat
