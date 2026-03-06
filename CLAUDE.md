# Solo RPG Companion — Claude Code Kontext

## Co to je
Mobilní PWA pro sólové hraní stolních RPG (Mausritter + Mythic GME 2e).
Hráč je zároveň vypravěč — appka simuluje rozhodování GM přes mechaniky Mythic GME.

## Stack
- React + Vite (JSX, ne TypeScript)
- Čistý inline CSS — žádný Tailwind, žádné externí CSS třídy
- IBM Plex Mono font
- Modulární struktura (viz Mapa souborů níže)

## Mapa souborů
```
src/
  App.jsx                        — orchestrace (Prototype, routing, game state)
  constants/
    theme.js                     — C (barvy) + FONT
    tables.js                    — FATE_CHART, ACTIONS, DESCRIPTIONS, SCENE_ADJ, EVENT_FOCUS
    bestiary.js                  — BESTIARY (12 tvorů)
  utils/
    dice.js                      — roll(), checkFate(), checkScene(), rollMeaning(), getEventFocus()
    combat.js                    — resolveDamage(), rollInitiative(), rollMorale()
  store/
    gameStore.js                 — INITIAL_GAME, MIGRATIONS, localStorage CRUD, export/import
  components/
    Lobby.jsx                    — výběr/správa her (multi-save)
    blocks/
      FateBlock.jsx              — inline blok: Fate Question výsledek
      MeaningBlock.jsx           — inline blok: Meaning Tables výsledek
      SceneBlock.jsx             — inline blok: nadpis scény
      TextBlock.jsx              — inline blok: volný text
      CombatBlock.jsx            — inline blok: combat log
      DetailBlock.jsx            — inline blok: detail check
      DiceBlock.jsx              — inline blok: hod kostkou
    sheets/
      FateSheet.jsx              — bottom sheet: Fate Question
      SceneSheet.jsx             — bottom sheet: Nová Scéna
      MeaningSheet.jsx           — bottom sheet: Meaning Tables
      EndSceneSheet.jsx          — bottom sheet: Konec Scény (CF, NPC/Thread CRUD)
      CombatSheet.jsx            — bottom sheet: Boj (bestiář/vlastní, simulace)
      NoteSheet.jsx              — bottom sheet: Poznámka
      DetailCheckSheet.jsx       — bottom sheet: Detail Check
      DiceSheet.jsx              — bottom sheet: Hod kostkou
    tabs/
      PostavaTab.jsx             — tab: character sheet (staty, inventář, pomocník)
      SvetTab.jsx                — tab: Mythic GME (CF, NPC wiki karty, Thread seznamy)
    ui/
      Header.jsx                 — horní lišta (scéna, CF, staty)
      EditorArea.jsx             — deník s inline bloky
      ActionToolbar.jsx          — toolbar akcí (Stav A)
      BottomNav.jsx              — spodní navigace (Deník/Postava/Svět)
      Sheet.jsx                  — base bottom sheet komponenta
```

## Design tokens — VŽDY používej tyto konstanty
```js
const C = {
  bg: "#faf9f6",
  text: "#2a2a2a",
  muted: "#888",
  border: "#e0ddd8",
  green: "#4a7a4a",   // hlavní akcentová barva, Fate Q
  red: "#aa4444",     // boj, nebezpečí
  yellow: "#c89030",  // CF, varování
  purple: "#7a5aaa",  // Meaning tables
  blue: "#8888cc",    // Scéna bloky
};
const FONT = "'IBM Plex Mono', monospace";
```

## Pravidla pro každou změnu

### POVINNÝ CHECKLIST PŘED IMPLEMENTACÍ
1. **Mění se data (NPC, Thread, character, inventář...)?**
   → Přečti `src/docs/datovy-model.jsx` (relevantní entitu)
   → Přidej MIGRACI (`MIGRATIONS` v `src/store/gameStore.js` + zvýšit `CURRENT_VERSION`)
2. **Mění se herní mechanika (boj, scéna, fate, bookkeeping...)?**
   → Přečti `src/docs/solo-rpg-diagram.jsx` (relevantní sekci — viz mapa řádků níže)
3. **Nesedí implementace s diagramem/modelem?**
   → ZASTAV SE a upozorni uživatele
