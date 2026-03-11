#!/usr/bin/env node
import { GameEngine } from "./engine.js";
import { newGame, loadGame, saveGame } from "./state.js";
import { BESTIARY } from "../constants/bestiary.js";
import { ODDS_LABELS } from "../constants/tables.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const args = process.argv.slice(2);
const cmd = args[0];

function usage() {
  console.log(JSON.stringify({
    commands: {
      "new <name>": "Vytvoř novou hru",
      "load <path>": "Načti hru z JSON",
      "save": "Ulož hru (vyžaduje --file)",
      "state": "Zobraz stav hry",
      "scene <name>": "Nová scéna",
      "endscene <yes|no>": "Konec scény (yes=hráč měl kontrolu)",
      "fate <question> [odds]": "Fate Question",
      "meaning [table]": "Meaning Tables (actions/descriptions/elements:*)",
      "detail [table]": "Detail Check",
      "note <text>": "Poznámka do deníku",
      "dice <sides>": "Hod kostkou",
      "combat-setup <enemy1> [enemy2...] [--surprise player|enemy]": "Zahájení boje (iniciativa, stav)",
      "combat-attack <attacker> <target> [enhanced|weakened|dual]": "Jeden útok",
      "combat-spell <caster> <slot> [power]": "Seslání kouzla",
      "combat-escape <name>": "Pokus o útěk (DEX save)",
      "combat-morale <name> [--advantage]": "Morálka (WIL save)",
      "combat-save <name> <attr> [advantage|disadvantage]": "Záchranný hod",
      "combat-swap <name> <slotA> <slotB>": "Prohodit packy↔tělo (volná akce)",
      "combat-backpack <name> <fromSlot> <toSlot>": "Z batohu do pacek (celá akce!)",
      "combat-use <name> <slot>": "Použít předmět",
      "combat-wear": "Opotřebení zbraní/zbrojí po boji",
      "combat-status": "Stav boje (HP všech, packy)",
      "combat-inventory <name>": "Inventář (packy/tělo/batoh)",
      "combat-end <result>": "Ukončit boj (victory/death/escape/surrender)",
      "rest <short|long|full>": "Odpočinek",
      "eat": "Spotřebuj 1 porci jídla",
      "discovery <threadIdx> [table]": "Discovery Check",
      "behavior <npcName>": "NPC Behavior",
      "addnpc <name> [weight]": "Přidat NPC",
      "addthread <name> [weight]": "Přidat Thread",
      "updatenpc <index> <key=value> [key=value...]": "Aktualizovat NPC (weight, name, flag...)",
      "updatethread <index> <key=value> [key=value...]": "Aktualizovat Thread (weight, progress, poznamky...)",
      "removenpc <index>": "Odebrat NPC",
      "removethread <index>": "Odebrat Thread",
      "setchar <key=value> [key=value...]": "Nastavit postavu (jmeno, str, dex, wil, bo, dobky...)",
      "time": "Posuň čas",
      "weather": "Hoď počasí",
      "bestiary": "Seznam tvorů",
      "odds": "Seznam odds",
    },
    flags: {
      "--file <path>": "Cesta k save souboru (povinné pro load/save)",
    },
  }));
}

// Parse --file flag
const fileIdx = args.indexOf("--file");
const filePath = fileIdx >= 0 ? args[fileIdx + 1] : null;
// Remove --file and its value from args
if (fileIdx >= 0) { args.splice(fileIdx, 2); }

let save;
let engine;

function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

