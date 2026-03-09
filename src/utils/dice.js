import { FATE_DIAG, ACTIONS, ACTIONS_CZ, DESCRIPTIONS, DESCRIPTIONS_CZ, SCENE_ADJ, EVENT_FOCUS, THREAD_DISCOVERY, WEATHER_TABLE } from "../constants/tables.js";
import { ELEMENTS } from "../constants/elements.js";

export function roll(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollWeapon(die) {
  const n = parseInt(die.replace("d", ""));
  return roll(n);
}

// Mythic 2e: tři prahy per buňka [excYes, yes, excNo]
// Pozice = oddsIndex + cf (diagonal property)
export function checkFate(oddsIndex, cf) {
  const d100 = roll(100);
  const pos = oddsIndex + cf;
  const [excYesThresh, yesThresh, excNoThresh] = FATE_DIAG[pos];
  const yes = d100 <= yesThresh;
  const exceptional = yes ? d100 <= excYesThresh : d100 >= excNoThresh;
  const tensDigit = d100 === 100 ? 0 : Math.floor(d100 / 10);
  const unitsDigit = d100 === 100 ? 0 : d100 % 10;
  const doubles = tensDigit === unitsDigit;
  const randomEvent = doubles && tensDigit <= cf;
  return { d100, yes, exceptional, randomEvent, threshold: yesThresh };
}

export function getEventFocus() {
  const d = roll(100);
  for (const [max, label] of EVENT_FOCUS) {
    if (d <= max) return label;
  }
  return "Current Context";
}

export function checkScene(cf) {
  const d10 = roll(10);
  if (d10 > cf) return { d10, type: "expected" };
  if (d10 % 2 === 0) {
    const focus = getEventFocus();
    const m = rollMeaning("actions");
    return { d10, type: "interrupt", focus, meaning: m };
  }
  const adjRoll = roll(10);
  const adj = SCENE_ADJ[adjRoll - 1];
  return { d10, type: "altered", adjRoll, adj };
}

// Fix: oba hody z vybrané tabulky (ne word2 vždy z DESCRIPTIONS)
// Elements tabulky: modulo délka seznamu (méně než 100 položek ve fázi A)
export function rollMeaning(table) {
  const d1 = roll(100);
  const d2 = roll(100);
  let list, listCz;
  if (table === "descriptions") { list = DESCRIPTIONS; listCz = DESCRIPTIONS_CZ; }
  else if (table === "actions") { list = ACTIONS; listCz = ACTIONS_CZ; }
  else { list = ELEMENTS[table]; listCz = null; }
  if (!list) { list = ACTIONS; listCz = ACTIONS_CZ; }
  const w1 = list[(d1 - 1) % list.length];
  const w2 = list[(d2 - 1) % list.length];
  const cz1 = listCz ? listCz[(d1 - 1) % listCz.length] : null;
  const cz2 = listCz ? listCz[(d2 - 1) % listCz.length] : null;
  return { d1, d2, word1: w1, word2: w2, cz1, cz2 };
}

// Thread Discovery Check: 1d10 + progress → tabulka
// Vrací: { d10, total, type, points, description, meaning }
export function rollDiscoveryCheck(progress, meaningTable = "actions") {
  const d10 = roll(10);
  const total = d10 + progress;
  for (const [max, type, points, description] of THREAD_DISCOVERY) {
    if (total <= max) {
      const meaning = rollMeaning(meaningTable);
      return { d10, total, type, points, description, meaning };
    }
  }
  // Fallback (25+)
  const last = THREAD_DISCOVERY[THREAD_DISCOVERY.length - 1];
  const meaning = rollMeaning(meaningTable);
  return { d10, total, type: last[1], points: last[2], description: last[3], meaning };
}

export function rollWeather(season) {
  const d1 = roll(6);
  const d2 = roll(6);
  const total = d1 + d2;
  const entry = WEATHER_TABLE[season].find(e => total >= e.min && total <= e.max);
  return { d1, d2, total, text: entry.text, adverse: entry.adverse };
}

// Resolve Event Target — automatický výběr NPC/Thread dle Event Focus
const NPC_FOCUSES = ["NPC Action", "NPC Negative", "NPC Positive"];
const THREAD_FOCUSES = ["Move toward thread", "Move away from thread", "Close thread"];

export function resolveEventTarget(focus, npcs, threads) {
  if (NPC_FOCUSES.includes(focus)) {
    const active = (npcs || []).filter(n => n.weight >= 1);
    if (active.length === 0) return { type: "npc", empty: true };
    const result = rollFromList(active);
    if (!result) return { type: "npc", empty: true };
    return { type: "npc", ...result };
  }
  if (THREAD_FOCUSES.includes(focus)) {
    const active = (threads || []).filter(t => t.weight >= 1);
    if (active.length === 0) return { type: "thread", empty: true };
    const result = rollFromList(active);
    if (!result) return { type: "thread", empty: true };
    return { type: "thread", ...result };
  }
  return null;
}

// Mythic 2e: dvoustupňový hod na NPC/Thread seznam
// Seznam má 25 řádků, 5 sekcí po 5. Kostka sekce závisí na zaplnění.
// Vstup: list = pole položek s váhou (každá položka zabírá weight řádků)
// Výstup: { sectionDie, sectionRoll, rowRoll, index, item, reroll }
export function rollFromList(list) {
  // Rozbal seznam do řádků (váha = kolikrát se opakuje)
  const rows = [];
  list.forEach((item, idx) => {
    const w = item.weight || 1;
    for (let i = 0; i < w; i++) rows.push({ item, index: idx });
  });
  if (rows.length === 0) return null;

  // Kolik sekcí je aktivních (po 5 řádcích)
  const filledSections = Math.min(5, Math.ceil(rows.length / 5));
  const sectionDice = [0, 0, 4, 6, 8, 10]; // 1 sekce=auto, 2=d4, 3=d6, 4=d8, 5=d10

  let sectionRoll = 1;
  let sectionDie = 0;
  if (filledSections > 1) {
    sectionDie = sectionDice[filledSections];
    sectionRoll = roll(sectionDie);
    // Mapuj hod na sekci: d4→1-4 z 2 sekcí, d6→1-6 z 3 sekcí, atd.
    // Lichý hod = neaktivní sekce → "Choose" (reroll)
    const section = Math.ceil(sectionRoll / 2); // d4: 1-2→1, 3-4→2; d6: 1-2→1, 3-4→2, 5-6→3
    if (section > filledSections) {
      return { sectionDie, sectionRoll, rowRoll: 0, index: -1, item: null, reroll: true };
    }
    // Hod na řádek v sekci (d10: 1-2=řádek1, 3-4=řádek2, ..., 9-10=řádek5)
    const rowRoll = roll(10);
    const rowInSection = Math.ceil(rowRoll / 2) - 1; // 0-4
    const globalIdx = (section - 1) * 5 + rowInSection;
    if (globalIdx >= rows.length) {
      return { sectionDie, sectionRoll, rowRoll, index: -1, item: null, reroll: true };
    }
    const picked = rows[globalIdx];
    return { sectionDie, sectionRoll, rowRoll, index: picked.index, item: picked.item, reroll: false };
  }

  // Jen 1 sekce — rovnou d10 na řádek
  const rowRoll = roll(10);
  const rowInSection = Math.ceil(rowRoll / 2) - 1;
  if (rowInSection >= rows.length) {
    return { sectionDie: 0, sectionRoll: 0, rowRoll, index: -1, item: null, reroll: true };
  }
  const picked = rows[rowInSection];
  return { sectionDie: 0, sectionRoll: 0, rowRoll, index: picked.index, item: picked.item, reroll: false };
}
