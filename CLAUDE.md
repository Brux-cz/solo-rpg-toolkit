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
  main.jsx                       — Vite entry point
  App.jsx                        — orchestrace (Prototype, routing, game state)
  constants/
    theme.js                     — C (barvy vč. orange) + FONT
    tables.js                    — FATE_DIAG, ODDS_LABELS, ACTIONS, ACTIONS_CZ, DESCRIPTIONS,
                                   DESCRIPTIONS_CZ, SCENE_ADJ, EVENT_FOCUS, THREAD_DISCOVERY,
                                   WEATHER_TABLE, BACKGROUND_TABLE, WEAPON_CHOICES,
                                   BIRTHSIGN, FUR_COLOR, FUR_PATTERN, TRAIT, NAMES, SURNAMES
    bestiary.js                  — BESTIARY (12 tvorů)
    elements.js                  — Mythic GME 2e Elements (45 tabulek)
  utils/
    dice.js                      — roll(), checkFate(), checkScene(), rollMeaning(),
                                   getEventFocus(), rollWeapon(), rollDiscoveryCheck(),
                                   rollWeather(), resolveEventTarget(), rollFromList()
    combat.js                    — resolveDamage(), rollInitiative(), rollMorale(),
                                   assessDanger(), rollMoraleAdvantage()
    reroll.js                    — reverse mapa odds pro reroll ve FateSheet
  store/
    migrations.js                — INITIAL_GAME, MIGRATIONS, applyMigrations() (CURRENT_VERSION = 10)
    gameStore.js                 — localStorage CRUD, export/import (importuje z migrations.js)
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
      BehaviorBlock.jsx          — inline blok: NPC behavior (oranžový border)
      EndSceneBlock.jsx          — inline blok: konec scény (gradient border)
      DiscoveryBlock.jsx         — inline blok: discovery check výsledek
    sheets/
      FateSheet.jsx              — bottom sheet: Fate Question
      SceneSheet.jsx             — bottom sheet: Nová Scéna
      MeaningSheet.jsx           — bottom sheet: Meaning Tables
      EndSceneSheet.jsx          — bottom sheet: Konec Scény (CF, NPC/Thread CRUD)
      CombatSheet.jsx            — bottom sheet: Boj (bestiář/vlastní, simulace)
      NoteSheet.jsx              — bottom sheet: Poznámka
      DetailCheckSheet.jsx       — bottom sheet: Detail Check
      DiceSheet.jsx              — bottom sheet: Hod kostkou
      DiscoveryCheckSheet.jsx    — bottom sheet: Discovery Check (Thread Progress)
      CharCreateSheet.jsx        — bottom sheet: Tvorba postavy (5-krokový wizard)
      BehaviorSheet.jsx          — bottom sheet: NPC Behavior Table
      RestSheet.jsx              — bottom sheet: Odpočinek (jídlo, léčení)
    tabs/
      PostavaTab.jsx             — tab: character sheet (staty, inventář, pomocník)
      SvetTab.jsx                — tab: Mythic GME (CF, NPC wiki karty, Thread seznamy)
    ui/
      Header.jsx                 — horní lišta (scéna, CF, staty)
      EditorArea.jsx             — deník s inline bloky
      ActionToolbar.jsx          — toolbar akcí (Stav A)
      BottomNav.jsx              — spodní navigace (Deník/Postava/Svět)
      Sheet.jsx                  — base bottom sheet komponenta
      SwipeableBlock.jsx         — swipe gesto na blocích (reroll/smazat)
      TimeTracker.jsx            — tracker času a počasí
      ErrorBoundary.jsx          — zachytí crash komponent (zobrazí chybu místo bílé obrazovky)
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
  orange: "#cc7a30",  // NPC Behavior
};
const FONT = "'IBM Plex Mono', monospace";
```

## Pravidla pro každou změnu

### POVINNÝ CHECKLIST PŘED IMPLEMENTACÍ
1. **Mění se data (NPC, Thread, character, inventář...)?**
   → Přečti `src/docs/datovy-model.jsx` (relevantní entitu)
   → Přidej MIGRACI (`MIGRATIONS` v `src/store/migrations.js` + zvýšit `CURRENT_VERSION`)
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

## Datový tok aplikace

```
Uživatel (dotyk)
    ↓
