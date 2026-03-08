import { roll } from "./dice.js";

export function resolveDamage(dmg, armor, targetBo, targetStr) {
  const totalDmg = Math.max(0, dmg - armor);
  let bo = targetBo;
  let str = targetStr;
  let strSave = null;
  let strSaveResult = null;
  let dead = false;
  let wounded = false;

  if (totalDmg <= 0) return { totalDmg: 0, boBefore: bo, boAfter: bo, strBefore: str, strAfter: str, strSave, strSaveResult, dead, wounded };

  const boBefore = bo;
  const strBefore = str;

  if (bo > 0) {
    const boDmg = Math.min(bo, totalDmg);
    bo -= boDmg;
    const overflow = totalDmg - boDmg;
    if (overflow > 0) {
      str -= overflow;
      if (str <= 0) {
        str = 0;
        dead = true;
      } else {
        strSave = roll(20);
        strSaveResult = strSave <= str;
        if (!strSaveResult) wounded = true;
      }
    }
  } else {
    str -= totalDmg;
    if (str <= 0) {
      str = 0;
      dead = true;
    } else {
      strSave = roll(20);
      strSaveResult = strSave <= str;
      if (!strSaveResult) wounded = true;
    }
  }

  return { totalDmg, boBefore, boAfter: bo, strBefore, strAfter: str, strSave, strSaveResult, dead, wounded };
}

export function rollInitiative(playerDex) {
  const d20 = roll(20);
  return { d20, playerFirst: d20 <= playerDex };
}

export function rollMorale(wil) {
  const d20 = roll(20);
  return { d20, stays: d20 <= wil };
}

export function rollMoraleAdvantage(wil) {
  const d1 = roll(20), d2 = roll(20);
  const best = Math.min(d1, d2);
  return { d20a: d1, d20b: d2, best, stays: best <= wil };
}
