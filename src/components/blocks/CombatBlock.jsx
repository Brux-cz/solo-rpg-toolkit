import { C, FONT } from "../../constants/theme.js";

export default function CombatBlock({ entry }) {
  const resultColor = entry.result === "victory" ? C.green : entry.result === "fled" ? C.yellow : C.red;
  const resultLabel = entry.result === "victory" ? "VÍTĚZSTVÍ" : entry.result === "fled" ? "NEPŘÍTEL UTEKL" : entry.result === "wounded" ? "PORANĚNÍ" : "SMRT";
  return (
    <div style={{ borderLeft: `3px solid ${C.red}`, background: C.red + "12", borderRadius: "0 4px 4px 0", padding: "6px 10px", margin: "6px 0", fontSize: 10, fontFamily: FONT }}>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>⚔️ Boj: {entry.enemyName} (STR {entry.enemyStr}, BO {entry.enemyBo}, {entry.enemyWeapon})</div>
      <div style={{ color: C.muted, marginBottom: 2 }}>Iniciativa: {entry.initiativeText}</div>
      {entry.log.map((line, i) => (
        <div key={i} style={{ color: C.muted }}>{line}</div>
      ))}
      <div style={{ fontWeight: 700, color: resultColor, marginTop: 4 }}>→ {resultLabel}</div>
    </div>
  );
}
