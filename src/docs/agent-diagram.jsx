import { useState, useRef, useEffect } from "react";

const DESCRIPTIONS = {
  _intro: {
    title: "Agent Modul — Přehled",
    text: `Headless agent pro autonomní hraní Solo RPG bez browseru.

Agent běží z Claude Code terminálu. Místo klikání na UI volá přímo herní funkce (dice.js, combat.js, tables.js) přes Node.js. Výstup je JSON soubor kompatibilní s appkou — importuješ ho přes Lobby a vidíš celý příběh v deníku.

DVĚ CESTY, STEJNÁ PRAVIDLA:
1. APPKA (React) — hráč kliká, UI volá funkce, stav v localStorage
2. AGENT (Node.js) — Claude volá funkce přímo, stav v JSON souboru

Obě cesty sdílejí stejné utils/ a constants/ — jeden zdroj pravdy pro pravidla.

PROČ TO EXISTUJE:
Při testování play skillu (Playwright) se ukázalo, že agent dokáže kreativně hrát a odhalovat bugy v pravidlech. Ale Playwright je pomalý — spouští browser, kliká na tlačítka, čte DOM. Agent modul to obchází — volá funkce přímo, žádný browser, žádné čekání.`,
  },

  // === SDÍLENÉ JÁDRO ===
  shared_bg: {
    title: "Sdílené jádro — jeden zdroj pravdy",
    text: `Herní logika žije v src/utils/ a src/constants/. Obě cesty (appka i agent) importují stejné funkce.

UTILS (herní mechaniky):
• dice.js — roll(), checkFate(), checkScene(), rollMeaning(), getEventFocus(), rollWeapon(), rollDiscoveryCheck(), rollWeather(), resolveEventTarget(), rollFromList()
• combat.js — resolveDamage(), rollInitiative(), rollMorale(), assessDanger(), rollMoraleAdvantage()
• reroll.js — reverse mapa odds pro reroll

CONSTANTS (data a tabulky):
• tables.js — FATE_DIAG, ODDS_LABELS, ACTIONS, DESCRIPTIONS, SCENE_ADJ, EVENT_FOCUS, THREAD_DISCOVERY, WEATHER_TABLE, BACKGROUND_TABLE, WEAPON_CHOICES, BIRTHSIGN, FUR_COLOR, FUR_PATTERN, TRAIT, NAMES, SURNAMES
• bestiary.js — BESTIARY (12 tvorů se staty)
• elements.js — Mythic GME 2e Elements (45 tabulek)
• theme.js — C (barvy), FONT (jen pro UI)

PRAVIDLO: Když opravíš bug v roll() nebo přidáš tvora do BESTIARY, obě cesty to automaticky vidí. Žádná duplikace.`,
  },

  dice: {
    title: "dice.js — hody a orákulum",
    text: `Všechny náhodné mechaniky na jednom místě.

ZÁKLADNÍ HODY:
• roll(sides) — náhodné číslo 1-N
• rollFromList(list) — náhodný prvek z pole

MYTHIC GME:
• checkFate(odds, cf) — Fate Chart: d100 vs threshold → { answer, exceptional, randomEvent, roll, threshold }
• checkScene(cf) — Scene Test: d10 vs CF → { type, roll, adjustment?, eventFocus?, meaning? }
• rollMeaning(table) — 2×d100, lookup v tabulce → { word1, word2, rolls }
• getEventFocus() — d100 → Event Focus string
• rollDiscoveryCheck(type) — Discovery Check → { words, type, rolls }

MAUSRITTER:
• rollWeather(season) — d6 → počasí pro sezónu
• rollWeapon() — d6 → startovní zbraň
• resolveEventTarget(npcList, threadList) — vybere cíl random eventu z NPC/Thread seznamů`,
  },

  combat: {
    title: "combat.js — bojový systém",
    text: `Kompletní Mausritter combat pipeline.

FUNKCE:
• rollInitiative(playerDex) — d20 vs DEX → kdo začíná
• resolveDamage(attacker, defender) — d(weapon) - armor → damage na BO, pak STR save
• rollMorale(enemyWil) — 2d6 vs WIL → utíká/bojuje dál
• rollMoraleAdvantage() — modifikátor morálky
• assessDanger(player, enemies) — odhad nebezpečí boje

DAMAGE PIPELINE (z diagramu):
1. Útočník hodí d(zbraň)
2. Odečti zbroj obránce
3. Zbytek jde z BO
4. BO = 0 → přebytek jde ze STR
5. STR damage → STR save (d20 ≤ aktuální STR)
6. Fail → Kritické poranění / smrt (STR = 0)`,
  },

  tables: {
    title: "tables.js + bestiary.js + elements.js",
    text: `Datové tabulky — konstanty, žádná logika.

FATE CHART:
• FATE_DIAG — 2D pole [odds][cf] → threshold pro d100
• ODDS_LABELS — názvy pravděpodobností

MEANING TABLES:
• ACTIONS / ACTIONS_CZ — 100 slov (akce)
• DESCRIPTIONS / DESCRIPTIONS_CZ — 100 slov (popisy)
• Elements — 45 kontextových tabulek (Mythic 2e)

SCENE:
• SCENE_ADJ — Scene Adjustment Table (d10)
• EVENT_FOCUS — Event Focus Table (d100)

MAUSRITTER:
• BESTIARY — 12 tvorů { name, str, dex, wil, bo, weapon, damage, armor, crit }
• WEATHER_TABLE — počasí dle sezóny
• BACKGROUND_TABLE — tabulka původů 6×6
• WEAPON_CHOICES, BIRTHSIGN, FUR_COLOR, FUR_PATTERN, TRAIT, NAMES, SURNAMES`,
  },

  // === AGENT VRSTVA ===
  agent_bg: {
    title: "Agent vrstva — src/agent/",
    text: `Nový kód specifický pro headless hraní. Tři moduly:

1. engine.js — GameEngine třída
Načte/uloží JSON game state. Obaluje sdílené utils/ do jednoduchého API:
• engine.fate(question, odds) → volá checkFate, zapíše do deníku
• engine.meaning(table) → volá rollMeaning, zapíše do deníku
• engine.startScene(expectation) → volá checkScene, zapíše do deníku
• engine.endScene(control) → CF ±1, bookkeeping
• engine.combat(enemies, modifiers) → celý boj, zapíše do deníku
• engine.note(text) → volný text do deníku
• engine.rest(type) → odpočinek, léčení

2. state.js — load/save game state
• loadGame(path) → načte JSON, aplikuje migrace
• saveGame(path, state) → uloží JSON
• newGame(name) → vytvoří INITIAL_GAME

3. cli.js — entry point
• npm run agent — spustí REPL nebo příkaz
• Parsuje argumenty, volá engine
• Výstup na konzoli (narativ + mechaniky)

KLÍČOVÉ: engine.js NEOBSAHUJE herní pravidla — jen volá dice.js a combat.js. Pravidla žijí ve sdíleném jádru.`,
  },

  engine: {
    title: "engine.js — GameEngine",
    text: `Hlavní API pro agenta. Obaluje sdílené funkce do metod, které automaticky zapisují výsledky do game state (entries pole).

Každá metoda:
1. Zavolá sdílenou funkci (roll, checkFate, resolveDamage...)
2. Vytvoří entry objekt (stejný formát jako appka)
3. Přidá entry do game.entries[]
4. Vrátí výsledek (agent ho přečte a pokračuje v narativu)

FORMÁT ENTRIES (kompatibilní s appkou):
• { type: "fate", question, odds, roll, threshold, answer, ... }
• { type: "meaning", table, word1, word2, ... }
• { type: "scene", number, name, sceneType, cf, ... }
• { type: "combat", enemies, log, ... }
• { type: "text", content }
• { type: "endScene", number, cfChange, ... }

Agent volá engine metody, engine zapisuje do state, na konci saveGame() uloží JSON. Import do appky → celý příběh v deníku.`,
  },

  state: {
    title: "state.js — load/save JSON",
    text: `Správa game state souboru.

LOAD:
• Načte JSON soubor (stejný formát jako appka exportuje)
• Aplikuje MIGRATIONS chain z gameStore.js
• Vrátí game objekt

SAVE:
• Serializuje game objekt do JSON
• Uloží do souboru (src/agent/saves/)

NEW:
• Vytvoří INITIAL_GAME z gameStore.js
• Nastaví jméno kampaně

FORMÁT SOUBORU:
{ exportVersion: 1, name: "Moje hra", game: { version: 10, character: {...}, entries: [...], ... } }

Stejný formát jako export z Lobby → plně kompatibilní oběma směry.`,
  },

  cli: {
    title: "cli.js — vstupní bod",
    text: `Node.js skript spustitelný z terminálu.

POUŽITÍ:
Agent (Claude Code) volá přes Bash tool:
• node src/agent/cli.js new "Moje hra" — vytvoří novou hru
• node src/agent/cli.js load saves/moje-hra.json — načte existující
• node src/agent/cli.js fate "Je tu stráž?" likely — hodí Fate
• node src/agent/cli.js scene "Vstup do jeskyně" — nová scéna
• node src/agent/cli.js combat rat — boj s krysou
• node src/agent/cli.js save — uloží stav

CLI vrací JSON na stdout → agent ho parsuje a pokračuje.

ALTERNATIVA: Agent může taky importovat engine.js přímo přes node -e "..." pro jednorázové příkazy.`,
  },

  // === CLAUDE CODE ===
  claude_code: {
    title: "Claude Code — orchestrátor",
    text: `Claude Code (tento terminál) řídí celé hraní.

ROLE:
1. VYPRAVĚČ — píše narativ, popisuje scény, NPC dialogy
2. ORCHESTRÁTOR — volá engine metody ve správném pořadí (cyklus scény)
3. INTERPRET — čte výsledky hodů a interpretuje je v kontextu příběhu
4. PRAVIDLÁŘ — konzultuje solo-rpg-diagram.jsx pro správnou aplikaci pravidel

FLOW:
Uživatel řekne "hraj" → play skill se aktivuje → agent:
1. Načte save (nebo vytvoří novou hru)
2. Popíše očekávání scény
3. Zavolá engine.startScene() → přečte typ
4. Hraje scénu — volá fate/meaning/combat podle potřeby
5. Zavolá engine.endScene() → bookkeeping
6. Uloží save
7. Opakuje nebo čeká na pokyn

Kontext celého příběhu zůstává v Claude Code konverzaci.`,
  },

  play_skill: {
    title: "Play Skill — herní smyčka",
    text: `Existující skill (.claude/skills/play/SKILL.md) upravený pro agent modul.

SOUČASNĚ (Playwright):
• Otevře browser → kliká na tlačítka → čte DOM snapshoty
• Pomalé, křehké, závislé na UI

NOVĚ (Agent modul):
• Volá node src/agent/cli.js příkazy
• Čte JSON výsledky
• Žádný browser, žádný DOM

CO SE NEMĚNÍ:
• Filosofie: Think → Play → Check rules
• Safety Check po každé scéně
• Survival mindset (boj je smrtelný)
• Pravidla vždy z diagramu, nikdy z paměti
• Kreativní narativ

CO SE MĚNÍ:
• Místo Playwright příkazů → Bash(node cli.js ...)
• Místo DOM snapshotů → JSON výsledky
• Rychlejší, spolehlivější, jednodušší`,
  },

  // === UŽIVATEL ===
  user: {
    title: "Uživatel — režisér",
    text: `Ty sedíš v Claude Code terminálu a řídíš agenta.

CO DĚLÁŠ:
• Řekneš "hraj" → agent začne hrát
• Řekneš "hraj 3 scény" → agent odehraje 3 scény
• Řekneš "zastav" → agent dokončí scénu a zastaví
• Řekneš "vrať se do jeskyně" → agent přizpůsobí narativ
• Řekneš "importuj do appky" → dostaneš JSON pro Lobby

CO NEDĚLÁŠ:
• Neklikáš v browseru
• Nestaráš se o mechaniky (agent to řeší)
• Nemusíš znát pravidla (agent je konzultuje)

VÝSTUP:
Na konci máš JSON soubor s celým příběhem. Importuješ do appky → vidíš v deníku na telefonu. Jako bys to hrál sám, ale agent to odehrál za tebe.`,
  },

  // === APPKA ===
  appka: {
    title: "React Appka — vizualizace",
    text: `Stávající PWA zůstává beze změny. Slouží k prohlížení příběhu, který agent odehrál.

ROLE V KONTEXTU AGENTA:
• Zobrazení agentova příběhu v deníku
• Ruční hraní (jako dosud)
• Appka NEVÍ jestli hru hrál člověk nebo agent — formát dat je identický`,
  },

  import_flow: {
    title: "Import do appky — ruční (zatím)",
    text: `Zatím ruční import přes Lobby. Automatický import možná později.

CO UDĚLÁŠ (na telefonu nebo v prohlížeči):

1. Otevři appku
2. Klikni na spodní lištu → 🗺️ Svět
3. Scrolluj dolů → klikni „Správa her"
4. Jsi v Lobby — klikni „Importovat"
5. Vyber JSON soubor (src/agent/saves/xxx.json)
6. Hra se objeví v seznamu → klikni „Hrát"

CO UVIDÍŠ V DENÍKU:
• 🎬 Scéna bloky (modrý border) — název, typ, CF
• ❓ Fate bloky (zelený border) — otázka, odds, ANO/NE
• 🔮 Meaning bloky (fialový border) — dvě slova + překlad
• ⚔️ Combat bloky (červený border) — nepřítel, log kolo po kole
• 📝 Text bloky — narativ co agent napsal
• 📕 EndScene bloky (gradient border) — CF změna

OSTATNÍ TABY:
• 🐭 Postava — staty postavy (STR/DEX/WIL/BO), inventář, ďobky
• 🗺️ Svět → Mythic — CF, NPC seznam s vahami, Thread seznam
• 🗺️ Svět → NPC — wiki karty NPC (popis, lokace, vztah)
• 🗺️ Svět → Thready — příběhové linky s progressem

Všechno je identické jako kdyby hru hrál člověk ručně.`,
  },

  // === GAME STATE ===
  game_state: {
    title: "Game State — sdílený formát",
    text: `Jeden formát dat pro obě cesty.

STRUKTURA (gameStore.js → INITIAL_GAME):
{
  version: 10,
  character: { jmeno, prijmeni, puvod, uroven, zk, str, dex, wil, bo, dobky, ... },
  entries: [ { type, ... }, ... ],
  cf: 5,
  sceneNumber: 1,
  npcList: [ { name, weight }, ... ],
  threadList: [ { name, weight }, ... ],
  npcs: [ { name, popis, lokace, vztah, ... }, ... ],
  threads: [ { name, popis, progress, ... }, ... ],
  time: { den, hlidka, sezona },
  perilPoints: { aktualni, max },
  ...
}

MIGRACE:
gameStore.js obsahuje MIGRATIONS chain (v1→v2→...→v10). Agent modul používá stejný chain — loadGame() aplikuje migrace automaticky.

ENTRIES = DENÍK:
Pole objektů, každý je jeden blok v deníku. Appka je renderuje jako FateBlock, MeaningBlock, SceneBlock atd. Agent je vytváří se stejnými klíči.`,
  },
};

