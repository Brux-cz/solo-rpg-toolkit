# Kroky pred implementaci: pole `reakce` u NPC v SvetTab

## 1. Kontrola checklistu z CLAUDE.md

Zadani meni data (NPC entita) => POVINNE precist datovy model a diagram.

## 2. Cteni referencnich dokumentu

### a) Datovy model (`src/docs/datovy-model.jsx`, r. 200-233 — entita NPC)

**Zjisteni:** Pole `reakce` uz v datovem modelu EXISTUJE.

```
{ name: "reakce", type: "{hod, stav}", note: "2d6 → stav: 2=Agresivni, 3-5=Nepratelsky, 6-8=Opatrny, 9-11=Povidavy, 12=Napomocny" }
```

Model presne definuje:
- Typ: objekt `{hod, stav}`
- `hod` — vysledek 2d6
- `stav` — textovy stav odvozeny z hodu podle tabulky: 2=Agresivni, 3-5=Nepratelsky, 6-8=Opatrny, 9-11=Povidavy, 12=Napomocny

### b) Diagram (`src/docs/solo-rpg-diagram.jsx`, r. 253-274 — NPC wiki zaznam)

**Zjisteni:** Diagram potvrzuje totez:

```
• Reakce (z 2d6 tabulky): agresivni → napomocna
```

### c) Diagram — Reakce NPC (`src/docs/solo-rpg-diagram.jsx`, r. 1216-1270)

Sekce "Reakce NPC" v diagramu (r. 871-886 dle mapy) by mela obsahovat podrobnosti o NPC Behavior Table. Tato sekce zatim neni implementovana (je v TODO).

## 3. Kontrola soucasneho stavu kodu

### a) `gameStore.js` — datova vrstva

NPC se ukladaji jako polozky pole `game.npcs`. Aktualni tvar NPC v kodu:
```js
{ name, weight, flag, popis?, lokace?, vztah?, poznamky?, str?, dex?, wil?, bo?, zbran?, dmg?, zbroj?, predmetyUSebe? }
```

**Zjisteni:** Pole `reakce` v datech CHYBI. Je definovane v referencnim modelu, ale nebylo dosud implementovano.

### b) `SvetTab.jsx` — UI vrstva

NPC wiki karta (expandovany detail) obsahuje: popis, lokace, vztah (select), poznamky, bojove staty, zbran/dmg/zbroj, predmety u sebe. Pole `reakce` v UI CHYBI.

## 4. Plan implementace (kroky, ktere bych provedl)

### Krok 1 — Migrace dat (gameStore.js)
- Pridat MIGRACI `6` (CURRENT_VERSION zvysit na 7)
- Migrace projde `data.npcs` a kazdemu NPC prida `reakce: null` (nebo ponecha undefined)
- Tvar pole: `{ hod: number|null, stav: string }` podle datoveho modelu

### Krok 2 — Reakcni tabulka (utils nebo constants)
- Pridat helper funkci `getReakce(hod)` ktera z vysledku 2d6 vrati textovy stav:
  - 2 => "Agresivni"
  - 3-5 => "Nepratelsky"
  - 6-8 => "Opatrny"
  - 9-11 => "Povidavy"
  - 12 => "Napomocny"
- Umisteni: `src/utils/dice.js` (tam uz jsou roll funkce) nebo `src/constants/tables.js`

### Krok 3 — UI v SvetTab.jsx
- Do NPC wiki karty (expandovany detail) pridat sekci "Reakce" s:
  - Tlacitkem "Hodit 2d6" ktere vygeneruje hod a automaticky nastavi stav
  - Zobrazenym vysledkem: "hod X => Stav"
  - Moznosti rucne prepsat stav (select s 5 hodnotami)
- Barva podle stavu (Agresivni=cervena, Nepratelsky=cervena slabsi, Opatrny=zluta, Povidavy=zelena slabsi, Napomocny=zelena)
- Pouzit inline CSS, barvy z objektu C

### Krok 4 — Propojeni
- `updateNpc(idx, { reakce: { hod, stav } })` — pouzit existujici `updateNpc` helper
- Data se automaticky ulozi pres localStorage (uz funguje)

## 5. Kriticke kontroly pred kodovanim

| Kontrola | Vysledek |
|---|---|
| Pole existuje v datovem modelu? | ANO — `{hod, stav}` na r. 214 |
| Pole existuje v diagramu? | ANO — r. 263 |
| Sedi typ s modelem? | Implementovat jako `{hod: number, stav: string}` |
| Je potreba migrace? | ANO — stare NPC zaznamy pole nemaji |
| Nesedi neco s modelem/diagramem? | NE — implementace muze pokracovat |
| Koliduje s existujicim polem `vztah`? | NE — `vztah` je subjektivni hodnoceni hrace, `reakce` je vysledek mechanickeho hodu 2d6 |

## 6. Soubory ktere by se menily

1. `/home/brux/projekty/solo-rpg-toolkit/src/store/gameStore.js` — migrace 6->7, CURRENT_VERSION=7
2. `/home/brux/projekty/solo-rpg-toolkit/src/components/tabs/SvetTab.jsx` — UI pro reakci v NPC karte
3. `/home/brux/projekty/solo-rpg-toolkit/src/utils/dice.js` (nebo `constants/tables.js`) — helper pro prevod 2d6 na stav
