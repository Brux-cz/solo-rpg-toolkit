import { useState, useRef, useEffect } from "react";

const DESCRIPTIONS = {
  _intro: {
    title: "Agent Modul — Přehled",
    text: `Headless agent pro autonomní hraní Solo RPG bez browseru.

Agent běží z Claude Code terminálu. Místo klikání na UI volá přímo herní funkce (dice.js, combat.js, tables.js) přes Node.js. Výstup je JSON soubor kompatibilní s appkou — importuješ ho přes Lobby NEBO sleduješ živě v browseru díky live sync.

DVĚ CESTY, STEJNÁ PRAVIDLA:
1. APPKA (React) — hráč kliká, UI volá funkce, stav v localStorage
2. AGENT (Node.js) — Claude volá funkce přímo, stav v JSON souboru

Obě cesty sdílejí stejné utils/ a constants/ — jeden zdroj pravdy pro pravidla.

MULTI-AGENT ARCHITEKTURA:
• HLAVNÍ AGENT — hraje hru (narativ, CLI příkazy, bookkeeping)
• AUDITOR AGENT — subagent na pozadí po každé scéně (kontrola pravidel, bookkeepingu, konzistence)
• GAMEPLAY LOG — perzistentní log chyb a poučení (saves/<hra>-log.md)

LIVE SYNC:
Každý CLI příkaz uloží stav do public/agent-live.json. App.jsx polluje každé 2s — hráč vidí příběh živě v browseru na telefonu bez manuálního importu.`,
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
• checkFate(odds, cf) → { d100, yes, exceptional, randomEvent, threshold }
• checkScene(cf) → { type, d10, adj?, focus?, meaning? }
• rollMeaning(table) → { word1, word2, d1, d2, cz1, cz2 }
• getEventFocus() — d100 → Event Focus string
• rollDiscoveryCheck(progress, meaningTable) → Discovery Check výsledek

MAUSRITTER:
• rollWeather(season) — 2d6 → počasí pro sezónu
• rollWeapon() — d6 → startovní zbraň
• resolveEventTarget(focus, npcs, threads) — vybere cíl random eventu`,
  },

  combat: {
    title: "combat.js — bojový systém",
    text: `Kompletní Mausritter combat pipeline.

FUNKCE:
• rollInitiative(playerDex) — d20 vs DEX → kdo začíná
• resolveDamage(dmgRoll, targetArmor, targetBo, targetStr) → damage pipeline
• rollMorale(wil) — d20 vs WIL → utíká/bojuje dál
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
    text: `Kód specifický pro headless hraní. Tři moduly:

1. engine.js — GameEngine třída
Obaluje sdílené utils/ do metod, které zapisují výsledky do game.entries[]:
SCÉNA: startScene(title), endScene(hadControl)
ORÁKULUM: fate(question, oddsLabel), meaning(table), detail(table)
NARATIV: note(text), dice(sides), behavior(npcName)
DISCOVERY: discovery(threadIndex, meaningTable)
BOJ (kolo-po-kole): combatSetup(), combatAttack(), combatEscape(), combatMorale(), combatSavingThrow(), combatSwapPaws(), combatFromBackpack(), combatUseItem(), combatWearCheck(), combatCastSpell(), combatEnd()
POSTAVA: setCharacter(patch), eatSupply(), rest(type)
NPC/THREADY: addNpc/addThread/removeNpc/removeThread/updateNpc/updateThread
ČAS: advanceTime(), weather()
STAV: getState()

2. state.js — load/save + live sync
• loadGame(path) → načte JSON, aplikuje migrace z migrations.js
• saveGame(path, name, game) → uloží JSON + live sync do agent-live.json
• newGame(name) → vytvoří INITIAL_GAME z migrations.js

3. cli.js — entry point
• node src/agent/cli.js <cmd> --file <path>
• Parsuje argumenty, volá engine, vrací JSON na stdout

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
• { type: "fate", question, oddsLabel, d100, yes, exceptional, randomEvent, cf, threshold }
• { type: "meaning", table, word1, word2, d1, d2, cz1, cz2 }
• { type: "scene", sceneNum, title, sceneType, cf, d10 }
• { type: "text", text, editable }
• { type: "endscene", sceneNum, cfOld, cfNew }
• { type: "detail", table, word1, word2, d1, d2, cz1, cz2 }
• { type: "dice", die, value }
• { type: "behavior", npc, word1, word2, d1, d2, cz1, cz2 }
• { type: "discovery", threadName, discoveryPoints, meaning }

Agent volá engine metody přes CLI, engine zapisuje do state, CLI volá saveGame() po každém příkazu. Live sync → browser vidí změny okamžitě.`,
  },

  state: {
    title: "state.js — load/save JSON + live sync",
    text: `Správa game state souboru + živá synchronizace do browseru.

LOAD:
• loadGame(path) → načte JSON, aplikuje migrace (MIGRATIONS chain z migrations.js)
• Vrátí { name, game } objekt

SAVE:
• saveGame(path, name, game) → uloží JSON do souboru (src/agent/saves/)
• LIVE SYNC: Každý save zároveň zapíše do public/agent-live.json s inkrementujícím _seq a _ts
• App.jsx polluje agent-live.json každé 2s — pokud _seq > lastSeq, aktualizuje game state v browseru

NEW:
• newGame(name) → vytvoří INITIAL_GAME z migrations.js

LIVE SYNC DETAIL:
• _seq se načte z existujícího agent-live.json při startu modulu (neresetuje se při novém CLI procesu)
• Formát: { _seq, _ts, name, game }
• App.jsx: fetch(BASE_URL + "agent-live.json?t=" + Date.now()) — cache-busting
• Výsledek: hráč vidí příběh živě v browseru na telefonu

FORMÁT SAVE SOUBORU:
{ exportVersion: 1, name: "Moje hra", game: { version: 10, character: {...}, entries: [...], ... } }

Stejný formát jako export z Lobby → plně kompatibilní oběma směry.`,
  },

  cli: {
    title: "cli.js — vstupní bod",
    text: `Node.js skript spustitelný z terminálu. Každý příkaz = jeden proces.

POUŽITÍ: node src/agent/cli.js <cmd> [args] --file <path>

PŘÍKAZY:
SCÉNA: new, scene, endscene, state
ORÁKULUM: fate, meaning, detail, discovery
NARATIV: note, dice, behavior
BOJ: combat-setup, combat-attack, combat-escape, combat-morale, combat-save, combat-swap, combat-backpack, combat-use, combat-wear, combat-spell, combat-status, combat-inventory, combat-end
POSTAVA: setchar, eat, rest
NPC/THREADY: addnpc, addthread, removenpc, removethread, updatenpc, updatethread
ČAS: time, weather
UTILITY: bestiary, odds

PŘÍKLADY:
• node src/agent/cli.js new "Moje hra" --file saves/hra.json
• node src/agent/cli.js fate "Je tu stráž?" likely --file saves/hra.json
• node src/agent/cli.js scene "Vstup do jeskyně" --file saves/hra.json
• node src/agent/cli.js combat-setup rat --file saves/hra.json

CLI vrací JSON na stdout → agent ho parsuje a pokračuje. Každý příkaz automaticky ukládá stav (save + live sync).`,
  },

  // === CLAUDE CODE ===
  claude_code: {
    title: "Claude Code — orchestrátor + multi-agent",
    text: `Claude Code (tento terminál) řídí celé hraní. Spouští subagenty pro kontrolu kvality.

ROLE HLAVNÍHO AGENTA:
1. VYPRAVĚČ — píše narativ, popisuje scény, NPC dialogy (myší optika!)
2. ORCHESTRÁTOR — volá CLI příkazy ve správném pořadí (cyklus scény)
3. INTERPRET — čte výsledky hodů a interpretuje je v kontextu příběhu
4. PRAVIDLÁŘ — konzultuje solo-rpg-diagram.jsx pro správnou aplikaci pravidel
5. BOOKKEEPER — po každé scéně provede kompletní bookkeeping (CF, jídlo, NPC/thread váhy, čas, inventář)

FLOW (play-cli skill):
1. Načte save → zkontroluje stav
2. scene '<název>' → chaos test → hraje scénu
3. BOOKKEEPING (endscene, eat, NPC váhy, thread váhy, time, weather, inventář)
4. AUDITOR AGENT na pozadí (Agent tool, run_in_background: true)
5. Čeká na výsledek auditora → opraví problémy → zpět na 2

MULTI-AGENT:
• Hlavní agent hraje a píše narativ
• Auditor agent (subagent) kontroluje pravidla a bookkeeping po každé scéně
• Oba agenti mohou editovat save soubor a log`,
  },

  play_skill: {
    title: "play-cli Skill — herní smyčka",
    text: `Skill .claude/skills/play-cli/SKILL.md — autonomní CLI hraní.

CLI: node src/agent/cli.js <cmd> --file <path>
Příkazy: scene, fate, meaning, detail, behavior, dice, note, endscene, eat, time, weather, discovery, combat, rest, state

SMYČKA:
1. scene '<název>' → hraj scénu (note, fate, meaning, detail, behavior, dice)
2. BOOKKEEPING (po KAŽDÉ scéně, PŘESNĚ v tomto pořadí):
   • endscene yes|no (CF ±1)
   • eat (1× denně! zásoby 0 = zítra Hlad!)
   • NPC váhy (zvýšit důležité, snížit nepřítomné)
   • Thread váhy + progress
   • time + weather (pokud nový den)
   • Inventář odpovídá příběhu?
3. AUDITOR AGENT → spusť na pozadí (run_in_background: true)
4. Počkej na výsledek auditora → oprav problémy → zpět na 1

MYŠÍ OPTIKA (povinný narativní filtr):
• Svět z pohledu myši — kaluž=jezero, stéblo=strom, déšť=padající balvany
• Predátoři = mýtická monstra, hmyz = draci menšího kalibru
• Lidské předměty NIKDY pravým jménem (špendlík=kopí, knoflík=štít)
• Smysly: pachy, vibrace, proudění vzduchu

NARATIVNÍ STYL:
• Hraj POMALU — trávíš čas NA scéně, rozhovory s hlasem
• Meaning tables = motor příběhu (interpretuj, neříkej výsledek)
• Taktické myšlení nahlas — postava přemýšlí před akcí`,
  },

  // === AUDITOR + LOG ===
  auditor: {
    title: "Auditor Agent — kontrola kvality",
    text: `Subagent spouštěný na pozadí po každé scéně (Agent tool, run_in_background: true).

CO KONTROLUJE:
1. BOOKKEEPING — Jedl dnes? CF odpovídá (yes=−1, no=+1)? NPC váhy dávají smysl? Thready aktualizovány?
2. PRAVIDLA — Čte relevantní sekce z solo-rpg-diagram.jsx. Saves (d20 vs atribut) správně? Boj podle pravidel? Mechaniky Mythic GME správně?
3. KONZISTENCE — Inventář odpovídá příběhu? Staty odpovídají zraněním/léčení?

VÝSTUP:
• Zapíše záznam do gameplay logu (<save>-log.md)
• Vrátí: OK nebo seznam problémů k opravě

WORKFLOW:
1. Hlavní agent dohraje scénu + bookkeeping
2. Hlavní agent spustí auditora na pozadí s promptem obsahujícím cestu k save a logu
3. Hlavní agent ČEKÁ na výsledek (nepokračuje další scénou!)
4. Pokud auditor našel problém → hlavní agent opraví
5. Pokračuje další scénou

PROČ SUBAGENT A NE HLAVNÍ AGENT:
• Oddělení rolí — hráč neauditoruje sám sebe
• Auditor čte pravidla nezávisle (čerstvý pohled)
• Běží na pozadí — neblokuje hlavní kontext
• Nalezené bugy: zapomenuté jídlo, d6 místo d10 na Scene Adjustment Table, chybějící NPC váhy`,
  },

  gameplay_log: {
    title: "Gameplay Log — perzistentní paměť",
    text: `Soubor <save>-log.md ve složce saves/. Zaznamenává průběh hry, chyby agenta a poučení.

STRUKTURA ZÁZNAMU (per scéna):
• Co se stalo — stručný popis narativu
• Mechaniky — jaké hody/tabulky se použily
• Chyby agenta — co agent udělal špatně (nebo "Žádné zjištěné")
• Korekce hráče — pokud hráč zasáhl a opravil
• POUČENÍ — co si z toho vzít pro příští scény

SOUHRNNÁ POUČENÍ (na konci logu):
• Konzistence — vždy zkontrolovat poslední entries, nepředpokládat přítomnost NPC
• Bookkeeping checklist — 7 kroků v přesném pořadí
• Narativní styl — myší optika, rozhovory s hlasem

KDO ZAPISUJE:
• Auditor agent — automaticky po každé scéně
• Hlavní agent — při korekci hráče nebo významném poučení

PROČ TO EXISTUJE:
• Konverzace se komprimuje — log přežívá napříč sessions
• Nový agent si přečte log a ví jaké chyby nedělat
• Hráč vidí kvalitu hraní a může dát zpětnou vazbu`,
  },

  live_sync: {
    title: "Live Sync — real-time do browseru",
    text: `Mechanismus pro živé sledování agentovy hry v browseru.

JAK TO FUNGUJE:
1. state.js: saveGame() zapíše save soubor + public/agent-live.json
2. agent-live.json obsahuje { _seq, _ts, name, game }
3. _seq se inkrementuje s každým uložením (přežívá restart CLI procesu)
4. App.jsx: useEffect polluje agent-live.json každé 2s
5. Pokud _seq > lastSeq → setGame(data.game) — aktualizuje celý UI

TECHNICKÉ DETAILY:
• fetch(import.meta.env.BASE_URL + "agent-live.json?t=" + Date.now()) — cache-busting
• _seq se načte z existujícího souboru při startu modulu (neresetuje se!)
• První poll hned při mount (ne až po 2s)
• console.log("[live-sync] seq X → Y entries: N") pro debugging

CO UŽIVATEL VIDÍ:
• Otevře appku v browseru na telefonu
• Agent hraje v terminálu → příběh se aktualizuje live v deníku
• Žádný manuální import — stačí nechat otevřenou appku

OMEZENÍ:
• Pouze jednosměrný sync (agent → browser)
• Pokud uživatel edituje v browseru, změny se přepíšou
• Funguje jen v dev režimu (Vite dev server)`,
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
    title: "React Appka — vizualizace + live sync",
    text: `Stávající PWA slouží k prohlížení příběhu i k ručnímu hraní.

ROLE V KONTEXTU AGENTA:
• Zobrazení agentova příběhu v deníku — ŽIVĚ díky live sync
• Ruční hraní (jako dosud)
• Appka NEVÍ jestli hru hrál člověk nebo agent — formát dat je identický

LIVE SYNC (App.jsx):
• useEffect polluje public/agent-live.json každé 2s
• Pokud _seq > lastSeq → setGame(data.game) — celý UI se aktualizuje
• Hráč vidí nové scény, fate otázky, meaning tabulky v reálném čase
• Funguje na telefonu přes WiFi (Vite dev server + port forwarding)`,
  },

  import_flow: {
    title: "Dva způsoby — Live Sync nebo Import",
    text: `DVĚ CESTY jak vidět agentovu hru v appce:

1. LIVE SYNC (preferovaný):
• Otevři appku v browseru → nech otevřenou
• Agent hraje v terminálu → příběh se aktualizuje automaticky každé 2s
• Žádný manuální krok — stačí sledovat

2. RUČNÍ IMPORT (offline/archiv):
• Svět → Správa her → Importovat → vyber JSON soubor (src/agent/saves/xxx.json)
• Hra se objeví v seznamu → klikni „Hrát"

CO UVIDÍŠ V DENÍKU:
• 🎬 Scéna bloky (modrý border) — název, typ, CF
• ❓ Fate bloky (zelený border) — otázka, odds, ANO/NE
• 🔮 Meaning bloky (fialový border) — dvě slova + překlad
• ⚔️ Combat bloky (červený border) — nepřítel, log kolo po kole
• 📝 Text bloky — narativ co agent napsal
• 📕 EndScene bloky (gradient border) — CF změna

OSTATNÍ TABY:
• 🐭 Postava — staty, inventář, ďobky
• 🗺️ Svět — CF, NPC seznam, Thread seznam, wiki karty`,
  },

  // === GAME STATE ===
  game_state: {
    title: "Game State — sdílený formát",
    text: `Jeden formát dat pro obě cesty.

STRUKTURA (migrations.js → INITIAL_GAME):
{
  version: 10,
  cf: 5,
  sceneNum: 1,
  entries: [ { type, id, ts, ... }, ... ],
  npcs: [ { name, weight, flag }, ... ],
  threads: [ { name, weight, progress, total, popis, stav, typ, poznamky }, ... ],
  keyedScenes: [],
  perilPoints: { aktualni, max },
  character: { jmeno, prijmeni, puvod, uroven, zk, str, dex, wil, bo, dobky, inventar, pomocnici, kuraz, kurazSloty, ... },
  cas: { den, hlidka, smena, rocniObdobi, pocasi, jeNepriznive, odpocinutoDnes },
}

MIGRACE:
src/store/migrations.js obsahuje MIGRATIONS chain (v1→v2→...→v10) + INITIAL_GAME. Sdíleno mezi gameStore.js (appka) a state.js (agent). loadGame() aplikuje migrace automaticky.

ENTRIES = DENÍK:
Pole objektů, každý je jeden blok v deníku. Appka je renderuje jako FateBlock, MeaningBlock, SceneBlock atd. Agent je vytváří se stejnými klíči přes engine.js.`,
  },
};