const NODES = [
  // === UŽIVATEL ===
  { id: "user", x: 520, y: 20, w: 200, h: 40, type: "player", label: "👤 UŽIVATEL\nClaude Code terminál" },

  // === CLAUDE CODE ===
  { id: "claude_code", x: 460, y: 100, w: 320, h: 50, type: "cycle_active", label: "🤖 CLAUDE CODE (orchestrátor)\nplay skill · narativ · pravidla · kontext" },

  // === AGENT VRSTVA ===
  { id: "agent_bg", x: 420, y: 200, w: 400, h: 200, type: "group", label: "AGENT VRSTVA (src/agent/)" },

  { id: "cli", x: 440, y: 230, w: 160, h: 36, type: "core", label: "⌨️ cli.js\nnode src/agent/cli.js ..." },
  { id: "engine", x: 640, y: 230, w: 160, h: 36, type: "core", label: "⚙️ engine.js\nGameEngine API" },

  { id: "state", x: 440, y: 300, w: 160, h: 36, type: "core", label: "💾 state.js\nload / save JSON" },
  { id: "game_state", x: 640, y: 300, w: 160, h: 36, type: "core_highlight", label: "📦 GAME STATE\n{ entries, cf, character... }" },

  { id: "play_skill", x: 440, y: 360, w: 160, h: 24, type: "sublabel", label: "engine NEOBSAHUJE pravidla" },
  { id: "engine_note", x: 640, y: 360, w: 160, h: 24, type: "sublabel", label: "jen volá sdílené funkce ↓" },

  // === SDÍLENÉ JÁDRO ===
  { id: "shared_bg", x: 280, y: 440, w: 680, h: 140, type: "group", label: "SDÍLENÉ JÁDRO (utils/ + constants/)" },

  { id: "shared_label", x: 300, y: 468, w: 300, h: 14, type: "sublabel", label: "── herní mechaniky (utils/) ──" },
  { id: "dice", x: 300, y: 486, w: 200, h: 36, type: "tool_primary", label: "🎲 dice.js\nroll · checkFate · checkScene" },
  { id: "combat", x: 520, y: 486, w: 200, h: 36, type: "tool_primary", label: "⚔️ combat.js\ndamage · iniciativa · morálka" },
  { id: "reroll", x: 740, y: 486, w: 200, h: 36, type: "tool", label: "🔄 reroll.js\nreverse odds mapa" },

  { id: "const_label", x: 300, y: 530, w: 300, h: 14, type: "sublabel", label: "── data a tabulky (constants/) ──" },
  { id: "tables", x: 300, y: 548, w: 200, h: 24, type: "tool", label: "📋 tables.js · FATE_DIAG · tabulky" },
  { id: "bestiary", x: 520, y: 548, w: 200, h: 24, type: "tool", label: "🐍 bestiary.js · 12 tvorů" },
  { id: "elements", x: 740, y: 548, w: 200, h: 24, type: "tool", label: "🔮 elements.js · 45 tabulek" },

  // === APPKA ===
  { id: "appka", x: 40, y: 200, w: 200, h: 180, type: "group", label: "REACT APPKA (stávající)" },

  { id: "ui_sheets", x: 60, y: 230, w: 160, h: 30, type: "tool", label: "📱 Sheety + Bloky\nUI komponenty" },
  { id: "ui_tabs", x: 60, y: 268, w: 160, h: 30, type: "tool", label: "📑 Taby\nDeník · Postava · Svět" },
  { id: "ui_store", x: 60, y: 306, w: 160, h: 30, type: "core", label: "💾 gameStore.js\nlocalStorage · migrace" },
  { id: "ui_note", x: 60, y: 344, w: 160, h: 24, type: "sublabel", label: "beze změny · jen vizualizace" },

  // === SAVES ===
  { id: "saves", x: 440, y: 620, w: 360, h: 40, type: "core_progress", label: "📁 src/agent/saves/\nJSON soubory · import/export do appky" },

  // === IMPORT DO APPKY ===
  { id: "import_flow", x: 40, y: 440, w: 200, h: 80, type: "cycle_write", label: "📲 IMPORT DO APPKY (ruční)\n1. Svět → Správa her\n2. Importovat → vyber JSON\n3. Hrát → deník s příběhem" },

  // === FLOW ANOTACE ===
  { id: "flow_note", x: 40, y: 620, w: 250, h: 60, type: "note_alert", label: "📖 CO UVIDÍŠ V DENÍKU\n🎬 Scény · ❓ Fate · 🔮 Meaning\n⚔️ Boje · 📝 Narativ · 📕 Konec\n+ Postava + NPC + Thready" },

  // === DIAGRAM REFERENCE ===
  { id: "diagram_ref", x: 850, y: 100, w: 200, h: 50, type: "note", label: "📐 solo-rpg-diagram.jsx\nagent konzultuje pravidla\npři hraní (read-only)" },
];

