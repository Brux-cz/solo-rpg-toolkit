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

export function assessDanger({ playerBo, playerStr, playerArmor, hirelingBo, hirelingStr, hirelingArmor }, enemies) {
  const hasHireling = hirelingBo > 0;
  const pHP = playerBo + playerStr + (hasHireling ? hirelingBo + hirelingStr : 0);
  const pAttacks = 1 + (hasHireling ? 1 : 0);
  const eHP = enemies.reduce((s, e) => s + e.bo + e.str, 0);
  const eAttacks = enemies.length;
  const ratio = (pHP / (eHP || 1)) / (eAttacks / (pAttacks || 1));

  let level, color, text;
  if (ratio >= 1.5) { level = "safe"; color = "#4a7a4a"; text = "Máš výhodu"; }
  else if (ratio >= 0.8) { level = "even"; color = "#c89030"; text = "Vyrovnaný boj"; }
  else if (ratio >= 0.4) { level = "danger"; color = "#aa4444"; text = "Nebezpečné!"; }
  else { level = "deadly"; color = "#771111"; text = "Téměř jistá smrt!"; }

  const soloWarning = !hasHireling && enemies.length >= 2 ? "Jsi sám — vyřazení = smrt!" : null;
  return { level, color, text, ratio, soloWarning };
}

export function rollMoraleAdvantage(wil) {
  const d1 = roll(20), d2 = roll(20);
  const best = Math.min(d1, d2);
  return { d20a: d1, d20b: d2, best, stays: best <= wil };
}