const NODES = [
  // === UŽIVATEL ===
  { id: "user", x: 520, y: 20, w: 200, h: 40, type: "player", label: "👤 UŽIVATEL\nClaude Code terminál" },

  // === CLAUDE CODE ===
  { id: "claude_code", x: 420, y: 100, w: 360, h: 50, type: "cycle_active", label: "🤖 HLAVNÍ AGENT (orchestrátor)\nplay-cli skill · narativ · bookkeeping" },

  // === AUDITOR ===
  { id: "auditor", x: 850, y: 200, w: 220, h: 50, type: "cycle_write", label: "🔍 AUDITOR AGENT\nsubagent na pozadí\npravidla · bookkeeping · konzistence" },

  // === AGENT VRSTVA ===
  { id: "agent_bg", x: 380, y: 200, w: 440, h: 200, type: "group", label: "AGENT VRSTVA (src/agent/)" },

  { id: "cli", x: 400, y: 230, w: 160, h: 36, type: "core", label: "⌨️ cli.js\nnode src/agent/cli.js ..." },
  { id: "engine", x: 600, y: 230, w: 200, h: 36, type: "core", label: "⚙️ engine.js\nGameEngine API" },

  { id: "state", x: 400, y: 300, w: 160, h: 36, type: "core", label: "💾 state.js\nload / save / live sync" },
  { id: "game_state", x: 600, y: 300, w: 200, h: 36, type: "core_highlight", label: "📦 GAME STATE\n{ entries, cf, character... }" },

  { id: "play_skill", x: 400, y: 360, w: 160, h: 24, type: "sublabel", label: "engine NEOBSAHUJE pravidla" },
  { id: "engine_note", x: 600, y: 360, w: 200, h: 24, type: "sublabel", label: "jen volá sdílené funkce ↓" },

  // === LIVE SYNC ===
  { id: "live_sync", x: 140, y: 100, w: 200, h: 40, type: "core_progress", label: "📡 LIVE SYNC\nagent-live.json → poll 2s" },

  // === SDÍLENÉ JÁDRO ===
  { id: "shared_bg", x: 280, y: 460, w: 680, h: 140, type: "group", label: "SDÍLENÉ JÁDRO (utils/ + constants/)" },

  { id: "shared_label", x: 300, y: 488, w: 300, h: 14, type: "sublabel", label: "── herní mechaniky (utils/) ──" },
  { id: "dice", x: 300, y: 506, w: 200, h: 36, type: "tool_primary", label: "🎲 dice.js\nroll · checkFate · checkScene" },
  { id: "combat", x: 520, y: 506, w: 200, h: 36, type: "tool_primary", label: "⚔️ combat.js\ndamage · iniciativa · morálka" },
  { id: "reroll", x: 740, y: 506, w: 200, h: 36, type: "tool", label: "🔄 reroll.js\nreverse odds mapa" },

  { id: "const_label", x: 300, y: 550, w: 300, h: 14, type: "sublabel", label: "── data a tabulky (constants/) ──" },
  { id: "tables", x: 300, y: 568, w: 200, h: 24, type: "tool", label: "📋 tables.js · FATE_DIAG · tabulky" },
  { id: "bestiary", x: 520, y: 568, w: 200, h: 24, type: "tool", label: "🐍 bestiary.js · 12 tvorů" },
  { id: "elements", x: 740, y: 568, w: 200, h: 24, type: "tool", label: "🔮 elements.js · 45 tabulek" },

  // === APPKA ===
  { id: "appka", x: 40, y: 200, w: 200, h: 180, type: "group", label: "REACT APPKA + LIVE SYNC" },

  { id: "ui_sheets", x: 60, y: 230, w: 160, h: 30, type: "tool", label: "📱 Sheety + Bloky\nUI komponenty" },
  { id: "ui_tabs", x: 60, y: 268, w: 160, h: 30, type: "tool", label: "📑 Taby\nDeník · Postava · Svět" },
  { id: "ui_store", x: 60, y: 306, w: 160, h: 30, type: "core", label: "💾 gameStore.js\nlocalStorage · migrace" },
  { id: "ui_note", x: 60, y: 344, w: 160, h: 24, type: "sublabel", label: "live sync přepisuje stav z agenta" },

  // === SAVES + LOG ===
  { id: "saves", x: 400, y: 640, w: 240, h: 40, type: "core_progress", label: "📁 src/agent/saves/\nJSON soubory (save game)" },
  { id: "gameplay_log", x: 670, y: 640, w: 240, h: 40, type: "note_alert", label: "📋 <save>-log.md\nchyby · poučení · audit" },

  // === IMPORT DO APPKY ===
  { id: "import_flow", x: 40, y: 460, w: 200, h: 60, type: "cycle_write", label: "📲 IMPORT (ruční alternativa)\nSvět → Správa her → Import" },

  // === FLOW ANOTACE ===
  { id: "flow_note", x: 40, y: 640, w: 250, h: 60, type: "note_alert", label: "📖 CO UVIDÍŠ V DENÍKU\n🎬 Scény · ❓ Fate · 🔮 Meaning\n⚔️ Boje · 📝 Narativ · 📕 Konec\n+ Postava + NPC + Thready" },

  // === DIAGRAM REFERENCE ===
  { id: "diagram_ref", x: 850, y: 100, w: 220, h: 50, type: "note", label: "📐 solo-rpg-diagram.jsx\nagent + auditor konzultují\npravidla (read-only)" },
];