const EDGES = [
  // Uživatel → Claude Code
  { from: "user", to: "claude_code", fromSide: "bottom", toSide: "top", style: "solid" },

  // Claude Code → Agent vrstva
  { from: "claude_code", to: "cli", fromSide: "bottom", toSide: "top", style: "solid" },

  // CLI → Engine
  { from: "cli", to: "engine", fromSide: "right", toSide: "left", style: "solid" },

  // Engine → State
  { from: "engine", to: "game_state", fromSide: "bottom", toSide: "top", style: "solid" },

  // State → Game State
  { from: "state", to: "game_state", fromSide: "right", toSide: "left", style: "solid" },

  // Engine → Sdílené jádro
  { from: "engine", to: "dice", fromSide: "bottom", toSide: "top", style: "solid" },
  { from: "engine", to: "combat", fromSide: "bottom", toSide: "top", style: "solid" },

  // Appka → Sdílené jádro
  { from: "ui_store", to: "dice", fromSide: "bottom", toSide: "left", style: "dashed" },

  // State → Saves
  { from: "state", to: "saves", fromSide: "bottom", toSide: "top", style: "solid" },

  // Saves → Import flow → Appka
  { from: "saves", to: "import_flow", fromSide: "left", toSide: "bottom", style: "solid" },
  { from: "import_flow", to: "appka", fromSide: "top", toSide: "bottom", style: "solid" },

  // Claude Code → Diagram
  { from: "claude_code", to: "diagram_ref", fromSide: "right", toSide: "left", style: "dashed" },

  // Appka → Saves (export)
  { from: "appka", to: "saves", fromSide: "bottom", toSide: "left", style: "dashed" },
];

