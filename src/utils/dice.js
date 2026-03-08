import { FATE_DIAG, ACTIONS, DESCRIPTIONS, SCENE_ADJ, EVENT_FOCUS } from "../constants/tables.js";

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
export function rollMeaning(table) {
  const d1 = roll(100);
  const d2 = roll(100);
  const list = table === "descriptions" ? DESCRIPTIONS : ACTIONS;
  return { d1, d2, word1: list[d1 - 1], word2: list[d2 - 1] };
}
