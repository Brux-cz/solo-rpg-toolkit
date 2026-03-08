import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { roll } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

export default function RestSheet({ onClose, character, onCharUpdate, onInsert }) {
  const [phase, setPhase] = useState("choose"); // choose | healPick | result
  const [resultText, setResultText] = useState(null);

  const ch = character;

  const doShortRest = () => {
    const healed = roll(6) + 1;
    const noveBo = Math.min(ch.bo.max, ch.bo.akt + healed);
    const actual = noveBo - ch.bo.akt;
    onCharUpdate({ ...ch, bo: { ...ch.bo, akt: noveBo } });
    const text = `Krátký odpočinek: d6+1=${healed} → BO ${ch.bo.akt}→${noveBo} (+${actual})`;
    setResultText(text);
    setPhase("result");
    onInsert({ type: "text", text: `💤 ${text}` });
  };

  const doLongRest = (healStat) => {
    const updated = { ...ch };
    const lines = ["Dlouhý odpočinek (6 hod, 1 zásoby):"];

    // BO na maximum
    const boWasMax = updated.bo.akt >= updated.bo.max;
    updated.bo = { ...updated.bo, akt: updated.bo.max };
    lines.push(`BO → ${updated.bo.max} (max)`);

    // Léčení vlastnosti pokud BO byly plné
    if (healStat && boWasMax) {
      const healed = roll(6);
      const stat = updated[healStat];
      const noveAkt = Math.min(stat.max, stat.akt + healed);
      const actual = noveAkt - stat.akt;
      updated[healStat] = { ...stat, akt: noveAkt };
      lines.push(`${healStat.toUpperCase()}: d6=${healed} → ${stat.akt}→${noveAkt} (+${actual})`);
    }

    // Škrtni 1 tečku zásoby z inventáře
    const inv = [...(updated.inventar || [])];
    let consumed = false;
    for (let i = 0; i < inv.length; i++) {
      if (inv[i].typ === "zásoby" && inv[i].tecky?.akt > 0) {
        inv[i] = { ...inv[i], tecky: { ...inv[i].tecky, akt: inv[i].tecky.akt - 1 } };
        consumed = true;
        lines.push(`Zásoby: −1 tečka (zbývá ${inv[i].tecky.akt}/${inv[i].tecky.max})`);
        break;
      }
    }
    if (!consumed) lines.push("⚠ Žádné zásoby k spotřebování!");
    updated.inventar = inv;

    onCharUpdate(updated);
    const text = lines.join("\n");
    setResultText(text);
    setPhase("result");
    onInsert({ type: "text", text: `💤 ${text}` });
  };

  const doFullRest = () => {
    const updated = { ...ch };
    updated.bo = { ...updated.bo, akt: updated.bo.max };
    updated.str = { ...updated.str, akt: updated.str.max };
    updated.dex = { ...updated.dex, akt: updated.dex.max };
    updated.wil = { ...updated.wil, akt: updated.wil.max };
    onCharUpdate(updated);
    const text = "Úplný odpočinek (týden): vše obnoveno na maximum.";
    setResultText(text);
    setPhase("result");
    onInsert({ type: "text", text: `💤 ${text}` });
  };

  const handleLongRest = () => {
    const boFull = ch.bo.akt >= ch.bo.max;
    const anyDamaged = ["str", "dex", "wil"].some(k => ch[k].akt < ch[k].max);
    if (boFull && anyDamaged) {
      setPhase("healPick");
    } else {
      doLongRest(null);
    }
  };

  const btnStyle = (color) => ({
    width: "100%", padding: "10px 0", background: color, color: "white",
    border: "none", borderRadius: 6, fontSize: 12, fontFamily: FONT,
    fontWeight: 700, cursor: "pointer", marginBottom: 8,
  });

  const descStyle = { fontSize: 10, color: C.muted, marginBottom: 8, lineHeight: 1.4 };

  return (
    <Sheet title="Odpočinek" onClose={onClose}>
      <div style={{ padding: "0 16px 16px" }}>
        {phase === "choose" && (
          <>
            <div style={descStyle}>Krátký (10 min, voda): obnoví d6+1 BO</div>
            <button onClick={doShortRest} style={btnStyle(C.green)}>💤 Krátký odpočinek</button>

            <div style={descStyle}>Dlouhý (6 hod, jídlo + spánek): obnoví BO. Pokud BO plné → léčí d6 vlastnosti.</div>
            <button onClick={handleLongRest} style={btnStyle(C.blue)}>🛏️ Dlouhý odpočinek</button>

            <div style={descStyle}>Úplný (týden v bezpečí): obnoví vše na maximum.</div>
            <button onClick={doFullRest} style={btnStyle(C.purple)}>🏠 Úplný odpočinek</button>
          </>
        )}

        {phase === "healPick" && (
          <>
            <div style={{ fontSize: 11, color: C.text, marginBottom: 10, fontWeight: 700 }}>BO jsou plné — vyber vlastnost k léčení (d6):</div>
            {["str", "dex", "wil"].map(key => {
              const s = ch[key];
              const damaged = s.akt < s.max;
              return (
                <button key={key} onClick={() => doLongRest(key)} disabled={!damaged} style={{
                  ...btnStyle(damaged ? C.green : C.border),
                  color: damaged ? "white" : C.muted,
                  cursor: damaged ? "pointer" : "default",
                }}>
                  {key.toUpperCase()} ({s.akt}/{s.max})
                </button>
              );
            })}
          </>
        )}

        {phase === "result" && (
          <div style={{ padding: "10px", background: "#f0f0ee", borderRadius: 6, fontSize: 11, fontFamily: FONT, color: C.text, whiteSpace: "pre-line", lineHeight: 1.5 }}>
            {resultText}
          </div>
        )}
      </div>
    </Sheet>
  );
}
