import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { BESTIARY } from "../../constants/bestiary.js";
import { rollWeapon } from "../../utils/dice.js";
import { resolveDamage, rollInitiative, rollMorale } from "../../utils/combat.js";
import Sheet from "../ui/Sheet.jsx";

export default function CombatSheet({ onClose, onInsert, character, onCharUpdate }) {
  const [step, setStep] = useState("setup");
  const [source, setSource] = useState("bestiary");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [custom, setCustom] = useState({ name: "", str: 8, dex: 8, wil: 8, bo: 3, weapon: "d6", armor: 0, weaponName: "Útok" });
  const [playerWeapon, setPlayerWeapon] = useState("d6");
  const [playerArmor, setPlayerArmor] = useState(0);
  const [playerDex, setPlayerDex] = useState(character.dex.akt);
  const [combatResult, setCombatResult] = useState(null);

  const enemy = source === "bestiary" ? BESTIARY[selectedIdx] : { ...custom, str: Number(custom.str), dex: Number(custom.dex), wil: Number(custom.wil), bo: Number(custom.bo), armor: Number(custom.armor) };

  const doFight = () => {
    const init = rollInitiative(playerDex);
    const log = [];
    let pBo = character.bo.akt, pStr = character.str.akt;
    let eBo = enemy.bo, eStr = enemy.str, eWil = enemy.wil;
    let result = null;
    let moraleChecked = false;

    const initText = init.playerFirst
      ? `Myši první (DEX ${playerDex}, d20=${init.d20})`
      : `Nepřítel první (DEX ${playerDex}, d20=${init.d20})`;

    for (let round = 1; round <= 20; round++) {
      const attackOrder = init.playerFirst ? ["player", "enemy"] : ["enemy", "player"];

      for (const attacker of attackOrder) {
        if (result) break;

        if (attacker === "player") {
          const dmgRoll = rollWeapon(playerWeapon);
          const res = resolveDamage(dmgRoll, enemy.armor, eBo, eStr);
          eBo = res.boAfter;
          eStr = res.strAfter;
          let line = `K${round}: Hráč ${playerWeapon}=${dmgRoll}`;
          if (enemy.armor > 0) line += `-${enemy.armor}zbroj`;
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
          if (res.dead) {
            line += " → mrtvý";
            log.push(line);
            result = "victory";
            break;
          }
          if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) {
              line += " → Poranění!";
              log.push(line);
              result = "victory";
              break;
            }
          }
          log.push(line);
          if (!moraleChecked && res.strAfter < res.strBefore) {
            const mor = rollMorale(eWil);
            const morLine = `  Morálka: WIL ${eWil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`;
            log.push(morLine);
            moraleChecked = true;
            if (!mor.stays) {
              result = "fled";
              break;
            }
          }
        } else {
          const dmgRoll = rollWeapon(enemy.weapon);
          const res = resolveDamage(dmgRoll, playerArmor, pBo, pStr);
          pBo = res.boAfter;
          pStr = res.strAfter;
          let line = `K${round}: ${enemy.name} ${enemy.weapon}=${dmgRoll}`;
          if (playerArmor > 0) line += `-${playerArmor}zbroj`;
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
          if (res.dead) {
            line += " → SMRT!";
            log.push(line);
            result = "death";
            break;
          }
          if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) {
              line += " → Poranění!";
              log.push(line);
              result = "wounded";
              break;
            }
          }
          log.push(line);
        }
      }
      if (result) break;
    }
    if (!result) result = "victory";

    setCombatResult({ log, result, initText, enemy: { ...enemy }, playerWeapon, playerBoAfter: pBo, playerStrAfter: pStr });
    setStep("result");
  };

  const doInsert = () => {
    if (onCharUpdate) {
      onCharUpdate({
        ...character,
        bo: { ...character.bo, akt: combatResult.playerBoAfter },
        str: { ...character.str, akt: combatResult.playerStrAfter },
      });
    }
    onInsert({
      type: "combat",
      enemyName: combatResult.enemy.name,
      enemyStr: combatResult.enemy.str,
      enemyBo: combatResult.enemy.bo,
      enemyWeapon: combatResult.enemy.weapon,
      initiativeText: combatResult.initText,
      log: combatResult.log,
      result: combatResult.result,
    });
    onClose();
  };

  const resultColor = combatResult?.result === "victory" ? C.green : combatResult?.result === "fled" ? C.yellow : C.red;
  const resultLabel = combatResult?.result === "victory" ? "VÍTĚZSTVÍ" : combatResult?.result === "fled" ? "NEPŘÍTEL UTEKL" : combatResult?.result === "wounded" ? "PORANĚNÍ" : "SMRT";
  const dieCostky = ["d4", "d6", "d8", "d10", "d12"];

  const inputStyle = { width: 50, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 11, fontFamily: FONT, textAlign: "center", background: "white", color: C.text, outline: "none" };

  return (
    <Sheet title="⚔️ BOJ" onClose={onClose}>
      {step === "setup" ? (
        <>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {[["bestiary", "Bestiář"], ["custom", "Vlastní"]].map(([val, label]) => (
              <button key={val} onClick={() => setSource(val)} style={{ flex: 1, padding: "5px 0", border: `1px solid ${source === val ? C.red : C.border}`, background: source === val ? C.red + "22" : "transparent", borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: source === val ? 700 : 400, color: source === val ? C.red : C.muted }}>{label}</button>
            ))}
          </div>

          {source === "bestiary" ? (
            <div style={{ marginBottom: 12 }}>
              <select value={selectedIdx} onChange={e => setSelectedIdx(Number(e.target.value))} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: FONT, background: "white", color: C.text, outline: "none", marginBottom: 6 }}>
                {BESTIARY.map((b, i) => (
                  <option key={i} value={i}>{b.name}</option>
                ))}
              </select>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, padding: "0 2px" }}>
                STR {enemy.str} · DEX {enemy.dex} · WIL {enemy.wil} · BO {enemy.bo} · {enemy.weaponName} {enemy.weapon} · Zbroj {enemy.armor}
                {enemy.crit && <span style={{ color: C.red }}> · Krit: {enemy.crit}</span>}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <input value={custom.name} onChange={e => setCustom(c => ({ ...c, name: e.target.value }))} placeholder="Název nepřítele" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" }} />
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
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              DEX
              <input type="number" value={playerDex} onChange={e => setPlayerDex(Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              Zbraň
              <select value={playerWeapon} onChange={e => setPlayerWeapon(e.target.value)} style={{ ...inputStyle, width: 60 }}>
                {dieCostky.map(d => <option key={d} value={d}>{d === "d4" ? "d4 (zeslab.)" : d === "d12" ? "d12 (zesíl.)" : d}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              Zbroj
              <select value={playerArmor} onChange={e => setPlayerArmor(Number(e.target.value))} style={{ ...inputStyle, width: 50 }}>
                {[0, 1, 2, 3].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>

          <button onClick={doFight} style={{ width: "100%", height: 46, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>⚔️  BOJOVAT</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>
            {combatResult.enemy.name} · STR {combatResult.enemy.str} · BO {combatResult.enemy.bo} · {combatResult.enemy.weapon}<br />
            Iniciativa: {combatResult.initText}
          </div>
          <div style={{ background: resultColor + "15", border: `2px solid ${resultColor}`, borderRadius: 8, padding: "10px", marginBottom: 10, fontFamily: FONT, fontSize: 10, maxHeight: 160, overflowY: "auto" }}>
            {combatResult.log.map((line, i) => (
              <div key={i} style={{ color: C.text, marginBottom: 2 }}>{line}</div>
            ))}
            <div style={{ fontWeight: 700, color: resultColor, marginTop: 6, fontSize: 12 }}>
              {combatResult.result === "victory" ? "🏆" : combatResult.result === "fled" ? "💨" : "💀"} {resultLabel}
            </div>
          </div>
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      )}
    </Sheet>
  );
}
