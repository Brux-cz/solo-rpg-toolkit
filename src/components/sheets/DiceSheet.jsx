import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { roll } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

const DICE = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

export default function DiceSheet({ onClose, onInsert }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const doRoll = (die) => {
    const sides = parseInt(die.replace("d", ""));
    const value = roll(sides);
    setSelected(die);
    setResult(value);
  };

  const doInsert = () => {
    onInsert({ type: "dice", die: selected, value: result });
    onClose();
  };

  return (
    <Sheet title="🎲 HOD KOSTKOU" onClose={onClose}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {DICE.map(die => (
          <button key={die} onClick={() => doRoll(die)} style={{
            flex: "1 1 auto",
            minWidth: 40,
            padding: "8px 0",
            border: `1px solid ${selected === die ? C.text : C.border}`,
            background: selected === die ? C.text : "transparent",
            color: selected === die ? "white" : C.muted,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: selected === die ? 700 : 400,
            fontFamily: FONT,
            cursor: "pointer",
          }}>{die}</button>
        ))}
      </div>
      {result !== null ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>{selected}</div>
          <div style={{ background: C.text + "12", border: `2px solid ${C.text}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: C.text, fontFamily: FONT }}>{result}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => doRoll(selected)} style={{ flex: 1, height: 46, background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontFamily: FONT, cursor: "pointer" }}>HODIT ZNOVU</button>
            <button onClick={doInsert} style={{ flex: 1, height: 46, background: C.text, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT</button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>Vyber kostku</div>
      )}
    </Sheet>
  );
}
