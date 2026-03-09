import { useState, useMemo } from "react";
import { C, FONT } from "../../constants/theme.js";
import { BESTIARY } from "../../constants/bestiary.js";
import { rollWeapon, roll } from "../../utils/dice.js";
import { resolveDamage, rollInitiative, rollMorale, rollMoraleAdvantage } from "../../utils/combat.js";
import Sheet from "../ui/Sheet.jsx";

function getWeaponsFromInventory(inv) {
  if (!inv) return [];
  return inv
    .map((s, i) => ({ ...s, _idx: i }))
    .filter(s => s.typ === "zbraň" && s.nazev && !s._occupied);
}

function getArmorFromInventory(inv) {
  if (!inv) return 0;
  return inv
    .filter(s => s.typ === "zbroj" && s.nazev && !s._occupied)
    .reduce((sum, s) => sum + (s.obrana || 0), 0);
}

const MAX_ENEMIES = 5;

export default function CombatSheet({ onClose, onInsert, character, onCharUpdate }) {
  const [step, setStep] = useState("setup");
  const [source, setSource] = useState("bestiary");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [custom, setCustom] = useState({ name: "", str: 8, dex: 8, wil: 8, bo: 3, weapon: "d6", armor: 0, weaponName: "Útok" });
  const [enemies, setEnemies] = useState([]);

  const weapons = useMemo(() => getWeaponsFromInventory(character.inventar), [character.inventar]);
  const autoArmor = useMemo(() => getArmorFromInventory(character.inventar), [character.inventar]);

  const [weaponSource, setWeaponSource] = useState(() => weapons.length > 0 ? 0 : "manual");
  const [manualWeapon, setManualWeapon] = useState("d6");
  const [armorOverride, setArmorOverride] = useState(null);

  const playerWeapon = weaponSource === "manual" ? manualWeapon : (weapons[weaponSource]?.dmg || "d6");
  const playerWeaponIdx = weaponSource === "manual" ? null : weapons[weaponSource]?._idx;
  const playerArmor = armorOverride !== null ? armorOverride : autoArmor;

  const [playerDex, setPlayerDex] = useState(character.dex.akt);
  const [modSurprise, setModSurprise] = useState(false);
  const [modEnhanced, setModEnhanced] = useState(false);
  const [modImpaired, setModImpaired] = useState(false);
  const [modDualWield, setModDualWield] = useState(false);
  const [hirelingFights, setHirelingFights] = useState(false);
  const [combatResult, setCombatResult] = useState(null);

  const hireling = character.pomocnici?.[0] || null;
  const hirelingWeapons = hireling ? getWeaponsFromInventory(hireling.inventar) : [];
  const hirelingWeapon = hirelingFights && hireling
    ? (hirelingWeapons.length > 0 ? hirelingWeapons[0].dmg : "d4") : null;
  const hirelingWeaponName = hirelingFights && hireling
    ? (hirelingWeapons.length > 0 ? hirelingWeapons[0].nazev : "Improvizovaná") : null;
  const hirelingWeaponIdx = hirelingFights && hireling
    ? (hirelingWeapons.length > 0 ? hirelingWeapons[0]._idx : null) : null;
  const hirelingAutoArmor = hireling ? getArmorFromInventory(hireling.inventar) : 0;

  const currentEnemy = source === "bestiary" ? BESTIARY[selectedIdx] : { ...custom, str: Number(custom.str), dex: Number(custom.dex), wil: Number(custom.wil), bo: Number(custom.bo), armor: Number(custom.armor) };

  const addEnemy = () => {
    if (enemies.length >= MAX_ENEMIES) return;
    const e = source === "bestiary"
      ? { ...BESTIARY[selectedIdx] }
      : { ...custom, str: Number(custom.str), dex: Number(custom.dex), wil: Number(custom.wil), bo: Number(custom.bo), armor: Number(custom.armor) };
    if (!e.name) e.name = "Nepřítel";
    setEnemies(prev => [...prev, e]);
  };

  const removeEnemy = (idx) => {
    setEnemies(prev => prev.filter((_, i) => i !== idx));
  };

  const formatDmgLine = (dmg, armor, res, prefix) => {
    let line = prefix;
    if (armor > 0) line += `-${armor}zbroj`;
    line += ` → ${res.totalDmg} dmg`;
    if (res.totalDmg > 0) {
      if (res.boBefore > 0 && res.boAfter === 0 && res.strAfter < res.strBefore) {
        line += ` → BO ${res.boBefore}→0, STR ${res.strBefore}→${res.strAfter}`;
      } else if (res.boBefore > 0) {
        line += ` → BO ${res.boBefore}→${res.boAfter}`;
      } else {
        line += ` → STR ${res.strBefore}→${res.strAfter}`;
      }
    }
    return line;
  };

  const doFight = () => {
    const fightEnemies = enemies.length > 0 ? enemies : [currentEnemy];
    const init = modSurprise ? { d20: 0, playerFirst: true } : rollInitiative(playerDex);
    const log = [];
    let pBo = character.bo.akt, pStr = character.str.akt;
    const eState = fightEnemies.map(e => ({ bo: e.bo, str: e.str, wil: e.wil, alive: true, moraleChecked: false }));
    let result = null;

    // Hireling state
    const hActive = hirelingFights && hireling;
    let hBo = hActive ? hireling.bo.akt : 0;
    let hStr = hActive ? hireling.str.akt : 0;
    let hAlive = hActive;
    let hFled = false;
    let hMoraleChecked = false;
    const hName = hireling?.jmeno || "Pomocník";

    const initText = modSurprise
      ? "Myši první (překvapení)"
      : init.playerFirst
        ? `Myši první (DEX ${playerDex}, d20=${init.d20})`
        : `Nepřítel první (DEX ${playerDex}, d20=${init.d20})`;

    const rollPlayerDmg = (round) => {
      const effectiveWeapon = modImpaired ? "d4" : (modEnhanced || (modSurprise && round === 1)) ? "d12" : playerWeapon;
      let dmg = rollWeapon(effectiveWeapon);
      let label = effectiveWeapon + "=" + dmg;
      if (modDualWield) {
        const dmg2 = rollWeapon(effectiveWeapon);
        label += `, ${effectiveWeapon}=${dmg2}`;
        if (dmg2 > dmg) dmg = dmg2;
        label += ` → ${dmg}`;
      }
      return { dmg, label };
    };

    const checkHirelingMorale = (trigger) => {
      if (hFled || !hAlive || hMoraleChecked) return;
      hMoraleChecked = true;
      const hWil = hireling.wil.akt;
      if (hireling.vernost === "verny") {
        const mor = rollMoraleAdvantage(hWil);
        log.push(`  Morálka ${hName} (${trigger}): WIL ${hWil}, 2d20=${mor.d20a},${mor.d20b} → ${mor.best} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
        if (!mor.stays) { hFled = true; hAlive = false; }
      } else {
        const mor = rollMorale(hWil);
        log.push(`  Morálka ${hName} (${trigger}): WIL ${hWil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
        if (!mor.stays) { hFled = true; hAlive = false; }
      }
    };

    for (let round = 1; round <= 20; round++) {
      const attackOrder = init.playerFirst ? ["player", "enemies"] : ["enemies", "player"];

      for (const side of attackOrder) {
        if (result) break;

        if (side === "player") {
          // Player attacks first alive enemy
          const targetIdx = eState.findIndex(e => e.alive);
          if (targetIdx === -1) { result = "victory"; break; }
          const enemy = fightEnemies[targetIdx];
          const es = eState[targetIdx];

          const { dmg: dmgRoll, label: dmgLabel } = rollPlayerDmg(round);
          const res = resolveDamage(dmgRoll, enemy.armor, es.bo, es.str);
          es.bo = res.boAfter;
          es.str = res.strAfter;

          const nameTag = fightEnemies.length > 1 ? ` → ${enemy.name}` : "";
          let line = formatDmgLine(dmgRoll, enemy.armor, res, `K${round}: Hráč${nameTag} ${dmgLabel}`);

          if (res.dead) {
            line += " → mrtvý";
            log.push(line);
            es.alive = false;
            if (eState.every(e => !e.alive)) { result = "victory"; break; }
          } else if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) {
              line += " → Poranění!";
              log.push(line);
              es.alive = false;
              if (!es.moraleChecked) {
                const mor = rollMorale(es.wil);
                log.push(`  Morálka ${enemy.name}: WIL ${es.wil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
                es.moraleChecked = true;
                if (!mor.stays) {
                  es.alive = false;
                  if (eState.every(e => !e.alive)) { result = "fled"; break; }
                }
              }
              if (eState.every(e => !e.alive)) { result = "victory"; break; }
            } else {
              log.push(line);
            }
          } else {
            log.push(line);
          }

          // Hireling attacks
          if (hAlive && !hFled && !result) {
            const aliveIndices = eState.map((e, i) => e.alive ? i : -1).filter(i => i >= 0);
            if (aliveIndices.length === 0) { result = "victory"; break; }
            // Prefer different target than player's
            const hTargetIdx = aliveIndices.length > 1
              ? (aliveIndices.find(i => i !== targetIdx) ?? aliveIndices[0])
              : aliveIndices[0];
            const hEnemy = fightEnemies[hTargetIdx];
            const hEs = eState[hTargetIdx];
            const effectiveHWeapon = (modSurprise && round === 1) ? "d12" : hirelingWeapon;
            const hDmg = rollWeapon(effectiveHWeapon);
            const hRes = resolveDamage(hDmg, hEnemy.armor, hEs.bo, hEs.str);
            hEs.bo = hRes.boAfter;
            hEs.str = hRes.strAfter;

            const hNameTag = fightEnemies.length > 1 ? ` → ${hEnemy.name}` : "";
            let hLine = formatDmgLine(hDmg, hEnemy.armor, hRes, `K${round}: ${hName}${hNameTag} ${effectiveHWeapon}=${hDmg}`);

            if (hRes.dead) {
              hLine += " → mrtvý";
              log.push(hLine);
              hEs.alive = false;
              if (eState.every(e => !e.alive)) { result = "victory"; break; }
            } else if (hRes.strSave !== null) {
              hLine += ` → STR save d20=${hRes.strSave} ${hRes.strSaveResult ? "OK" : "FAIL"}`;
              if (hRes.wounded) {
                hLine += " → Poranění!";
                log.push(hLine);
                hEs.alive = false;
                if (!hEs.moraleChecked) {
                  const mor = rollMorale(hEs.wil);
                  log.push(`  Morálka ${hEnemy.name}: WIL ${hEs.wil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
                  hEs.moraleChecked = true;
                  if (!mor.stays) {
                    hEs.alive = false;
                    if (eState.every(e => !e.alive)) { result = "fled"; break; }
                  }
                }
                if (eState.every(e => !e.alive)) { result = "victory"; break; }
              } else {
                log.push(hLine);
              }
            } else {
              log.push(hLine);
            }
          }
        } else {
          // Enemies attack — split targets between player and hireling
          const aliveEnemies = fightEnemies.map((e, i) => ({ e, i })).filter(({ i }) => eState[i].alive);
          for (const { e: enemy, i: ei } of aliveEnemies) {
            if (result) break;
            // Target selection: 1 enemy alternates (odd round→player, even→hireling), multiple: even index→player, odd→hireling
            let targetIsHireling = false;
            if (hAlive && !hFled) {
              if (aliveEnemies.length === 1) {
                targetIsHireling = round % 2 === 0;
              } else {
                targetIsHireling = ei % 2 === 1;
              }
            }

            if (targetIsHireling) {
              const dmgRoll = rollWeapon(enemy.weapon);
              const res = resolveDamage(dmgRoll, hirelingAutoArmor, hBo, hStr);
              hBo = res.boAfter;
              hStr = res.strAfter;
              let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `K${round}: ${enemy.name} → ${hName} ${enemy.weapon}=${dmgRoll}`);
              if (res.dead) {
                line += ` → ${hName} padl!`;
                log.push(line);
                hAlive = false;
                // Remaining enemies in this round attack player
                continue;
              }
              if (res.strSave !== null) {
                line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
                if (res.wounded) {
                  line += ` → ${hName} poraněn!`;
                  log.push(line);
                  hAlive = false;
                  checkHirelingMorale("kritické zranění");
                  continue;
                }
              }
              log.push(line);
            } else {
              // Attack player
              const dmgRoll = rollWeapon(enemy.weapon);
              const res = resolveDamage(dmgRoll, playerArmor, pBo, pStr);
              pBo = res.boAfter;
              pStr = res.strAfter;
              let line = formatDmgLine(dmgRoll, playerArmor, res, `K${round}: ${enemy.name} ${enemy.weapon}=${dmgRoll}`);
              if (res.dead) {
                line += " → SMRT!";
                log.push(line);
                // Check hireling morale when player dies
                if (hAlive && !hFled) checkHirelingMorale("hráč padl");
                result = "death";
                break;
              }
              if (res.strSave !== null) {
                line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
                if (res.wounded) {
                  line += " → Poranění!";
                  log.push(line);
                  // Check hireling morale when player wounded
                  if (hAlive && !hFled) checkHirelingMorale("hráč poraněn");
                  result = "wounded";
                  break;
                }
              }
              log.push(line);
            }
          }
        }
      }
      if (result) break;
    }
    if (!result) {
      result = eState.every(e => !e.alive) ? "victory" : "victory";
    }

    // Opotřebení zbraně a zbroje po boji — hráč
    const wearLog = [];
    const invChanges = {};

    if (playerWeaponIdx !== null) {
      const w = character.inventar[playerWeaponIdx];
      if (w && w.tecky?.max > 0) {
        const isImprov = w._preset === "Improvizovaná" || w.nazev === "Improvizovaná";
        const isAlwaysWear = isImprov || w.jePostribrena;
        const isMagic = w.jeKouzelna;
        if (isAlwaysWear) {
          const reason = isImprov ? "improvizovaná" : "postříbřená";
          const newAkt = Math.max(0, w.tecky.akt - 1);
          invChanges[playerWeaponIdx] = { tecky: { ...w.tecky, akt: newAkt } };
          wearLog.push(`Zbraň ${w.nazev}: ${reason} → škrt tečky (${w.tecky.akt}→${newAkt})`);
          if (newAkt === 0) wearLog.push(`  → ${w.nazev} zničena!`);
        } else if (isMagic) {
          const d = roll(6);
          if (d === 6) {
            const newAkt = Math.max(0, w.tecky.akt - 1);
            invChanges[playerWeaponIdx] = { tecky: { ...w.tecky, akt: newAkt } };
            wearLog.push(`Zbraň ${w.nazev}: d6=${d} (kouzelná, jen 6) → škrt tečky (${w.tecky.akt}→${newAkt})`);
            if (newAkt === 0) wearLog.push(`  → ${w.nazev} zničena!`);
          } else {
            wearLog.push(`Zbraň ${w.nazev}: d6=${d} (kouzelná, jen 6) → OK`);
          }
        } else {
          const d = roll(6);
          if (d >= 4) {
            const newAkt = Math.max(0, w.tecky.akt - 1);
            invChanges[playerWeaponIdx] = { tecky: { ...w.tecky, akt: newAkt } };
            wearLog.push(`Zbraň ${w.nazev}: d6=${d} → škrt tečky (${w.tecky.akt}→${newAkt})`);
            if (newAkt === 0) wearLog.push(`  → ${w.nazev} zničena!`);
          } else {
            wearLog.push(`Zbraň ${w.nazev}: d6=${d} → OK`);
          }
        }
      }
    }

    if (character.inventar) {
      character.inventar.forEach((s, i) => {
        if (s.typ !== "zbroj" || !s.nazev || s._occupied) return;
        if (!s.tecky?.max || s.tecky.max <= 0) return;
        const d = roll(6);
        if (d >= 4) {
          const newAkt = Math.max(0, s.tecky.akt - 1);
          invChanges[i] = { tecky: { ...s.tecky, akt: newAkt } };
          wearLog.push(`Zbroj ${s.nazev}: d6=${d} → škrt tečky (${s.tecky.akt}→${newAkt})`);
          if (newAkt === 0) wearLog.push(`  → ${s.nazev} zničena!`);
        } else {
          wearLog.push(`Zbroj ${s.nazev}: d6=${d} → OK`);
        }
      });
    }

    // Opotřebení — pomocník
    const hInvChanges = {};
    if (hActive && hireling.inventar) {
      if (hirelingWeaponIdx !== null) {
        const w = hireling.inventar[hirelingWeaponIdx];
        if (w && w.tecky?.max > 0) {
          const isImprov = w._preset === "Improvizovaná" || w.nazev === "Improvizovaná";
          const isAlwaysWear = isImprov || w.jePostribrena;
          const isMagic = w.jeKouzelna;
          if (isAlwaysWear) {
            const reason = isImprov ? "improvizovaná" : "postříbřená";
            const newAkt = Math.max(0, w.tecky.akt - 1);
            hInvChanges[hirelingWeaponIdx] = { tecky: { ...w.tecky, akt: newAkt } };
            wearLog.push(`${hName} zbraň ${w.nazev}: ${reason} → škrt tečky (${w.tecky.akt}→${newAkt})`);
            if (newAkt === 0) wearLog.push(`  → ${w.nazev} zničena!`);
          } else if (isMagic) {
            const d = roll(6);
            if (d === 6) {
              const newAkt = Math.max(0, w.tecky.akt - 1);
              hInvChanges[hirelingWeaponIdx] = { tecky: { ...w.tecky, akt: newAkt } };
              wearLog.push(`${hName} zbraň ${w.nazev}: d6=${d} (kouzelná, jen 6) → škrt tečky (${w.tecky.akt}→${newAkt})`);
              if (newAkt === 0) wearLog.push(`  → ${w.nazev} zničena!`);
            } else {
              wearLog.push(`${hName} zbraň ${w.nazev}: d6=${d} (kouzelná, jen 6) → OK`);
            }
          } else {
            const d = roll(6);
            if (d >= 4) {
              const newAkt = Math.max(0, w.tecky.akt - 1);
              hInvChanges[hirelingWeaponIdx] = { tecky: { ...w.tecky, akt: newAkt } };
              wearLog.push(`${hName} zbraň ${w.nazev}: d6=${d} → škrt tečky (${w.tecky.akt}→${newAkt})`);
              if (newAkt === 0) wearLog.push(`  → ${w.nazev} zničena!`);
            } else {
              wearLog.push(`${hName} zbraň ${w.nazev}: d6=${d} → OK`);
            }
          }
        }
      }
      hireling.inventar.forEach((s, i) => {
        if (s.typ !== "zbroj" || !s.nazev || s._occupied) return;
        if (!s.tecky?.max || s.tecky.max <= 0) return;
        const d = roll(6);
        if (d >= 4) {
          const newAkt = Math.max(0, s.tecky.akt - 1);
          hInvChanges[i] = { tecky: { ...s.tecky, akt: newAkt } };
          wearLog.push(`${hName} zbroj ${s.nazev}: d6=${d} → škrt tečky (${s.tecky.akt}→${newAkt})`);
          if (newAkt === 0) wearLog.push(`  → ${s.nazev} zničena!`);
        } else {
          wearLog.push(`${hName} zbroj ${s.nazev}: d6=${d} → OK`);
        }
      });
    }

    if (wearLog.length > 0) {
      log.push("--- Opotřebení ---");
      log.push(...wearLog);
    }

    const hirelingResult = hActive ? (hFled ? "fled" : hAlive ? "fought" : "fell") : null;
    setCombatResult({
      log, result, initText, enemies: fightEnemies.map(e => ({ ...e })), playerWeapon,
      playerBoAfter: pBo, playerStrAfter: pStr, invChanges,
      hirelingName: hActive ? hName : null, hirelingId: hActive ? hireling.id : null,
      hirelingBoAfter: hBo, hirelingStrAfter: hStr, hirelingResult,
      hirelingInvChanges: Object.keys(hInvChanges).length > 0 ? hInvChanges : null,
    });
    setStep("result");
  };

  const doFlee = () => {
    const fightEnemies = enemies.length > 0 ? enemies : [currentEnemy];
    const log = [];
    const dexRoll = roll(20);
    const success = dexRoll <= character.dex.akt;
    let pBo = character.bo.akt, pStr = character.str.akt;
    let fleeWounded = false;
    const invChanges = {};
    const hActive = hirelingFights && hireling;
    let hBo = hActive ? hireling.bo.akt : 0;
    let hStr = hActive ? hireling.str.akt : 0;
    let hAlive = hActive;
    const hName = hireling?.jmeno || "Pomocník";

    log.push(`Útěk: DEX záchrana d20=${dexRoll} vs DEX ${character.dex.akt} → ${success ? "ÚSPĚCH" : "NEÚSPĚCH"}`);

    // Hireling DEX save
    let hFleeSuccess = true;
    if (hActive) {
      const hDexRoll = roll(20);
      hFleeSuccess = hDexRoll <= hireling.dex.akt;
      log.push(`${hName} útěk: DEX záchrana d20=${hDexRoll} vs DEX ${hireling.dex.akt} → ${hFleeSuccess ? "ÚSPĚCH" : "NEÚSPĚCH"}`);
    }

    if (success) {
      log.push("Bezpečný únik!");
    } else {
      const allNames = fightEnemies.map(e => e.name).join(", ");
      log.push(`Neúspěch → ${fightEnemies.length > 1 ? "všichni nepřátelé mají" : `${allNames} má`} volný útok!`);
      // Split free attacks between player and hireling
      for (let ei = 0; ei < fightEnemies.length; ei++) {
        const enemy = fightEnemies[ei];
        if (pStr <= 0) break;
        const targetIsHireling = hActive && hAlive && !hFleeSuccess && ei % 2 === 1 && fightEnemies.length > 1;
        if (targetIsHireling) {
          const dmgRoll = rollWeapon(enemy.weapon);
          const res = resolveDamage(dmgRoll, hirelingAutoArmor, hBo, hStr);
          hBo = res.boAfter;
          hStr = res.strAfter;
          let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `${enemy.name} → ${hName} ${enemy.weapon}=${dmgRoll}`);
          if (res.strSave !== null) line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
          if (res.dead || res.wounded) { hAlive = false; line += ` → ${hName} ${res.dead ? "padl" : "poraněn"}!`; }
          log.push(line);
        } else {
          const dmgRoll = rollWeapon(enemy.weapon);
          const res = resolveDamage(dmgRoll, playerArmor, pBo, pStr);
          pBo = res.boAfter;
          pStr = res.strAfter;
          let line = formatDmgLine(dmgRoll, playerArmor, res, `${enemy.name} ${enemy.weapon}=${dmgRoll}`);
          if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) { line += " → Poranění!"; fleeWounded = true; }
          }
          if (res.dead) line += " → SMRT!";
          log.push(line);
        }
      }
      // Hireling failed separately
      if (hActive && !hFleeSuccess && (fightEnemies.length === 1 || !hAlive)) {
        // Single enemy: hireling also gets hit
        if (fightEnemies.length === 1 && hAlive) {
          const enemy = fightEnemies[0];
          const dmgRoll = rollWeapon(enemy.weapon);
          const res = resolveDamage(dmgRoll, hirelingAutoArmor, hBo, hStr);
          hBo = res.boAfter;
          hStr = res.strAfter;
          let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `${enemy.name} → ${hName} ${enemy.weapon}=${dmgRoll}`);
          if (res.strSave !== null) line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
          if (res.dead || res.wounded) { hAlive = false; line += ` → ${hName} ${res.dead ? "padl" : "poraněn"}!`; }
          log.push(line);
        }
      }
      if (pStr > 0) log.push("Únik po zásahu.");
    }
    const result = pStr <= 0 ? "death" : success ? "escape" : "escape_hit";
    const hirelingResult = hActive ? (hAlive ? "fought" : "fell") : null;
    setCombatResult({
      log, result, initText: "Pokus o útěk", enemies: fightEnemies.map(e => ({ ...e })),
      playerWeapon, playerBoAfter: pBo, playerStrAfter: pStr, invChanges, playerWounded: fleeWounded,
      hirelingName: hActive ? hName : null, hirelingId: hActive ? hireling.id : null,
      hirelingBoAfter: hBo, hirelingStrAfter: hStr, hirelingResult,
    });
    setStep("result");
  };

  const insertResult = () => {
    if (!combatResult) return;
    if (onCharUpdate) {
      const updatedChar = {
        ...character,
        bo: { ...character.bo, akt: combatResult.playerBoAfter },
        str: { ...character.str, akt: combatResult.playerStrAfter },
      };
      if (combatResult.invChanges && Object.keys(combatResult.invChanges).length > 0 && updatedChar.inventar) {
        updatedChar.inventar = updatedChar.inventar.map((s, i) =>
          combatResult.invChanges[i] ? { ...s, ...combatResult.invChanges[i] } : s
        );
      }
      const isWounded = combatResult.result === "wounded" || combatResult.playerWounded;
      if (isWounded && updatedChar.inventar) {
        const freeIdx = updatedChar.inventar.findIndex(s => !s.nazev && !s._occupied);
        if (freeIdx !== -1) {
          updatedChar.inventar = updatedChar.inventar.map((s, i) =>
            i === freeIdx ? { typ: "stav", nazev: "Poranění", tecky: { akt: 0, max: 0 }, podminkaOdstraneni: "Odpočinek a ošetření" } : s
          );
        }
      }
      // Write-back hireling stats
      if (combatResult.hirelingId && updatedChar.pomocnici) {
        updatedChar.pomocnici = updatedChar.pomocnici.map(p =>
          p.id === combatResult.hirelingId
            ? { ...p, bo: { ...p.bo, akt: combatResult.hirelingBoAfter }, str: { ...p.str, akt: combatResult.hirelingStrAfter } }
            : p
        );
        // Apply hireling inventory changes
        if (combatResult.hirelingInvChanges) {
          updatedChar.pomocnici = updatedChar.pomocnici.map(p => {
            if (p.id !== combatResult.hirelingId) return p;
            return { ...p, inventar: p.inventar.map((s, i) =>
              combatResult.hirelingInvChanges[i] ? { ...s, ...combatResult.hirelingInvChanges[i] } : s
            )};
          });
        }
      }
      onCharUpdate(updatedChar);
    }
    const enemyNames = combatResult.enemies.map(e => e.name).join(", ");
    onInsert({
      type: "combat",
      enemyName: enemyNames,
      enemies: combatResult.enemies.map(e => ({ name: e.name, str: e.str, bo: e.bo, weapon: e.weapon })),
      initiativeText: combatResult.initText,
      log: combatResult.log,
      result: combatResult.result,
      hirelingName: combatResult.hirelingName,
      hirelingResult: combatResult.hirelingResult,
    });
  };

  const handleClose = () => {
    if (step === "result") insertResult();
    onClose();
  };

  const resultColor = combatResult?.result === "victory" ? C.green : combatResult?.result === "fled" || combatResult?.result === "escape" || combatResult?.result === "escape_hit" ? C.yellow : C.red;
  const resultLabel = { victory: "VÍTĚZSTVÍ", fled: "NEPŘÍTEL UTEKL", wounded: "PORANĚNÍ", death: "SMRT", escape: "ÚNIK", escape_hit: "ÚNIK (PO ZÁSAHU)" }[combatResult?.result] || "SMRT";
  const dieCostky = ["d4", "d6", "d8", "d10", "d12"];

  const inputStyle = { width: 50, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 11, fontFamily: FONT, textAlign: "center", background: "white", color: C.text, outline: "none" };

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Boj — nebezpečný svět myší</div>
      <div style={{ marginBottom: 12 }}>
        Simulace souboje podle pravidel Mausritteru. Vyber nepřítele, nastav zbraň a zbroj, a nech appku rozhodnout.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.red + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: myš narazí v mlýně na agresivní krysu. Boj je nevyhnutelný!
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>1. Přidej nepřátele</div>
      <div style={{ marginBottom: 10 }}>
        Vyber z bestiáře (12 tvorů) nebo vytvoř vlastního nepřítele. Můžeš přidat až 5 nepřátel najednou.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>2. Nastav svou výbavu</div>
      <div style={{ marginBottom: 10 }}>
        Appka automaticky načte tvou zbraň a zbroj z inventáře. Můžeš přepsat ručně nebo zapnout modifikátory (překvapení, zesílený útok...).
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>3. Bojuj</div>
      <div style={{ marginBottom: 4 }}>
        Appka simuluje celý boj kolo po kole — iniciativa, útoky, zranění, morálka. Výsledek může být vítězství, útěk nepřítele, poranění, nebo smrt.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Krysa útočí d6=4, zbroj 1 → 3 dmg → BO 3→0, STR 8→5. Myš útočí d6=5 → krysa padá!
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>4. Výsledek</div>
      <div style={{ marginBottom: 10 }}>
        Zranění se automaticky zapíše na tvou postavu. Zbraně a zbroje se mohou opotřebit. Výsledek se vloží do deníku.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Boj je smrtelný — zvažuj útěk (DEX záchrana). Pokud přežiješ, odpočinek ti vyléčí zranění.
      </div>
    </>
  );

  return (
    <Sheet title="⚔️ BOJ" onClose={handleClose} help={helpContent}>
      {step === "setup" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT, letterSpacing: 0.8 }}>NEPŘÁTELÉ:</div>

          {/* Enemy list */}
          {enemies.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {enemies.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", background: C.red + "10", borderRadius: 4, marginBottom: 3, fontFamily: FONT, fontSize: 10 }}>
                  <span style={{ flex: 1, color: C.text }}>{e.name} <span style={{ color: C.muted }}>STR {e.str} BO {e.bo} {e.weapon} Zbroj {e.armor}</span></span>
                  <button onClick={() => removeEnemy(i)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14, fontFamily: FONT, padding: "0 4px", lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Add enemy controls */}
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {[["bestiary", "Bestiář"], ["custom", "Vlastní"]].map(([val, label]) => (
              <button key={val} onClick={() => setSource(val)} style={{ flex: 1, padding: "5px 0", border: `1px solid ${source === val ? C.red : C.border}`, background: source === val ? C.red + "22" : "transparent", borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: source === val ? 700 : 400, color: source === val ? C.red : C.muted }}>{label}</button>
            ))}
          </div>

          {source === "bestiary" ? (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select value={selectedIdx} onChange={e => setSelectedIdx(Number(e.target.value))} style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" }}>
                  {BESTIARY.map((b, i) => (
                    <option key={i} value={i}>{b.name}</option>
                  ))}
                </select>
                <button onClick={addEnemy} disabled={enemies.length >= MAX_ENEMIES} style={{ padding: "6px 12px", background: enemies.length >= MAX_ENEMIES ? C.border : C.red, color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: enemies.length >= MAX_ENEMIES ? "default" : "pointer" }}>+</button>
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, padding: "4px 2px 0" }}>
                STR {currentEnemy.str} · DEX {currentEnemy.dex} · WIL {currentEnemy.wil} · BO {currentEnemy.bo} · {currentEnemy.weaponName} {currentEnemy.weapon} · Zbroj {currentEnemy.armor}
                {currentEnemy.crit && <span style={{ color: C.red }}> · Krit: {currentEnemy.crit}</span>}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 8, display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input value={custom.name} onChange={e => setCustom(c => ({ ...c, name: e.target.value }))} placeholder="Název nepřítele" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" }} />
                <button onClick={addEnemy} disabled={enemies.length >= MAX_ENEMIES} style={{ padding: "6px 12px", background: enemies.length >= MAX_ENEMIES ? C.border : C.red, color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: enemies.length >= MAX_ENEMIES ? "default" : "pointer" }}>+</button>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {[["str", "STR"], ["dex", "DEX"], ["wil", "WIL"], ["bo", "BO"]].map(([key, label]) => (
                  <label key={key} style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
                    {label}
                    <input type="number" value={custom[key]} onChange={e => setCustom(c => ({ ...c, [key]: e.target.value }))} style={inputStyle} />
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
                  Zbraň
                  <select value={custom.weapon} onChange={e => setCustom(c => ({ ...c, weapon: e.target.value }))} style={{ ...inputStyle, width: 60 }}>
                    {dieCostky.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
                  Zbroj
                  <select value={custom.armor} onChange={e => setCustom(c => ({ ...c, armor: e.target.value }))} style={{ ...inputStyle, width: 50 }}>
                    {[0, 1, 2, 3].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT, letterSpacing: 0.8 }}>HRÁČ:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              DEX
              <input type="number" value={playerDex} onChange={e => setPlayerDex(Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              Zbraň
              <select value={weaponSource} onChange={e => {
                const v = e.target.value;
                setWeaponSource(v === "manual" ? "manual" : Number(v));
              }} style={{ ...inputStyle, width: weapons.length > 0 ? 120 : 60 }}>
                {weapons.map((w, i) => (
                  <option key={w._idx} value={i}>{w.nazev} ({w.dmg})</option>
                ))}
                <option value="manual">Jiná (ručně)...</option>
              </select>
            </label>
            {weaponSource === "manual" && (
              <select value={manualWeapon} onChange={e => setManualWeapon(e.target.value)} style={{ ...inputStyle, width: 60 }}>
                {dieCostky.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              Zbroj
              <span style={{ fontSize: 10, fontFamily: FONT, fontWeight: 700, color: C.text, padding: "4px 6px" }}>{autoArmor}</span>
            </label>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              Override
              <select value={armorOverride !== null ? armorOverride : ""} onChange={e => setArmorOverride(e.target.value === "" ? null : Number(e.target.value))} style={{ ...inputStyle, width: 50 }}>
                <option value="">—</option>
                {[0, 1, 2, 3].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>

          <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT, letterSpacing: 0.8 }}>MODIFIKÁTORY:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {[
              ["Překvapení", modSurprise, setModSurprise],
              ["Zesílený", modEnhanced, v => { setModEnhanced(v); if (v) setModImpaired(false); }],
              ["Zeslabený", modImpaired, v => { setModImpaired(v); if (v) setModEnhanced(false); }],
              ["Dvě zbraně", modDualWield, setModDualWield],
            ].map(([label, val, setter]) => (
              <label key={label} onClick={() => setter(!val)} style={{ fontSize: 10, fontFamily: FONT, color: val ? C.red : C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 14, height: 14, border: `1px solid ${val ? C.red : C.border}`, borderRadius: 3, background: val ? C.red + "22" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{val ? "✓" : ""}</span>
                {label}
              </label>
            ))}
          </div>

          {hireling && hireling.jmeno && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT, letterSpacing: 0.8 }}>POMOCNÍK:</div>
              <label onClick={() => setHirelingFights(!hirelingFights)} style={{ fontSize: 10, fontFamily: FONT, color: hirelingFights ? C.green : C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, marginBottom: 4 }}>
                <span style={{ width: 14, height: 14, border: `1px solid ${hirelingFights ? C.green : C.border}`, borderRadius: 3, background: hirelingFights ? C.green + "22" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{hirelingFights ? "✓" : ""}</span>
                {hireling.jmeno} bojuje
              </label>
              {hirelingFights && (
                <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, padding: "2px 0 0 17px" }}>
                  STR {hireling.str.akt}/{hireling.str.max} · DEX {hireling.dex.akt} · WIL {hireling.wil.akt} · BO {hireling.bo.akt}
                  {" · "}{hirelingWeaponName} ({hirelingWeapon}) · Zbroj {hirelingAutoArmor}
                  {hireling.vernost === "verny" && <span style={{ color: C.green }}> · věrný</span>}
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={doFight} disabled={enemies.length === 0 && !currentEnemy.name} style={{ flex: 2, height: 44, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>⚔️  BOJOVAT{enemies.length > 1 ? ` (${enemies.length})` : ""}</button>
            <button onClick={doFlee} disabled={enemies.length === 0 && !currentEnemy.name} style={{ flex: 1, height: 44, background: C.yellow, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>💨 ÚTĚK</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>
            {combatResult.enemies.map(e => `${e.name} (STR ${e.str}, BO ${e.bo}, ${e.weapon})`).join(" · ")}<br />
            Iniciativa: {combatResult.initText}
          </div>
          <div style={{ background: resultColor + "15", border: `2px solid ${resultColor}`, borderRadius: 8, padding: "10px", marginBottom: 10, fontFamily: FONT, fontSize: 10, maxHeight: 160, overflowY: "auto" }}>
            {combatResult.log.map((line, i) => (
              <div key={i} style={{ color: C.text, marginBottom: 2 }}>{line}</div>
            ))}
            <div style={{ fontWeight: 700, color: resultColor, marginTop: 6, fontSize: 12 }}>
              {combatResult.result === "victory" ? "🏆" : combatResult.result === "fled" || combatResult.result === "escape" || combatResult.result === "escape_hit" ? "💨" : "💀"} {resultLabel}
            </div>
            {combatResult.hirelingName && (
              <div style={{ fontSize: 10, color: combatResult.hirelingResult === "fought" ? C.green : combatResult.hirelingResult === "fled" ? C.yellow : C.red, marginTop: 2 }}>
                {combatResult.hirelingName}: {{ fought: "bojoval", fled: "utekl", fell: "padl" }[combatResult.hirelingResult]}
                {" "}(BO {combatResult.hirelingBoAfter}, STR {combatResult.hirelingStrAfter})
              </div>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