try {
  if (!cmd || cmd === "help") {
    usage();
    process.exit(0);
  }

  if (cmd === "bestiary") {
    output(BESTIARY.map(b => ({ name: b.name, str: b.str, bo: b.bo, damage: b.damage, armor: b.armor })));
    process.exit(0);
  }

  if (cmd === "odds") {
    output(ODDS_LABELS.map((label, i) => ({ index: i, label })));
    process.exit(0);
  }

  // Příkazy vyžadující hru
  if (cmd === "new") {
    const name = args.slice(1).join(" ") || "Agent hra";
    save = newGame(name);
    engine = new GameEngine(save.game);
    if (filePath) {
      saveGame(filePath, save.name, save.game);
      output({ ok: true, action: "new", name: save.name, file: filePath, state: engine.getState() });
    } else {
      // Default path
      const safeName = name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "hra";
      const path = join(dirname(fileURLToPath(import.meta.url)), "saves", `${safeName}.json`);
      saveGame(path, save.name, save.game);
      output({ ok: true, action: "new", name: save.name, file: path, state: engine.getState() });
    }
    process.exit(0);
  }

  // Všechny ostatní příkazy potřebují --file
  if (!filePath) {
    output({ error: "Chybí --file <path>. Použij: node cli.js <cmd> --file <path>" });
    process.exit(1);
  }

  if (cmd === "load") {
    save = loadGame(filePath);
    engine = new GameEngine(save.game);
    output({ ok: true, action: "load", name: save.name, state: engine.getState() });
    process.exit(0);
  }

  // Načti hru pro všechny ostatní příkazy
  save = loadGame(filePath);
  engine = new GameEngine(save.game);

  let result;

  switch (cmd) {
    case "state":
      result = engine.getState();
      break;

    case "scene":
      result = engine.startScene(args.slice(1).join(" "));
      break;

    case "endscene":
      result = engine.endScene(args[1] === "yes" || args[1] === "ano");
      break;

    case "fate": {
      const question = args[1] || "?";
      const odds = args[2] || "50/50";
      result = engine.fate(question, odds);
      break;
    }

    case "meaning":
      result = engine.meaning(args[1]);
      break;

    case "detail":
      result = engine.detail(args[1]);
      break;

    case "note":
      result = engine.note(args.slice(1).join(" "));
      break;

    case "dice":
      result = engine.dice(parseInt(args[1]) || 6);
      break;

    case "combat-setup": {
      const surpriseIdx = args.indexOf("--surprise");
      let surprise = null;
      const enemyArgs = [...args.slice(1)];
      if (surpriseIdx >= 0) {
        surprise = args[surpriseIdx + 1] || null;
        enemyArgs.splice(enemyArgs.indexOf("--surprise"), 2);
      }
      result = engine.combatSetup(enemyArgs, surprise);
      break;
    }

    case "combat-attack":
      result = engine.combatAttack(args[1], args[2], args[3] || null);
      break;

    case "combat-spell":
      result = engine.combatCastSpell(args[1], parseInt(args[2]) || 0, parseInt(args[3]) || 1);
      break;

    case "combat-escape":
      result = engine.combatEscape(args[1] || "hráč");
      break;

    case "combat-morale":
      result = engine.combatMorale(args[1], args.includes("--advantage"));
      break;

    case "combat-save":
      result = engine.combatSavingThrow(args[1], args[2], args[3] || "normal");
      break;

    case "combat-swap":
      result = engine.combatSwapPaws(args[1], parseInt(args[2]) || 0, parseInt(args[3]) || 1);
      break;

    case "combat-backpack":
      result = engine.combatFromBackpack(args[1], parseInt(args[2]) || 0, parseInt(args[3]) || 0);
      break;

    case "combat-use":
      result = engine.combatUseItem(args[1], parseInt(args[2]) || 0);
      break;

    case "combat-wear":
      result = engine.combatWearCheck();
      break;

    case "combat-status":
      result = engine.combatStatus();
      break;

    case "combat-inventory":
      result = engine.combatInventory(args[1] || "hráč");
      break;

    case "combat-end":
      result = engine.combatEnd(args[1] || "victory");
      break;

    case "rest":
      result = engine.rest(args[1] || "short");
      break;

    case "eat":
      result = engine.eatSupply();
      break;

    case "discovery":
      result = engine.discovery(parseInt(args[1]) || 0, args[2]);
      break;

    case "behavior":
      result = engine.behavior(args.slice(1).join(" "));
      break;

    case "addnpc":
      result = engine.addNpc(args.slice(1, -1).join(" ") || args[1], parseInt(args[args.length - 1]) || 1);
      break;

    case "addthread":
      result = engine.addThread(args.slice(1, -1).join(" ") || args[1], parseInt(args[args.length - 1]) || 1);
      break;

    case "removenpc":
      result = engine.removeNpc(parseInt(args[1]));
      break;

    case "removethread":
      result = engine.removeThread(parseInt(args[1]));
      break;

    case "updatenpc": {
      const npcIdx = parseInt(args[1]);
      const npcPatch = {};
      for (const kv of args.slice(2)) {
        const [k, ...rest] = kv.split("=");
        const v = rest.join("=");
        npcPatch[k] = k === "weight" ? parseInt(v) : k === "flag" ? v === "true" : v;
      }
      result = engine.updateNpc(npcIdx, npcPatch);
      break;
    }

    case "updatethread": {
      const tIdx = parseInt(args[1]);
      const tPatch = {};
      for (const kv of args.slice(2)) {
        const [k, ...rest] = kv.split("=");
        const v = rest.join("=");
        tPatch[k] = ["weight", "progress", "total"].includes(k) ? parseInt(v) : v;
      }
      result = engine.updateThread(tIdx, tPatch);
      break;
    }

    case "setchar": {
      const charPatch = {};
      for (const kv of args.slice(1)) {
        const [k, ...rest] = kv.split("=");
        const v = rest.join("=");
        if (["str", "dex", "wil", "bo", "dobky", "uroven", "zk", "kuraz"].includes(k)) {
          charPatch[k] = parseInt(v);
        } else {
          charPatch[k] = v;
        }
      }
      result = engine.setCharacter(charPatch);
      break;
    }

    case "time":
      result = engine.advanceTime();
      break;

    case "weather":
      result = engine.weather();
      break;

    case "save":
      // Jen uložit (po jiném příkazu)
      saveGame(filePath, save.name, save.game);
      output({ ok: true, action: "save", file: filePath });
      process.exit(0);

    default:
      output({ error: `Neznámý příkaz: ${cmd}` });
      process.exit(1);
  }

  // Auto-save po každém příkazu
  saveGame(filePath, save.name, save.game);
  output(result);

} catch (err) {
  output({ error: err.message, stack: err.stack });
  process.exit(1);
}
