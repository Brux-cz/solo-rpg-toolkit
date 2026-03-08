import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { rollMeaning } from "../../utils/dice.js";
import { ELEMENT_NAMES } from "../../constants/elements.js";
import Sheet from "../ui/Sheet.jsx";

export default function MeaningSheet({ onClose, onInsert }) {
  const [result, setResult] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedElement, setSelectedElement] = useState(ELEMENT_NAMES[0]);

  const doSelect = (t) => {
    setSelectedType(t);
    if (t === "Elements") return; // čeká na výběr z dropdownu + HODIT
    const table = t === "Descriptions" ? "descriptions" : "actions";
    setResult(rollMeaning(table));
  };

  const doRollElement = () => {
    setResult(rollMeaning(selectedElement));
  };

  const doInsert = () => {
    onInsert({
      type: "meaning",
      word1: result.word1,
      word2: result.word2,
      cz1: result.cz1,
      cz2: result.cz2,
      d1: result.d1,
      d2: result.d2,
      table: selectedType === "Elements" ? selectedElement : selectedType,
    });
    onClose();
  };

  const tabs = ["Actions", "Descriptions", "Elements"];

  return (
    <Sheet title="🔮 MEANING TABLES" onClose={onClose}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => doSelect(t)} style={{ flex: 1, padding: "6px 0", border: `1px solid ${selectedType === t ? C.purple : C.border}`, background: selectedType === t ? C.purple : "transparent", color: selectedType === t ? "white" : C.muted, borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      {selectedType === "Elements" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <select
            value={selectedElement}
            onChange={(e) => setSelectedElement(e.target.value)}
            style={{ flex: 1, padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 10, fontFamily: FONT, background: C.bg, color: C.text }}
          >
            {ELEMENT_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button onClick={doRollElement} style={{ padding: "6px 14px", background: C.purple, color: "white", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>HODIT</button>
        </div>
      )}
      {result ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>d100 = {result.d1}, d100 = {result.d2}</div>
          <div style={{ background: C.purple + "20", border: `2px solid ${C.purple}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.purple, fontFamily: FONT }}>{result.word1} + {result.word2}</div>
            {result.cz1 && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: FONT }}>{result.cz1} + {result.cz2}</div>}
          </div>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>Interpretuj v kontextu scény</div>
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.purple, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>
          {selectedType === "Elements" ? "Vyber tabulku a klikni HODIT ↑" : "Vyber typ tabulky ↑"}
        </div>
      )}
    </Sheet>
  );
}