const EDGES = [
  // Uživatel → Hlavní Agent
  { from: "user", to: "claude_code", fromSide: "bottom", toSide: "top", style: "solid" },

  // Hlavní Agent → CLI
  { from: "claude_code", to: "cli", fromSide: "bottom", toSide: "top", style: "solid" },

  // Hlavní Agent → Auditor (spouští po scéně)
  { from: "claude_code", to: "auditor", fromSide: "right", toSide: "top", style: "solid" },

  // CLI → Engine
  { from: "cli", to: "engine", fromSide: "right", toSide: "left", style: "solid" },

  // Engine → Game State
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

  // State → Live Sync (agent-live.json)
  { from: "state", to: "live_sync", fromSide: "left", toSide: "bottom", style: "solid" },

  // Live Sync → Appka (poll každé 2s)
  { from: "live_sync", to: "appka", fromSide: "bottom", toSide: "top", style: "solid" },

  // Saves → Import flow (ruční alternativa)
  { from: "saves", to: "import_flow", fromSide: "left", toSide: "right", style: "dashed" },
  { from: "import_flow", to: "appka", fromSide: "top", toSide: "bottom", style: "dashed" },

  // Auditor → Saves (čte save)
  { from: "auditor", to: "saves", fromSide: "bottom", toSide: "right", style: "dashed" },

  // Auditor → Gameplay Log (zapisuje)
  { from: "auditor", to: "gameplay_log", fromSide: "bottom", toSide: "top", style: "solid" },

  // Auditor → Diagram (čte pravidla)
  { from: "auditor", to: "diagram_ref", fromSide: "top", toSide: "bottom", style: "dashed" },

  // Hlavní Agent → Diagram (čte pravidla)
  { from: "claude_code", to: "diagram_ref", fromSide: "right", toSide: "left", style: "dashed" },
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
