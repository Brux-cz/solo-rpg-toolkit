import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { rollMeaning } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

export default function DetailCheckSheet({ onClose, onInsert }) {
  const [result, setResult] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const doSelect = (t) => {
    setSelectedType(t);
    const table = t === "Descriptions" ? "descriptions" : "actions";
    setResult(rollMeaning(table));
  };

  const doInsert = () => {
    onInsert({
      type: "detail",
      word1: result.word1,
      word2: result.word2,
      d1: result.d1,
      d2: result.d2,
      table: selectedType,
    });
    onClose();
  };

  return (
    <Sheet title="🔍 DETAIL CHECK" onClose={onClose}>
      <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 10, fontFamily: FONT }}>Co se děje? Jak to vypadá? Generuj obsah bez Ano/Ne.</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["Actions","Descriptions"].map((t, i) => (
          <button key={i} onClick={() => doSelect(t)} style={{ flex: 1, padding: "6px 0", border: `1px solid ${selectedType === t ? C.yellow : C.border}`, background: selectedType === t ? C.yellow : "transparent", color: selectedType === t ? "white" : C.muted, borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      {result ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>d100 = {result.d1}, d100 = {result.d2}</div>
          <div style={{ background: C.yellow + "20", border: `2px solid ${C.yellow}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.yellow, fontFamily: FONT }}>{result.word1} + {result.word2}</div>
          </div>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>Interpretuj v kontextu scény</div>
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.yellow, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>Vyber typ tabulky ↑</div>
      )}
    </Sheet>
  );
}
