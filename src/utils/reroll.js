import { checkFate, getEventFocus, rollMeaning, resolveEventTarget, roll } from "./dice.js";

// Reverse map: oddsLabel → oddsIndex (FateSheet uses these abbreviated labels)
const ODDS_REVERSE = {
  "Impossible": 0,
  "Nearly imp.": 1,
  "V.unlikely": 2,
  "Unlikely": 3,
  "50/50": 4,
  "Likely": 5,
  "V.likely": 6,
  "Nearly cert.": 7,
  "Certain": 8,
};

// Reverse map: behavior context label → rollMeaning key
const BEHAVIOR_REVERSE = {
  "Obecné akce": "actions",
  "Akce NPC": "Character Actions General",
  "Akce v boji": "Character Actions Combat",
  "Rozhovor": "Character Conversations",
  "Zvíře / tvor": "Animal Actions",
  "Motivace": "Character Motivations",
};

// Map meaning/detail table field to rollMeaning key
function tableToKey(table) {
  if (table === "Actions") return "actions";
  if (table === "Descriptions") return "descriptions";
  return table; // Element names pass through as-is
}

// Types that can be re-rolled
const REROLLABLE = new Set(["meaning", "detail", "dice", "fate", "behavior"]);

export function canReroll(entry) {
  return REROLLABLE.has(entry?.type);
}

/**
 * Re-roll an entry, returning a new entry object.
 * Returns null if the entry type cannot be re-rolled.
 */
export function rerollEntry(entry, cf, npcs, threads) {
  if (!entry || !REROLLABLE.has(entry.type)) return null;

  switch (entry.type) {
    case "meaning": {
      // Nový formát (rolls pole) → přidej roll na konec sekvence
      if (Array.isArray(entry.rolls) && entry.rolls.length > 0) {
        const lastTable = entry.rolls[entry.rolls.length - 1].table;
        const key = tableToKey(lastTable);
        const m = rollMeaning(key);
        return { ...entry, rolls: [...entry.rolls, { word1: m.word1, word2: m.word2, cz1: m.cz1, cz2: m.cz2, d1: m.d1, d2: m.d2, table: lastTable }] };
      }
      // Starý formát (word1/word2 přímo) → přepsat jako dosud
      const key = tableToKey(entry.table);
      const m = rollMeaning(key);
      return { ...entry, word1: m.word1, word2: m.word2, cz1: m.cz1, cz2: m.cz2, d1: m.d1, d2: m.d2 };
    }
    case "detail": {
      const key = tableToKey(entry.table);
      const m = rollMeaning(key);
      return { ...entry, word1: m.word1, word2: m.word2, cz1: m.cz1, cz2: m.cz2, d1: m.d1, d2: m.d2 };
    }

    case "dice": {
      const sides = parseInt(entry.die.replace("d", ""));
      const value = roll(sides);
      return { ...entry, value };
    }

    case "fate": {
      const oddsIdx = ODDS_REVERSE[entry.oddsLabel];
      if (oddsIdx === undefined) return null;
      const useCf = entry.cf || cf;
      const r = checkFate(oddsIdx, useCf);

      const newEntry = {
        ...entry,
        d100: r.d100,
        yes: r.yes,
        exceptional: r.exceptional,
        randomEvent: r.randomEvent,
        threshold: r.threshold,
      };

      // Clear old event data
      delete newEntry.eventFocus;
      delete newEntry.eventMeaning;
      delete newEntry.eventTargetType;
      delete newEntry.eventTargetName;
      delete newEntry.eventTargetReroll;
      delete newEntry.eventTargetEmpty;

      // Generate new event if needed
      if (r.randomEvent) {
        const focus = getEventFocus();
        const meaning = rollMeaning("actions");
        const target = resolveEventTarget(focus, npcs, threads);
        newEntry.eventFocus = focus;
        newEntry.eventMeaning = meaning;
        if (target) {
          newEntry.eventTargetType = target.type;
          newEntry.eventTargetName = target.item?.name || null;
          newEntry.eventTargetReroll = target.reroll || false;
          newEntry.eventTargetEmpty = target.empty || false;
        }
      }

      return newEntry;
    }

    case "behavior": {
      const key = BEHAVIOR_REVERSE[entry.context] || "actions";
      const m = rollMeaning(key);
      return { ...entry, word1: m.word1, word2: m.word2, cz1: m.cz1, cz2: m.cz2, d1: m.d1, d2: m.d2 };
    }

    default:
      return null;
  }
}