UI komponenty (sheety, taby, bloky)
    ↓ callbacky (onInsert, onChange, onUpdate)
App.jsx — Prototype()
    │
    │  game = { cf, sceneNum, entries[], npcs[], threads[],
    │           keyedScenes[], perilPoints, character{}, cas{} }
    │
    │  updateGame(patch) → setGame(g => ({...g, ...patch}))
    │  handleInsert(entry) → entries.push(entry)
    │
    ↓ useEffect [game] — auto-save
gameStore.js → localStorage ("solorpg_index" + "solorpg_<id>")
```

- **Jednosměrný tok**: State → Props → Callbacky → updateGame → re-render
- **Jediný zdroj pravdy**: `game` objekt v App.jsx
- **Migrace**: `src/store/migrations.js` (sdílené mezi gameStore.js a agent/state.js)
- **ErrorBoundary**: obaluje celou herní UI (zachytí crash komponent)
- **Žádný Context/Redux** — vše přes props z App.jsx

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
- `Prototype` — hlavní App, state: tab/sheet/headerExpanded

## Inline bloky v editoru
- **Fate**: zelený border vlevo `❓ otázka · odds · d100=X → ANO/NE`
- **Meaning**: fialový border vlevo `🔮 Slovo + Slovo`
- **Scene**: modrý border, nadpis sekce s číslem/názvem/typem/CF
- **Detail**: žlutý border vlevo `🔍 Slovo + Slovo`
- **Combat**: červený border vlevo, combat log
- **Behavior**: oranžový border vlevo, NPC jméno + slova
- **EndScene**: gradient border (červená→modrá), číslo scény + CF změna
- **Discovery**: barva dle typu (zelená/červená/žlutá/fialová), typ + slova

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
21. Čas a počasí — TimeTracker (den, hlídka, sezóna), WEATHER_TABLE, rollWeather, migrace v9→v10
22. NPC Behavior Table — BehaviorSheet (6 kontextů) + BehaviorBlock v deníku
23. Discovery Check — DiscoveryCheckSheet (4 typy: Progress/Flashpoint/Track/Strengthen) + DiscoveryBlock
24. Tvorba postavy — CharCreateSheet (5-krokový wizard, tabulka původů, generátory)
25. Odpočinek — RestSheet (jídlo ze zásob, léčení)
26. SwipeableBlock — swipe gesto na blocích (reroll/smazat)
27. EndSceneBlock — inline blok konce scény (gradient border, CF změna)
28. Reroll mechanika — reroll.js, swipe na blocích
29. Danger Assessment — assessDanger() v combat.js
30. Mythic 2e Elements — elements.js (45 tabulek)
31. České překlady — ACTIONS_CZ, DESCRIPTIONS_CZ v tables.js
32. ErrorBoundary — zachytí crash komponent
33. Migrace sjednoceny do migrations.js (sdílené gameStore + agent)

## Co je potřeba udělat 📋
- [ ] Visual Viewport API — detekce skutečné klávesnice
- [ ] Osady, Frakce, Hexcrawl mapa

## Diagram a datový model — POVINNÁ REFERENCE (viz checklist výše)

Diagram je velký (~1790 řádků). Čti jen sekce relevantní pro aktuální úkol.
Rozsahy skupin mají přesah ~5 řádků, aby se nic neztratilo na hranicích.

### Mapa diagramu (řádky) — `src/docs/solo-rpg-diagram.jsx`

**WIKI — entity a data (čti ř. 1–680)**
- ř. 4–21: _intro — Kompletní přehled (3 vrstvy appky)
- ř. 24–39: wiki_bg — Kampáňová Wiki (pasivní entity vs aktivní seznamy)
- ř. 40–117: postava — Postava (atributy, inventář, podmínky, leveling, léčení)
- ř. 118–193: tvorba_postavy — Tvorba postavy (5 kroků, tabulka původů 6×6, zbraně, vzhled)
- ř. 195–260: pomocnik — Pomocník (Hireling)
- ř. 262–293: npc — NPC (wiki záznam)
- ř. 294–325: thread — Thread / Příběhová linka
- ř. 326–354: npc_seznam — NPC Seznam (aktivní mechanický)
- ř. 355–372: thread_seznam — Thread Seznam (aktivní mechanický)
- ř. 374–418: osady — Osady / Místa
- ř. 419–463: frakce — Frakce
- ř. 465–512: ukoly — Úkoly / Hooky / Dobrodružná místa
- ř. 513–583: predmety — Předměty / Vybavení / Kouzla
- ř. 584–602: chaos_val — Chaos Faktor (CF)
- ř. 604–622: denik — Deník kampaně (Scény)
- ř. 624–678: progress_track — Thread Progress Track

**CYKLUS SCÉNY — gameplay flow (čti ř. 675–870)**
- ř. 681–695: ocekavani — Krok 1: Očekávání
- ř. 697–719: test_chaosu — Krok 2: Test Chaosu (d10 vs CF)
- ř. 721–735: typ_sceny_bg — Krok 3: Typ Scény (tři cesty)
- ř. 737–758: scene_adj — Scene Adjustment Table (d10)
- ř. 760–781: event_focus — Event Focus Table (d100)
- ř. 783–802: hrani — Krok 4: Hraní Scény
- ř. 804–816: ukonceni — Krok 5: Scéna Vyčerpána
- ř. 818–859: bookkeeping_bg — Krok 6: Bookkeeping
- ř. 861–865: zpet — Nová Scéna (cyklus)

**NÁSTROJE — panely a mechaniky (čti ř. 865–1025)**
- ř. 869–886: nastroje_bg — Panel Nástrojů (přehled)
- ř. 888–940: t_fate — Fate Chart (orákulum, pravděpodobnosti)
- ř. 942–968: t_meaning — Meaning Tables
- ř. 970–990: t_detail — Detail Check
- ř. 992–1006: t_npc_behav — NPC Behavior Table
- ř. 1008–1014: t_gen — Generátory
- ř. 1016–1021: t_kostky — Hod Kostkou

**DOPLŇKY A META (čti ř. 1020–1207)**
- ř. 1025–1034: param_bg — Parametry Scény
- ř. 1036–1044: meritko — Měřítko (mentální přepínač architekt/průzkumník)
- ř. 1046–1180: poznatky_test — Poznatky ze suchého průchodu (testování, UX)
- ř. 1182–1201: random_event_flow — Random Event Flow

**PRAVIDLA MAUSRITTER (čti ř. 1200–1412)**
- ř. 1205–1282: boj — Boj (iniciativa, akce, damage pipeline, morálka, útěk)
- ř. 1284–1335: cas_cestovani — Čas, Cestování, Počasí
- ř. 1337–1375: reakce_npc — Reakce NPC (2d6)
- ř. 1376–1407: bestiar — Bestiář (tvorové se staty)
- ř. 1408: konec DESCRIPTIONS objektu

**REACT KOMPONENTY diagramu (čti ř. 1408–1790)**
- ř. 1410–1488: NODES — SVG diagram node definice
- ř. 1490–1502: EDGES — SVG diagram propojení
- ř. 1504–1568: EdgePath/ArrowHead — renderování šipek
- ř. 1599–1654: NodeBox — renderování uzlů
- ř. 1656–1683: InfoPanel — detail panel
- ř. 1689–1790: SoloRPGDiagram — hlavní komponenta (pan/zoom, touch)

### Mapa datového modelu — `src/docs/datovy-model.jsx` (799 řádků)

**Entity (čti ř. 1–470)**
- ř. 5–42: Postava (atributy, inventář, podmínky, kuráž)
- ř. 44–74: Tvorba postavy (5 kroků, tabulky, zbraně, vzhled)
- ř. 76–99: Pomocník (hireling)
- ř. 101–145: Předmět (zbraně, zbroje, kouzla, spotřební)
- ř. 147–167: Frakce
- ř. 169–201: Osada (služby, obchody, NPC)
- ř. 203–271: NPC (reakce, vztah, motivace, + Mythic GME stav)
- ř. 273–297: Scéna (typ, chaos test, eventy)
- ř. 299–320: Hexcrawl Mapa
- ř. 322–343: Čas a Počasí
- ř. 345–360: Zvěsti
- ř. 362–469: Bojový Stav

**Vizualizace (čti ř. 470–799)**
- ř. 471+: Relationships array + React komponenty

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