// === RENDERING (stejný engine jako solo-rpg-diagram.jsx) ===

function getAnchor(node, side) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  switch (side) {
    case "top": return { x: cx, y: node.y };
    case "bottom": return { x: cx, y: node.y + node.h };
    case "left": return { x: node.x, y: cy };
    case "right": return { x: node.x + node.w, y: cy };
    default: return { x: cx, y: cy };
  }
}

function EdgePath({ edge, nodes }) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;
  const a = getAnchor(fromNode, edge.fromSide);
  const b = getAnchor(toNode, edge.toSide);
  let path;
  const fs = edge.fromSide;
  const ts = edge.toSide;

  if ((fs === "right" && ts === "left") || (fs === "left" && ts === "right")) {
    const midX = (a.x + b.x) / 2;
    path = `M${a.x},${a.y} L${midX},${a.y} L${midX},${b.y} L${b.x},${b.y}`;
  } else if ((fs === "bottom" && ts === "top") || (fs === "top" && ts === "bottom")) {
    const midY = (a.y + b.y) / 2;
    path = `M${a.x},${a.y} L${a.x},${midY} L${b.x},${midY} L${b.x},${b.y}`;
  } else if (fs === "bottom" && ts === "right") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else if (fs === "bottom" && ts === "left") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else if (fs === "left" && ts === "bottom") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "right" && ts === "bottom") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "left" && ts === "top") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "right" && ts === "top") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "top" && ts === "left") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else if (fs === "top" && ts === "right") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  }
  return (
    <g>
      <path d={path} fill="none" stroke={edge.style === "solid" ? "#555" : "#aaa"} strokeWidth={1.4} strokeDasharray={edge.style === "dashed" ? "6 4" : "none"} />
      <ArrowHead x={b.x} y={b.y} side={edge.toSide} color={edge.style === "solid" ? "#555" : "#aaa"} />
    </g>
  );
}

