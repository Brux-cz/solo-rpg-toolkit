# Verifikacni report: Pridani pole `reakce` k NPC v SvetTab

## Phase 1: Klasifikace zmeny

**Kategorie: DATA**

Zadani pridava nove pole `reakce` k NPC entite zobrazene v SvetTab. Jde o datovou zmenu — nove pole na existujici entite.

## Phase 2: Cteni relevantnich docs

### Datovy model (`src/docs/datovy-model.jsx`, r. 200-233)

Pole `reakce` **JIZ EXISTUJE** v datovem modelu NPC entity:

```
{ name: "reakce", type: "{hod, stav}", note: "2d6 → stav: 2=Agresivní, 3-5=Nepřátelský, 6-8=Opatrný, 9-11=Povídavý, 12=Nápomocný" }
```

Typ: objekt `{hod, stav}` — kde `hod` je vysledek 2d6, `stav` je textovy popis odvozeny z hodu.

### Diagram (`src/docs/solo-rpg-diagram.jsx`, r. 1292-1300)

Sekce `reakce_npc` potvrzuje mechaniku:
- Hod 2d6
- Tabulka: 2=Agresivni, 3-5=Nepratelsk, 6-8=Nejista, 9-11=Povidava, 12=Napomocna

**POZOR — drobna nesrovnalost v nazvu stavu pro 6-8:**
- Datovy model rika: "Opatrny"
- Diagram rika: "Nejista"

Jde o stejny koncept, ale nazev se lisi. Pri implementaci je treba rozhodnout ktery pouzit (doporucuji diagram — "Nejista" — protoze je to primo z pravidel Mausritter).

### Aktualni stav implementace

- **gameStore.js**: NPC v `npcs[]` maji strukturu `{ name, weight, flag }` + volitelna pole (popis, lokace, vztah, poznamky, bojove staty, zbran, dmg, zbroj, predmetyUSebe). Pole `reakce` **NENI** v INITIAL_GAME, ale NPC pouzivaji volnou strukturu (pole se pridavaji pres `updateNpc(idx, patch)`).
- **SvetTab.jsx**: NPC wiki karta zobrazuje popis, lokaci, vztah, poznamky, bojove staty, zbran/dmg/zbroj, predmety. Pole `reakce` **NENI** zobrazeno.

### Migrace

Pole `reakce` je **volitelne** (existujici NPC ho nemaji a to je OK — `n.reakce` bude `undefined`). Protoze SvetTab pouziva pattern `n.reakce || defaultValue` a pole se uklada pres genericky `updateNpc(idx, { reakce: ... })`, **migrace NENI nutna** — staci zobrazit `reakce` s fallbackem na prazdny stav. Toto je konzistentni s tim jak jsou ostatni volitelna pole (popis, lokace, zbran atd.) implementovana bez migrace.

## Phase 3: Verdikt

**SEDI** (s drobnou poznamkou)

Pole `reakce` je plne definovano v datovem modelu i diagramu. Implementace muze pokracovat.

### Kontrolni seznam pro implementaci:

1. **Typ pole**: `{hod: number, stav: string}` — NE jen string!
2. **Mechanika**: 2d6, mapovani na stav podle tabulky
3. **UI**: Pridat do NPC wiki karty v SvetTab — tlacitko "Hodit reakci" (2d6) + zobrazeni vysledku (hod + stav)
4. **Tabulka stavu**:
   - 2 = Agresivni
   - 3-5 = Nepratelsky
   - 6-8 = Nejista/Opatrny (rozhodnout)
   - 9-11 = Povidavy
   - 12 = Napomocny
5. **Migrace**: Neni nutna (volitelne pole s fallbackem)
6. **Barvy stavu**: Zvazit barevne kodovani (cervena pro agresivni, zelena pro napomocny atd.)

### Nesrovnalost k reseni:

Nazev stavu pro hod 6-8 se lisi mezi datovym modelem ("Opatrny") a diagramem ("Nejista"). Pred implementaci se zeptat uzivatele, nebo sjednotit docs.
