import { FATE_CHART, ACTIONS, DESCRIPTIONS, SCENE_ADJ, EVENT_FOCUS } from "../constants/tables.js";

export function roll(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollWeapon(die) {
  const n = parseInt(die.replace("d", ""));
  return roll(n);
}

export function checkFate(oddsIndex, cf) {
  const d100 = roll(100);
  const threshold = FATE_CHART[oddsIndex][cf - 1];
  const yes = d100 <= threshold;
  const excThresh = Math.floor(threshold / 5);
  const excNoThresh = 100 - Math.floor((100 - threshold) / 5);
  const exceptional = yes ? d100 <= excThresh : d100 >= excNoThresh;
  const tensDigit = d100 === 100 ? 0 : Math.floor(d100 / 10);
  const unitsDigit = d100 === 100 ? 0 : d100 % 10;
  const doubles = tensDigit === unitsDigit;
  const randomEvent = doubles && tensDigit <= cf;
  return { d100, yes, exceptional, randomEvent, threshold };
}

export function getEventFocus() {
  const d = roll(100);
  for (const [max, label] of EVENT_FOCUS) {
    if (d <= max) return label;
  }
  return "NPC Positive";
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

export function rollMeaning(table) {
  const d1 = roll(100);
  const d2 = roll(100);
  const list = table === "descriptions" ? DESCRIPTIONS : ACTIONS;
  return { d1, d2, word1: list[d1 - 1], word2: DESCRIPTIONS[d2 - 1] };
}
