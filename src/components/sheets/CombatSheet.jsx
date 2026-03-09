import { useState, useMemo, useRef, useEffect } from "react";
import { C, FONT } from "../../constants/theme.js";
import { BESTIARY } from "../../constants/bestiary.js";
import { rollWeapon, roll } from "../../utils/dice.js";
import { resolveDamage, rollInitiative, rollMorale, rollMoraleAdvantage, assessDanger } from "../../utils/combat.js";
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

function BoBar({ current, max }) {
  const blocks = Math.max(max, 1);
  let bar = "";
  for (let i = 0; i < blocks; i++) bar += i < current ? "█" : "░";
  return <span>{bar} {current}</span>;
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

  // Fighting state
  const [round, setRound] = useState(0);
  const [fightState, setFightState] = useState(null);
  // Per-round modifiers (can change during fighting)
  const [fightEnhanced, setFightEnhanced] = useState(false);
  const [fightImpaired, setFightImpaired] = useState(false);

  const logRef = useRef(null);

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

  // Danger assessment
  const dangerEnemies = enemies.length > 0 ? enemies : (currentEnemy.name ? [currentEnemy] : []);
  const danger = dangerEnemies.length > 0 ? assessDanger({
    playerBo: character.bo.akt, playerStr: character.str.akt, playerArmor,
    hirelingBo: hirelingFights && hireling ? hireling.bo.akt : 0,
    hirelingStr: hirelingFights && hireling ? hireling.str.akt : 0,
    hirelingArmor: hirelingAutoArmor,
  }, dangerEnemies) : null;

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

  // Auto-scroll log down
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [fightState?.log?.length]);

  // ─── START FIGHT ───
  const startFight = () => {
    const fightEnemies = enemies.length > 0 ? enemies : [currentEnemy];
    const init = modSurprise
      ? { d20: 0, playerFirst: true }
      : rollInitiative(playerDex);
    const initText = modSurprise
      ? "Myši první (překvapení)"
      : init.playerFirst
        ? `Myši první (DEX ${playerDex}, d20=${init.d20})`
        : `Nepřítel první (DEX ${playerDex}, d20=${init.d20})`;

    const hActive = hirelingFights && hireling;
    const hName = hireling?.jmeno || "Pomocník";

    setFightState({
      enemies: fightEnemies.map(e => ({
        ...e, bo: e.bo, str: e.str, wil: e.wil || 8,
        alive: true, moraleChecked: false,
      })),
      fightEnemies, // original enemy data for result
      playerBo: character.bo.akt,
      playerStr: character.str.akt,
      hirelingBo: hActive ? hireling.bo.akt : 0,
      hirelingStr: hActive ? hireling.str.akt : 0,
      hirelingAlive: !!hActive,
      hirelingFled: false,
      hirelingMoraleChecked: false,
      hName,
      initiative: { playerFirst: init.playerFirst, d20: init.d20 },
      initText,
      log: [`Iniciativa: ${initText}`],
      roundLog: [],
      selectedTarget: 0,
    });
    setFightEnhanced(modEnhanced);
    setFightImpaired(modImpaired);
    setRound(1);
    setStep("fighting");
  };

  // ─── EXECUTE ONE ROUND ───
  const executeRound = () => {
    if (!fightState) return;
    const fs = { ...fightState };
    fs.enemies = fs.enemies.map(e => ({ ...e }));
    const roundNum = round;
    const newLog = [];
    let result = null;

    const attackOrder = fs.initiative.playerFirst ? ["player", "enemies"] : ["enemies", "player"];

    const rollPlayerDmg = () => {
      const isEnhanced = fightEnhanced || (modSurprise && roundNum === 1);
      const effectiveWeapon = fightImpaired ? "d4" : isEnhanced ? "d12" : playerWeapon;
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
      if (fs.hirelingFled || !fs.hirelingAlive || fs.hirelingMoraleChecked) return;
      fs.hirelingMoraleChecked = true;
      const hWil = hireling.wil.akt;
      if (hireling.vernost === "verny") {
        const mor = rollMoraleAdvantage(hWil);
        newLog.push(`  Morálka ${fs.hName} (${trigger}): WIL ${hWil}, 2d20=${mor.d20a},${mor.d20b} → ${mor.best} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
        if (!mor.stays) { fs.hirelingFled = true; fs.hirelingAlive = false; }
      } else {
        const mor = rollMorale(hWil);
        newLog.push(`  Morálka ${fs.hName} (${trigger}): WIL ${hWil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
        if (!mor.stays) { fs.hirelingFled = true; fs.hirelingAlive = false; }
      }
    };

    for (const side of attackOrder) {
      if (result) break;

      if (side === "player") {
        // Player attacks selected target
        const targetIdx = fs.selectedTarget;
        const es = fs.enemies[targetIdx];
        if (!es || !es.alive) {
          // Find first alive if selected is dead
          const fallback = fs.enemies.findIndex(e => e.alive);
          if (fallback === -1) { result = "victory"; break; }
          fs.selectedTarget = fallback;
          // Use fallback
          const fbEs = fs.enemies[fallback];
          const { dmg: dmgRoll, label: dmgLabel } = rollPlayerDmg();
          const res = resolveDamage(dmgRoll, fbEs.armor, fbEs.bo, fbEs.str);
          fbEs.bo = res.boAfter;
          fbEs.str = res.strAfter;
          const nameTag = fs.enemies.length > 1 ? ` → ${fbEs.name}` : "";
          let line = formatDmgLine(dmgRoll, fbEs.armor, res, `K${roundNum}: Hráč${nameTag} ${dmgLabel}`);
          if (res.dead) { line += " → mrtvý"; newLog.push(line); fbEs.alive = false; if (fs.enemies.every(e => !e.alive)) { result = "victory"; break; } }
          else if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) {
              line += " → Poranění!"; newLog.push(line); fbEs.alive = false;
              if (!fbEs.moraleChecked) { const mor = rollMorale(fbEs.wil); newLog.push(`  Morálka ${fbEs.name}: WIL ${fbEs.wil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`); fbEs.moraleChecked = true; if (!mor.stays) { fbEs.alive = false; if (fs.enemies.every(e => !e.alive)) { result = "fled"; break; } } }
              if (fs.enemies.every(e => !e.alive)) { result = "victory"; break; }
            } else { newLog.push(line); }
          } else { newLog.push(line); }
        } else {
          // Attack selected target
          const { dmg: dmgRoll, label: dmgLabel } = rollPlayerDmg();
          const res = resolveDamage(dmgRoll, es.armor, es.bo, es.str);
          es.bo = res.boAfter;
          es.str = res.strAfter;
          const nameTag = fs.enemies.length > 1 ? ` → ${es.name}` : "";
          let line = formatDmgLine(dmgRoll, es.armor, res, `K${roundNum}: Hráč${nameTag} ${dmgLabel}`);
          if (res.dead) {
            line += " → mrtvý"; newLog.push(line); es.alive = false;
            if (fs.enemies.every(e => !e.alive)) { result = "victory"; break; }
          } else if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) {
              line += " → Poranění!"; newLog.push(line); es.alive = false;
              if (!es.moraleChecked) {
                const mor = rollMorale(es.wil);
                newLog.push(`  Morálka ${es.name}: WIL ${es.wil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
                es.moraleChecked = true;
                if (!mor.stays) { es.alive = false; if (fs.enemies.every(e => !e.alive)) { result = "fled"; break; } }
              }
              if (fs.enemies.every(e => !e.alive)) { result = "victory"; break; }
            } else { newLog.push(line); }
          } else { newLog.push(line); }
        }

        // Hireling attacks
        if (fs.hirelingAlive && !fs.hirelingFled && !result) {
          const aliveIndices = fs.enemies.map((e, i) => e.alive ? i : -1).filter(i => i >= 0);
          if (aliveIndices.length === 0) { result = "victory"; break; }
          const playerTarget = fs.selectedTarget;
          const hTargetIdx = aliveIndices.length > 1
            ? (aliveIndices.find(i => i !== playerTarget) ?? aliveIndices[0])
            : aliveIndices[0];
          const hEnemy = fs.enemies[hTargetIdx];
          const effectiveHWeapon = (modSurprise && roundNum === 1) ? "d12" : hirelingWeapon;
          const hDmg = rollWeapon(effectiveHWeapon);
          const hRes = resolveDamage(hDmg, hEnemy.armor, hEnemy.bo, hEnemy.str);
          hEnemy.bo = hRes.boAfter;
          hEnemy.str = hRes.strAfter;
          const hNameTag = fs.enemies.length > 1 ? ` → ${hEnemy.name}` : "";
          let hLine = formatDmgLine(hDmg, hEnemy.armor, hRes, `K${roundNum}: ${fs.hName}${hNameTag} ${effectiveHWeapon}=${hDmg}`);
          if (hRes.dead) {
            hLine += " → mrtvý"; newLog.push(hLine); hEnemy.alive = false;
            if (fs.enemies.every(e => !e.alive)) { result = "victory"; break; }
          } else if (hRes.strSave !== null) {
            hLine += ` → STR save d20=${hRes.strSave} ${hRes.strSaveResult ? "OK" : "FAIL"}`;
            if (hRes.wounded) {
              hLine += " → Poranění!"; newLog.push(hLine); hEnemy.alive = false;
              if (!hEnemy.moraleChecked) {
                const mor = rollMorale(hEnemy.wil);
                newLog.push(`  Morálka ${hEnemy.name}: WIL ${hEnemy.wil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`);
                hEnemy.moraleChecked = true;
                if (!mor.stays) { hEnemy.alive = false; if (fs.enemies.every(e => !e.alive)) { result = "fled"; break; } }
              }
              if (fs.enemies.every(e => !e.alive)) { result = "victory"; break; }
            } else { newLog.push(hLine); }
          } else { newLog.push(hLine); }
        }
      } else {
        // Enemies attack
        const aliveEnemies = fs.enemies.map((e, i) => ({ e, i })).filter(({ i }) => fs.enemies[i].alive);
        for (const { e: enemy, i: ei } of aliveEnemies) {
          if (result) break;
          let targetIsHireling = false;
          if (fs.hirelingAlive && !fs.hirelingFled) {
            if (aliveEnemies.length === 1) { targetIsHireling = roundNum % 2 === 0; }
            else { targetIsHireling = ei % 2 === 1; }
          }

          if (targetIsHireling) {
            const dmgRoll = rollWeapon(enemy.weapon);
            const res = resolveDamage(dmgRoll, hirelingAutoArmor, fs.hirelingBo, fs.hirelingStr);
            fs.hirelingBo = res.boAfter;
            fs.hirelingStr = res.strAfter;
            let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `K${roundNum}: ${enemy.name} → ${fs.hName} ${enemy.weapon}=${dmgRoll}`);
            if (res.dead) {
              line += ` → ${fs.hName} padl!`; newLog.push(line); fs.hirelingAlive = false; continue;
            }
            if (res.strSave !== null) {
              line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
              if (res.wounded) { line += ` → ${fs.hName} poraněn!`; newLog.push(line); fs.hirelingAlive = false; checkHirelingMorale("kritické zranění"); continue; }
            }
            newLog.push(line);
          } else {
            const dmgRoll = rollWeapon(enemy.weapon);
            const res = resolveDamage(dmgRoll, playerArmor, fs.playerBo, fs.playerStr);
            fs.playerBo = res.boAfter;
            fs.playerStr = res.strAfter;
            let line = formatDmgLine(dmgRoll, playerArmor, res, `K${roundNum}: ${enemy.name} ${enemy.weapon}=${dmgRoll}`);
            if (res.dead) {
              line += " → SMRT!"; newLog.push(line);
              if (fs.hirelingAlive && !fs.hirelingFled) checkHirelingMorale("hráč padl");
              result = "death"; break;
            }
            if (res.strSave !== null) {
              line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
              if (res.wounded) {
                line += " → Poranění!"; newLog.push(line);
                if (fs.hirelingAlive && !fs.hirelingFled) checkHirelingMorale("hráč poraněn");
                result = "wounded"; break;
              }
            }
            newLog.push(line);
          }
        }
      }
    }

    fs.log = [...fs.log, ...newLog];
    fs.roundLog = newLog;

    // Auto-select first alive target if current is dead
    if (!result) {
      const alive = fs.enemies.findIndex(e => e.alive);
      if (alive === -1) result = "victory";
      else if (!fs.enemies[fs.selectedTarget]?.alive) fs.selectedTarget = alive;
    }

    if (result) {
      finishFight(fs, result);
    } else {
      setFightState(fs);
      setRound(r => r + 1);
    }
  };

  // ─── EXECUTE FLEE ───
  const executeFlee = () => {
    if (!fightState) return;
    const fs = { ...fightState };
    fs.enemies = fs.enemies.map(e => ({ ...e }));
    const newLog = [];

    const dexRoll = roll(20);
    const success = dexRoll <= character.dex.akt;
    let result = null;
    let fleeWounded = false;

    newLog.push(`Útěk: DEX záchrana d20=${dexRoll} vs DEX ${character.dex.akt} → ${success ? "ÚSPĚCH" : "NEÚSPĚCH"}`);

    // Hireling DEX save
    let hFleeSuccess = true;
    if (fs.hirelingAlive && !fs.hirelingFled) {
      const hDexRoll = roll(20);
      hFleeSuccess = hDexRoll <= hireling.dex.akt;
      newLog.push(`${fs.hName} útěk: DEX záchrana d20=${hDexRoll} vs DEX ${hireling.dex.akt} → ${hFleeSuccess ? "ÚSPĚCH" : "NEÚSPĚCH"}`);
    }

    if (success) {
      newLog.push("Bezpečný únik!");
    } else {
      const aliveEnemies = fs.enemies.filter(e => e.alive);
      const allNames = aliveEnemies.map(e => e.name).join(", ");
      newLog.push(`Neúspěch → ${aliveEnemies.length > 1 ? "všichni nepřátelé mají" : `${allNames} má`} volný útok!`);

      for (let ei = 0; ei < aliveEnemies.length; ei++) {
        const enemy = aliveEnemies[ei];
        if (fs.playerStr <= 0) break;
        const targetIsHireling = fs.hirelingAlive && !fs.hirelingFled && !hFleeSuccess && ei % 2 === 1 && aliveEnemies.length > 1;
        if (targetIsHireling) {
          const dmgRoll = rollWeapon(enemy.weapon);
          const res = resolveDamage(dmgRoll, hirelingAutoArmor, fs.hirelingBo, fs.hirelingStr);
          fs.hirelingBo = res.boAfter;
          fs.hirelingStr = res.strAfter;
          let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `${enemy.name} → ${fs.hName} ${enemy.weapon}=${dmgRoll}`);
          if (res.strSave !== null) line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
          if (res.dead || res.wounded) { fs.hirelingAlive = false; line += ` → ${fs.hName} ${res.dead ? "padl" : "poraněn"}!`; }
          newLog.push(line);
        } else {
          const dmgRoll = rollWeapon(enemy.weapon);
          const res = resolveDamage(dmgRoll, playerArmor, fs.playerBo, fs.playerStr);
          fs.playerBo = res.boAfter;
          fs.playerStr = res.strAfter;
          let line = formatDmgLine(dmgRoll, playerArmor, res, `${enemy.name} ${enemy.weapon}=${dmgRoll}`);
          if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) { line += " → Poranění!"; fleeWounded = true; }
          }
          if (res.dead) line += " → SMRT!";
          newLog.push(line);
        }
      }

      // Hireling failed separately (single enemy)
      if (fs.hirelingAlive && !hFleeSuccess && aliveEnemies.length === 1) {
        const enemy = aliveEnemies[0];
        const dmgRoll = rollWeapon(enemy.weapon);
        const res = resolveDamage(dmgRoll, hirelingAutoArmor, fs.hirelingBo, fs.hirelingStr);
        fs.hirelingBo = res.boAfter;
        fs.hirelingStr = res.strAfter;
        let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `${enemy.name} → ${fs.hName} ${enemy.weapon}=${dmgRoll}`);
        if (res.strSave !== null) line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
        if (res.dead || res.wounded) { fs.hirelingAlive = false; line += ` → ${fs.hName} ${res.dead ? "padl" : "poraněn"}!`; }
        newLog.push(line);
      }

      if (fs.playerStr > 0) newLog.push("Únik po zásahu.");
    }

    result = fs.playerStr <= 0 ? "death" : success ? "escape" : "escape_hit";

    fs.log = [...fs.log, ...newLog];
    fs.roundLog = newLog;
    fs.playerWounded = fleeWounded;
    finishFight(fs, result);
  };

  // ─── RESOLVE WEAR ───
  const resolveWear = (fs) => {
    const wearLog = [];
    const invChanges = {};
    const hActive = hirelingFights && hireling;
    const hName = fs.hName;

    // Player weapon wear
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

    // Player armor wear
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

    // Hireling wear
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

    return { wearLog, invChanges, hInvChanges };
  };

  // ─── FINISH FIGHT → RESULT ───
  const finishFight = (fs, result) => {
    const { wearLog, invChanges, hInvChanges } = resolveWear(fs);
    if (wearLog.length > 0) {
      fs.log = [...fs.log, "--- Opotřebení ---", ...wearLog];
    }

    const hActive = hirelingFights && hireling;
    const hirelingResult = hActive ? (fs.hirelingFled ? "fled" : fs.hirelingAlive ? "fought" : "fell") : null;

    setCombatResult({
      log: fs.log,
      result,
      initText: fs.initText,
      enemies: fs.fightEnemies.map(e => ({ ...e })),
      playerWeapon,
      playerBoAfter: fs.playerBo,
      playerStrAfter: fs.playerStr,
      invChanges,
      playerWounded: fs.playerWounded || false,
      hirelingName: hActive ? fs.hName : null,
      hirelingId: hActive ? hireling.id : null,
      hirelingBoAfter: fs.hirelingBo,
      hirelingStrAfter: fs.hirelingStr,
      hirelingResult,
      hirelingInvChanges: Object.keys(hInvChanges).length > 0 ? hInvChanges : null,
    });
    setFightState(null);
    setStep("result");
  };

  // ─── INSERT RESULT ───
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
      if (combatResult.hirelingId && updatedChar.pomocnici) {
        updatedChar.pomocnici = updatedChar.pomocnici.map(p =>
          p.id === combatResult.hirelingId
            ? { ...p, bo: { ...p.bo, akt: combatResult.hirelingBoAfter }, str: { ...p.str, akt: combatResult.hirelingStrAfter } }
            : p
        );
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
    // fighting step = annul (no write-back)
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
        Interaktivní boj kolo po kole. Vyber cíl, zaútoč nebo uteč — rozhoduješ každé kolo!
      </div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.red + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: myš narazí v mlýně na agresivní krysu. Boj je nevyhnutelný!
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>1. Přidej nepřátele</div>
      <div style={{ marginBottom: 10 }}>
        Vyber z bestiáře (12 tvorů) nebo vytvoř vlastního nepřítele. Můžeš přidat až 5.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>2. Nastav výbavu + danger</div>
      <div style={{ marginBottom: 10 }}>
        Appka načte zbraň/zbroj z inventáře. Barevný ukazatel nebezpečnosti ukáže šance.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>3. Bojuj kolo po kole</div>
      <div style={{ marginBottom: 10 }}>
        Každé kolo volíš cíl útoku. Můžeš kdykoli zkusit útěk (DEX záchrana). Modifikátory se dají měnit per-kolo.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.red }}>4. Výsledek</div>
      <div>
        Zranění se zapíše na postavu. Zbraně se mohou opotřebit. Výsledek jde do deníku.
      </div>
    </>
  );

  // ─── FIGHTING UI ───
  if (step === "fighting" && fightState) {
    const fs = fightState;
    const aliveCount = fs.enemies.filter(e => e.alive).length;
    const selectedEnemy = fs.enemies[fs.selectedTarget];

    return (
      <Sheet title={`K${round} ⚔️ BOJ`} onClose={handleClose}>
        {/* Combatants */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, fontFamily: FONT, letterSpacing: 0.8 }}>BOJOVNÍCI:</div>

          {/* Player */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", background: C.green + "10", borderRadius: 4, marginBottom: 2, fontFamily: FONT, fontSize: 10 }}>
            <span>🐭</span>
            <span style={{ flex: 1, color: C.text, fontWeight: 600 }}>
              {character.jmeno || "Hráč"}
            </span>
            <span style={{ color: C.muted, fontSize: 9 }}>
              BO <BoBar current={fs.playerBo} max={character.bo.max} /> STR {fs.playerStr}
            </span>
          </div>

          {/* Hireling */}
          {fs.hirelingAlive && !fs.hirelingFled && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", background: C.green + "08", borderRadius: 4, marginBottom: 2, fontFamily: FONT, fontSize: 10 }}>
              <span>🗡️</span>
              <span style={{ flex: 1, color: C.text }}>{fs.hName}</span>
              <span style={{ color: C.muted, fontSize: 9 }}>
                BO <BoBar current={fs.hirelingBo} max={hireling?.bo?.max || 0} /> STR {fs.hirelingStr}
              </span>
            </div>
          )}
          {fs.hirelingFled && (
            <div style={{ padding: "3px 6px", fontFamily: FONT, fontSize: 10, color: C.yellow, textDecoration: "line-through" }}>
              🗡️ {fs.hName} — utekl
            </div>
          )}
          {!fs.hirelingAlive && !fs.hirelingFled && hirelingFights && (
            <div style={{ padding: "3px 6px", fontFamily: FONT, fontSize: 10, color: C.red, textDecoration: "line-through" }}>
              🗡️ {fs.hName} — padl
            </div>
          )}

          <div style={{ borderTop: `1px solid ${C.border}`, margin: "4px 0" }} />

          {/* Enemies */}
          {fs.enemies.map((e, i) => {
            const isSelected = i === fs.selectedTarget;
            const isAlive = e.alive;
            return (
              <div
                key={i}
                onClick={() => isAlive && setFightState(prev => ({ ...prev, selectedTarget: i }))}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "3px 6px",
                  background: isSelected && isAlive ? C.red + "18" : "transparent",
                  border: isSelected && isAlive ? `1px solid ${C.red}40` : "1px solid transparent",
                  borderRadius: 4, marginBottom: 2,
                  fontFamily: FONT, fontSize: 10,
                  cursor: isAlive ? "pointer" : "default",
                  opacity: isAlive ? 1 : 0.4,
                  textDecoration: isAlive ? "none" : "line-through",
                }}
              >
                <span>{isAlive ? "🐀" : "☠️"}</span>
                <span style={{ flex: 1, color: isAlive ? C.text : C.muted }}>
                  {e.name}
                </span>
                <span style={{ color: C.muted, fontSize: 9 }}>
                  BO <BoBar current={e.bo} max={fs.fightEnemies[i].bo} /> STR {e.str}
                </span>
                {isSelected && isAlive && <span style={{ color: C.red, fontWeight: 700 }}>◀</span>}
              </div>
            );
          })}
        </div>

        {/* Combat log */}
        <div
          ref={logRef}
          style={{
            flex: 1, minHeight: 60, maxHeight: 120,
            overflowY: "auto",
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: "6px 8px",
            marginBottom: 6,
            fontFamily: FONT, fontSize: 9, color: C.text,
          }}
        >
          {fs.log.map((line, i) => {
            const isNew = i >= fs.log.length - fs.roundLog.length;
            return (
              <div key={i} style={{ marginBottom: 1, fontWeight: isNew ? 600 : 400, color: isNew ? C.text : C.muted }}>
                {line}
              </div>
            );
          })}
        </div>

        {/* Per-round modifiers */}
        <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          {[
            ["Zesílený", fightEnhanced, v => { setFightEnhanced(v); if (v) setFightImpaired(false); }],
            ["Zeslabený", fightImpaired, v => { setFightImpaired(v); if (v) setFightEnhanced(false); }],
          ].map(([label, val, setter]) => (
            <label key={label} onClick={() => setter(!val)} style={{ fontSize: 10, fontFamily: FONT, color: val ? C.red : C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 14, height: 14, border: `1px solid ${val ? C.red : C.border}`, borderRadius: 3, background: val ? C.red + "22" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{val ? "✓" : ""}</span>
              {label}
            </label>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={executeRound}
            disabled={aliveCount === 0}
            style={{
              flex: 2, height: 44,
              background: C.red, color: "white",
              border: "none", borderRadius: 8,
              fontSize: 12, fontWeight: 700, fontFamily: FONT,
              cursor: aliveCount === 0 ? "default" : "pointer",
              opacity: aliveCount === 0 ? 0.5 : 1,
            }}
          >
            ⚔️ ÚTOK{selectedEnemy?.alive ? ` na ${selectedEnemy.name}` : ""}
          </button>
          <button
            onClick={executeFlee}
            style={{
              flex: 1, height: 44,
              background: C.yellow, color: "white",
              border: "none", borderRadius: 8,
              fontSize: 12, fontWeight: 700, fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            💨 ÚTĚK
          </button>
        </div>
      </Sheet>
    );
  }

  // ─── RESULT UI ───
  if (step === "result" && combatResult) {
    return (
      <Sheet title="⚔️ BOJ" onClose={handleClose}>
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
      </Sheet>
    );
  }

  // ─── SETUP UI ───
  return (
    <Sheet title="⚔️ BOJ" onClose={handleClose} help={helpContent}>
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

      {/* Danger Assessment */}
      {danger && (
        <div style={{ marginBottom: 10, padding: "8px 10px", background: danger.color + "12", border: `1px solid ${danger.color}40`, borderRadius: 8, fontFamily: FONT }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>{danger.level === "safe" ? "✅" : danger.level === "even" ? "⚖️" : "⚠️"}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: danger.color }}>{danger.text}</span>
          </div>
          {/* Danger bar */}
          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: danger.soloWarning ? 4 : 0 }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, Math.max(10, danger.ratio * 50))}%`,
              background: danger.color,
              borderRadius: 3,
              transition: "width 0.3s",
            }} />
          </div>
          {danger.soloWarning && (
            <div style={{ fontSize: 9, color: danger.color, fontWeight: 600, marginTop: 2 }}>
              ⚠ {danger.soloWarning}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={startFight} disabled={enemies.length === 0 && !currentEnemy.name} style={{ flex: 2, height: 44, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>⚔️  BOJOVAT{enemies.length > 1 ? ` (${enemies.length})` : ""}</button>
        <button onClick={() => {
          // Quick flee from setup (same as old doFlee)
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
            for (let ei = 0; ei < fightEnemies.length; ei++) {
              const enemy = fightEnemies[ei];
              if (pStr <= 0) break;
              const targetIsHireling = hActive && hAlive && !hFleeSuccess && ei % 2 === 1 && fightEnemies.length > 1;
              if (targetIsHireling) {
                const dmgRoll = rollWeapon(enemy.weapon);
                const res = resolveDamage(dmgRoll, hirelingAutoArmor, hBo, hStr);
                hBo = res.boAfter; hStr = res.strAfter;
                let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `${enemy.name} → ${hName} ${enemy.weapon}=${dmgRoll}`);
                if (res.strSave !== null) line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
                if (res.dead || res.wounded) { hAlive = false; line += ` → ${hName} ${res.dead ? "padl" : "poraněn"}!`; }
                log.push(line);
              } else {
                const dmgRoll = rollWeapon(enemy.weapon);
                const res = resolveDamage(dmgRoll, playerArmor, pBo, pStr);
                pBo = res.boAfter; pStr = res.strAfter;
                let line = formatDmgLine(dmgRoll, playerArmor, res, `${enemy.name} ${enemy.weapon}=${dmgRoll}`);
                if (res.strSave !== null) {
                  line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
                  if (res.wounded) { line += " → Poranění!"; fleeWounded = true; }
                }
                if (res.dead) line += " → SMRT!";
                log.push(line);
              }
            }
            if (hActive && !hFleeSuccess && fightEnemies.length === 1 && hAlive) {
              const enemy = fightEnemies[0];
              const dmgRoll = rollWeapon(enemy.weapon);
              const res = resolveDamage(dmgRoll, hirelingAutoArmor, hBo, hStr);
              hBo = res.boAfter; hStr = res.strAfter;
              let line = formatDmgLine(dmgRoll, hirelingAutoArmor, res, `${enemy.name} → ${hName} ${enemy.weapon}=${dmgRoll}`);
              if (res.strSave !== null) line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
              if (res.dead || res.wounded) { hAlive = false; line += ` → ${hName} ${res.dead ? "padl" : "poraněn"}!`; }
              log.push(line);
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
        }} disabled={enemies.length === 0 && !currentEnemy.name} style={{ flex: 1, height: 44, background: C.yellow, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>💨 ÚTĚK</button>
      </div>
    </Sheet>
  );
}