4. Tento checklist platí i pro subagenty (Agent tool) — předej jim ho v promptu.

### Pravidla kódu
- Edituj příslušný soubor podle Mapy souborů (ne vše do App.jsx!)
- Vždy inline CSS, nikdy externí CSS třídy
- Barvy pouze z objektu `C` (`src/constants/theme.js`), font pouze z `FONT`
- Hlavní kontejner má `height: 100dvh` (ne 100vh — kvůli iOS Safari)
- Sheet komponenta: `height: 52%`, pevná, obsah scrollovatelný (`overflow-y: auto`)
- Po změně řekni co jsi udělal (1-2 věty), nic víc

## Architektura — 3 stavy appky

### Stav A — Editor bez klávesnice
Header → Editor → ActionToolbar → BottomNav

### Stav B — Klávesnice otevřená
Header ZMIZÍ · Editor (menší) · MiniToolbar (8 ikon) · BottomNav ZMIZÍ · Klávesnice

### Stav C — Bottom sheet
Header · Editor (max 50% výšky) · ActionToolbar · BottomNav · Sheet (52% výšky)

## Komponenty (viz Mapa souborů výše pro umístění)
- `CombatSheet` — Boj (nepřítel → výsledek)
- `PostavaTab` — character sheet (staty, inventář, pomocník)
- `SvetTab` — Mythic (CF + NPC seznam + Thread seznam) + sub-taby
- `Prototype` — hlavní App, state: tab/sheet/showKeyboard/headerExpanded

## Inline bloky v editoru
- **Fate**: zelený border vlevo `❓ otázka · odds · d100=X → ANO/NE`
- **Meaning**: fialový border vlevo `🔮 Slovo + Slovo`
- **Scene**: modrý border, nadpis sekce s číslem/názvem/typem/CF
- **Detail**: žlutý border vlevo `🔍 Slovo + Slovo`
- **Combat**: červený border vlevo, combat log

## Co je hotovo ✅
1. Projekt vytvořen (Vite + React JSX)
2. src/App.jsx — prototyp se všemi komponentami
3. index.html — viewport meta pro mobil
4. src/index.css — odstraněn max-width, bílá barva textu
5. NPC/Thread jména opravena (color: C.text)
6. Sheet má pevnou height: 52%
7. Repo uklizeno — smazán starý TypeScript projekt
8. Phase 1: Fate Chart, Meaning Tables, Scene Test, reálné hody
9. localStorage multi-save (lobby, export/import)
10. CombatSheet — reálná bojová mechanika Mausritter (bestiář 12 tvorů, iniciativa, morálka, STR save, damage pipeline)
11. game.character — editovatelné STR/DEX/WIL/BO v PostavaTab, propojeno s Header a CombatSheet
12. NoteSheet (📝) — vkládání textu do deníku
13. NPC/Thread CRUD — přidávání/odebírání v EndSceneSheet i SvetTab sub-tabech
14. Random Event UI — ve FateSheet při doubles ≤ CF zobrazí Event Focus + Meaning
15. Combat→Character propojení — boj zapisuje zranění do game.character
16. Inventář — editovatelný grid (10 slotů: Packy/Tělo/Batoh), inline editor, migrace v3→v4
17. Detail Check sheet (🔍) — Actions/Descriptions tabulky, 2×d100, DetailBlock v deníku
18. Pomocník — editovatelný (jméno, role, staty, inventář 6 slotů, mzda, věrnost), migrace v4→v5
19. NPC wiki karty — expandovatelné detaily (popis, lokace, vztah, poznámky, bojové staty, zbraň+dmg, zbroj)
20. Hod kostkou (🎲) — d4 až d100, DiceSheet + DiceBlock v deníku

## Co je potřeba udělat 📋
- [ ] Visual Viewport API — detekce skutečné klávesnice
- [ ] Thread Progress Track (Discovery Check mechanika)
- [ ] Čas a počasí — dynamická správa (den, hlídka, směna)
- [ ] Osady, Frakce, Hexcrawl mapa
- [ ] NPC Behavior Table

## Diagram a datový model — POVINNÁ REFERENCE (viz checklist výše)

Diagram je velký (~1400 řádků). Čti jen sekce relevantní pro aktuální úkol:

### Mapa diagramu (řádky)