function ArrowHead({ x, y, side, color }) {
  const s = 6;
  const pts = {
    left: `${x},${y} ${x+s},${y-s/2} ${x+s},${y+s/2}`,
    right: `${x},${y} ${x-s},${y-s/2} ${x-s},${y+s/2}`,
    top: `${x},${y} ${x-s/2},${y+s} ${x+s/2},${y+s}`,
    bottom: `${x},${y} ${x-s/2},${y-s} ${x+s/2},${y-s}`,
  };
  return pts[side] ? <polygon points={pts[side]} fill={color} /> : null;
}

const STYLES = {
  core: { fill: "#2a2a2a", stroke: "#2a2a2a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 9 },
  core_highlight: { fill: "#4a3a2a", stroke: "#8a6a3a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 10 },
  core_progress: { fill: "#2a3a4a", stroke: "#4a6a8a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 9 },
  mech_list: { fill: "#3a1a1a", stroke: "#8a3a3a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 8.5 },
  cycle: { fill: "#faf9f6", stroke: "#555", textFill: "#333", fontWeight: 600, rx: 6, fontSize: 11 },
  cycle_active: { fill: "#e8e5dd", stroke: "#333", textFill: "#222", fontWeight: 700, rx: 6, fontSize: 10 },
  cycle_write: { fill: "#dde8dd", stroke: "#4a7a4a", textFill: "#2a4a2a", fontWeight: 600, rx: 6, fontSize: 9.5 },
  scene_type: { fill: "#f5f3ee", stroke: "#bbb", textFill: "#555", fontWeight: 500, rx: 4, fontSize: 9.5 },
  tool: { fill: "#faf9f6", stroke: "#888", textFill: "#444", fontWeight: 500, rx: 4, fontSize: 9.5 },
  tool_primary: { fill: "#faf9f6", stroke: "#555", textFill: "#222", fontWeight: 700, rx: 4, fontSize: 9.5 },
  sublabel: { fill: "transparent", stroke: "none", textFill: "#aaa", fontWeight: 400, rx: 0, fontSize: 8.5 },
  sublabel_tool: { fill: "transparent", stroke: "none", textFill: "#999", fontWeight: 400, rx: 0, fontSize: 8.5 },
  note: { fill: "#faf9f6", stroke: "#bbb", textFill: "#888", fontWeight: 600, rx: 4, fontSize: 10 },
  note_alert: { fill: "#faf5ee", stroke: "#c89030", textFill: "#6a4a10", fontWeight: 600, rx: 4, fontSize: 8.5 },
  player: { fill: "#faf9f6", stroke: "#333", textFill: "#333", fontWeight: 800, rx: 20, fontSize: 12 },
};

function NodeBox({ node, selected, onSelect }) {
  const hasDesc = DESCRIPTIONS[node.id];
  const isSelected = selected === node.id;
  const clickable = !!hasDesc;

  if (node.type === "group") {
    return (
      <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined} style={{ cursor: clickable ? "pointer" : "default" }}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={isSelected ? "rgba(100,100,200,0.06)" : "none"} stroke={isSelected ? "#666" : "#ccc"} strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="6 3" rx={6} />
        <text x={node.x + node.w / 2} y={node.y - 6} textAnchor="middle"
          style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", fill: isSelected ? "#555" : "#999", fontWeight: 600, letterSpacing: "0.08em" }}>
          {node.label}
        </text>
      </g>
    );
  }
  if (node.type === "note" || node.type === "note_alert") {
    const s = STYLES[node.type];
    return (
      <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined} style={{ cursor: clickable ? "pointer" : "default" }}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={isSelected ? "#f0efe8" : s.fill} stroke={isSelected ? "#666" : s.stroke} strokeWidth={isSelected ? 1.5 : 1} rx={s.rx} />
        {node.label.split("\n").map((line, i) => (
          <text key={i} x={node.x + node.w / 2} y={node.y + 14 + i * 13} textAnchor="middle"
            style={{ fontSize: s.fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: s.textFill, fontWeight: i === 0 ? 700 : 500 }}>
            {line}
          </text>
        ))}
      </g>
    );
  }

  const s = STYLES[node.type] || STYLES.tool;
  const lines = node.label.split("\n");
  const fontSize = s.fontSize || 10;
  const lineHeight = fontSize + 3.5;
  const totalH = lines.length * lineHeight;
  const startY = node.y + node.h / 2 - totalH / 2 + lineHeight * 0.72;
  const hlStroke = isSelected ? (s.fill.startsWith("#2") || s.fill.startsWith("#3") || s.fill.startsWith("#4") ? "#8888cc" : "#555") : s.stroke;
  const hlWidth = isSelected ? 2.5 : 1.2;

  return (
    <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined} style={{ cursor: clickable ? "pointer" : "default" }}>
      {s.stroke !== "none" && (
        <rect x={node.x} y={node.y} width={node.w} height={node.h} fill={s.fill} stroke={hlStroke} strokeWidth={hlWidth} rx={s.rx} />
      )}
      {lines.map((line, i) => (
        <text key={i} x={node.x + node.w / 2} y={startY + i * lineHeight} textAnchor="middle"
          style={{ fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: s.textFill, fontWeight: i === 0 ? s.fontWeight : Math.min(s.fontWeight, 500), letterSpacing: "0.02em" }}>
          {line}
        </text>
      ))}
    </g>
  );
}

function InfoPanel({ descId, onClose }) {
  const desc = DESCRIPTIONS[descId];
  if (!desc) return null;
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(460px, 88vw)",
      background: "#faf9f6", borderLeft: "2px solid #333", zIndex: 20,
      display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #e0ddd5",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#222",
          fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.3, paddingRight: 12 }}>
          {desc.title}
        </h2>
        <button onClick={onClose} style={{ background: "#333", color: "#faf9f6", border: "none",
          borderRadius: 4, width: 30, height: 30, fontSize: 15, cursor: "pointer", flexShrink: 0,
          fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ padding: "14px 18px", overflowY: "auto", flex: 1 }}>
        {desc.text.split("\n\n").map((para, i) => (
          <p key={i} style={{ margin: "0 0 12px 0", fontSize: 12.5, lineHeight: 1.65, color: "#444",
            fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap" }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

function getTouchDist(t1, t2) {
  return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
}

export default function AgentDiagram() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState("_intro");
  const [didMove, setDidMove] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);
  const pinchRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => { panRef.current = pan; }, [pan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.92 : 1.08), 0.3), 3)); } };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e) => { if (e.touches.length > 1) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  const handleTouchStart = (e) => {
    setDidMove(false);
    if (e.touches.length === 1) { setDragging(true); dragStartRef.current = { x: e.touches[0].clientX - panRef.current.x, y: e.touches[0].clientY - panRef.current.y }; }
    else if (e.touches.length === 2) { setDragging(false); pinchRef.current = { dist: getTouchDist(e.touches[0], e.touches[1]), zoom }; }
  };
  const handleTouchMove = (e) => {
    setDidMove(true);
    if (e.touches.length === 1 && dragging) setPan({ x: e.touches[0].clientX - dragStartRef.current.x, y: e.touches[0].clientY - dragStartRef.current.y });
    else if (e.touches.length === 2 && pinchRef.current) setZoom(Math.min(Math.max(pinchRef.current.zoom * (getTouchDist(e.touches[0], e.touches[1]) / pinchRef.current.dist), 0.3), 3));
  };
  const handleTouchEnd = () => { setDragging(false); pinchRef.current = null; };
  const handleMouseDown = (e) => { if (e.button === 0) { setDragging(true); setDidMove(false); dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; } };
  const handleMouseMove = (e) => { if (dragging) { setDidMove(true); setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); } };
  const handleMouseUp = () => setDragging(false);
  const handleSvgClick = () => { if (!didMove) setSelected(null); };
  const handleNodeSelect = (id) => { if (!didMove) setSelected(id === selected ? null : id); };

  const btnStyle = { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18,
    fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", WebkitTapHighlightColor: "transparent", userSelect: "none" };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#faf9f6",
      fontFamily: "'IBM Plex Mono', monospace", position: "relative", overflow: "hidden", touchAction: "pan-y" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 14px",
        background: "rgba(250,249,246,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e0ddd5",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#333", letterSpacing: "0.05em" }}>
          AGENT MODUL — HEADLESS SOLO RPG
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setSelected("_intro")} style={{
            fontSize: 9, padding: "4px 10px", background: selected === "_intro" ? "#555" : "#333",
            color: "#faf9f6", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            O MODULU
          </button>
          <span style={{ fontSize: 10, color: "#888" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 20, right: selected ? "min(476px, calc(88vw + 16px))" : 16,
        display: "flex", flexDirection: "column", gap: 6, zIndex: 10, transition: "right 0.2s" }}>
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} style={btnStyle}>+</button>
        <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.3))} style={btnStyle}>−</button>
        <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} style={{ ...btnStyle, fontSize: 11 }}>↺</button>
      </div>

      <svg width="100%" height="100%" style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onClick={handleSvgClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="0.5" fill="#ddd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {EDGES.map((edge, i) => <EdgePath key={i} edge={edge} nodes={NODES} />)}
          {NODES.map(node => <NodeBox key={node.id} node={node} selected={selected} onSelect={handleNodeSelect} />)}
        </g>
      </svg>

      <div style={{ position: "absolute", bottom: 6, left: 14, fontSize: 9, color: "#bbb" }}>
        KLIKNI NA BLOK PRO DETAIL · TÁHNI · PINCH ZOOM · CTRL+SCROLL
      </div>

      {selected && <InfoPanel descId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
