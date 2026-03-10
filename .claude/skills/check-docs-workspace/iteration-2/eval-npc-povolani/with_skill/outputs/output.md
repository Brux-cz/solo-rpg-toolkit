# Verifikacni report: NPC pole `povolani`

## Zadani
"Pridej ke kazdemu NPC pole `povolani` kde si hrac zapise cim se NPC zivi"

## Phase 1: Klasifikace zmeny

**Kategorie: DATA**

Pridava se nove pole k existujici entite NPC. Zadna zmena mechaniky, zadna zmena UI-only.

## Phase 2: Cteni relevantnich docs

### Datovy model (`src/docs/datovy-model.jsx`, r. 200-233)

NPC entita definuje tato pole:
- id, jmeno, prijmeni, druh, spolecenskePostaveni, vzhled, zvlastnost, znameni, motivace, vztah, reakce, osadaId, frakceId
- Bojove staty: str, dex, wil, bo, zbran, zbroj, predmetyUSebe
- poznamky

**Pole `povolani` v datovem modelu NEEXISTUJE.**

### Diagram (`src/docs/solo-rpg-diagram.jsx`, r. 253-282)

NPC wiki zaznam definuje:
- Jmeno, Popis, Lokace, Frakce, Vztah, Reakce, Poznamky
- Bojove statistiky (volitelne): STR, DEX, WIL, BO, zbroj, Utok, Motivace

**Pole `povolani` v diagramu NEEXISTUJE.**

### Soucasna implementace (`src/components/tabs/SvetTab.jsx`)

NPC wiki karta aktualne renderuje: popis, lokace, vztah, poznamky + bojove staty (str, dex, wil, bo, zbran, zbroj, predmetyUSebe). Pole `povolani` neni implementovano.

### Poznamka k existujicim polim

Datovy model definuje pole `spolecenskePostaveni` (d6: Chudas, Prosta, Mestan, Cech, Slechtic), ktere urcuje spolecenskou vrstvu NPC. To je ODLISNY koncept od povolani — `spolecenskePostaveni` rika "jak bohaty je", ne "cim se zivi". Nicmene v prikladech v datovem modelu (r. 227) je uvedeno: `Hrach (hostinsky, tlustoucky, zjizveny...)` — slovo "hostinsky" je de facto povolani, ale neni to formalni pole, je to soucasti popisu.

## Phase 2b: Cross-check mezi docs

Oba dokumenty jsou konzistentni — ani jeden nedefinuje pole `povolani`. Zadna nesrovnalost mezi docs.

## Phase 3: Verdikt

**CHYBI V DOCS**

Pole `povolani` neni definovano ani v datovem modelu, ani v diagramu. Pred implementaci je nutne zjistit, zda Mausritter pravidla definuji povolani/remesla pro NPC, nebo zda je to ciste uzivatelsky navrh bez opory v pravidlech.

## Phase 4: NotebookLM dotaz

```
NOTEBOOKLM DOTAZ:
Kontext: Chceme pridat pole "povolani" k NPC wiki kartam, kde si hrac zapise cim se NPC zivi (hostinsky, kovar, obchodnik...).
Otazka: Definuje Mausritter nejaky koncept povolani, remesla ci zamestnani pro NPC? Existuje tabulka profesi nebo podobny generator? Nebo je povolani soucasti jineho pole (napr. popis, spolecenske postaveni)?
Zdroj: Mausritter rulebook
```

**CEKAM NA ODPOVED UZIVATELE** pred jakoukoli implementaci.

## Implementacni poznamky (pro pripad, ze se rozhodne implementovat)

1. **Migrace**: Pole `povolani` by bylo volitelne (string, `|| ""` fallback) na dynamickem objektu NPC. Existujici NPC ho proste nebudou mit. Tudiz migrace NENI nutna — staci renderovat s `n.povolani || ""`.
2. **Docs update**: Pred implementaci pridat `povolani` do datoveho modelu (r. 200-233) a diagramu (r. 253-282).
3. **UI**: Pridat input pole do `SvetTab.jsx` v sekci NPC wiki karty, vedle existujicich poli (popis, lokace, vztah, poznamky).

## Shrnuti

| Krok | Vysledek |
|------|----------|
| Klasifikace | DATA |
| Datovy model | Pole `povolani` neexistuje |
| Diagram | Pole `povolani` neexistuje |
| Cross-check | Docs konzistentni (oba nemaji) |
| Verdikt | **CHYBI V DOCS** |
| Dalsi krok | NotebookLM dotaz → cekat na odpoved |