**WIKI — entity a data (ř. 23–570)**
- ř. 23–40: Kampáňová Wiki (přehled, propojení entit)
- ř. 41–116: Postava (atributy, inventář, podmínky, leveling, léčení)
- ř. 117–176: Pomocník (Hireling)
- ř. 177–207: NPC (wiki záznam)
- ř. 208–239: Thread / Příběhová linka
- ř. 240–268: NPC Seznam (aktivní mechanický)
- ř. 269–287: Thread Seznam (aktivní mechanický)
- ř. 288–332: Osady / Místa
- ř. 333–378: Frakce
- ř. 379–426: Úkoly / Hooky
- ř. 427–497: Předměty / Vybavení / Kouzla
- ř. 498–537: Chaos Faktor
- ř. 518–537: Deník kampaně (Scény)
- ř. 538–570: Thread Progress Track

**CYKLUS SCÉNY — gameplay flow (ř. 571–758)**
- ř. 573–588: Krok 1 — Očekávání
- ř. 589–612: Krok 2 — Test Chaosu (d10 vs CF)
- ř. 613–628: Krok 3 — Typ Scény
- ř. 629–651: Scene Adjustment Table
- ř. 652–674: Event Focus Table
- ř. 675–695: Krok 4 — Hraní Scény
- ř. 696–709: Krok 5 — Scéna Vyčerpána
- ř. 710–752: Krok 6 — Bookkeeping
- ř. 753–758: Nová Scéna (cyklus)

**NÁSTROJE — panely a mechaniky (ř. 759–901)**
- ř. 761–779: Panel Nástrojů (přehled)
- ř. 780–820: Fate Chart (orákulum, pravděpodobnosti)
- ř. 821–848: Meaning Tables
- ř. 849–870: Detail Check
- ř. 871–886: NPC Behavior Table
- ř. 887–894: Generátory
- ř. 895–901: Hod Kostkou

**DOPLŇKY A META (ř. 902–1080)**
- ř. 904–924: Parametry Scény
- ř. 925–1060: Poznatky ze suchého průchodu (testování, UX)
- ř. 1061–1081: Random Event Flow

**PRAVIDLA MAUSRITTER (ř. 1082–1290)**
- ř. 1084–1162: Boj
- ř. 1163–1215: Čas, Cestování, Počasí
- ř. 1216–1254: Reakce NPC
- ř. 1255–1289: Bestiář

**REACT KOMPONENTY diagramu (ř. 1289+)**
- ř. 1289–1370+: SVG vizualizace (wiki, cyklus, nástroje)

### Mapa datového modelu — `src/docs/datovy-model.jsx` (řádky)

- ř. 6–43: Postava (atributy, inventář, podmínky, kuráž)
- ř. 44–68: Pomocník (hireling)
- ř. 69–112: Předmět (zbraně, zbroje, kouzla, spotřební)
- ř. 113–134: Frakce
- ř. 135–168: Osada (služby, obchody, NPC)
- ř. 169–202: NPC (reakce, vztah, motivace)
- ř. 203–234: Mythic GME (CF, NPC seznam, Thread seznam)
- ř. 235–260: Scéna (typ, chaos test, eventy)
- ř. 261–283: Hexcrawl Mapa
- ř. 284–306: Čas a Počasí
- ř. 307–323: Zvěsti
- ř. 324+: Bojový Stav

## Git commit pravidla
- Formát: `typ(oblast): popis česky`
- Typy: feat, fix, refactor, docs, style, chore
- Oblast = komponenta nebo sekce (fate-chart, postava, wiki, scene, sheet, editor, toolbar...)
- Popis: co a proč, ne jak. Česky, malé písmeno.
- Příklady:
  - `feat(fate-chart): pravděpodobnostní tabulka podle odds × CF`
  - `fix(sheet): oprava overflow scrollování`
  - `refactor(postava): rozdělení inventáře do vlastní komponenty`

## Detailní dokumentace
- `src/docs/pencil-handoff.md` — kompletní UI specifikace
- `src/docs/bottom-sheets-diagram.jsx` — flow všech sheetů
- `src/docs/datovy-model.jsx` — datový model
- `src/docs/CLAUDE_KONTEXT.md` — shrnutí kontextu
