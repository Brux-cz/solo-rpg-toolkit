import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { rollMeaning } from "../../utils/dice.js";
import { ELEMENT_NAMES } from "../../constants/elements.js";
import Sheet from "../ui/Sheet.jsx";

export default function DetailCheckSheet({ onClose, onInsert }) {
  const [result, setResult] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedElement, setSelectedElement] = useState(ELEMENT_NAMES[0]);

  const doSelect = (t) => {
    setSelectedType(t);
    if (t === "Elements") return;
    const table = t === "Descriptions" ? "descriptions" : "actions";
    setResult(rollMeaning(table));
  };

  const doRollElement = () => {
    setResult(rollMeaning(selectedElement));
  };

  const insertResult = () => {
    if (!result) return;
    onInsert({
      type: "detail",
      word1: result.word1,
      word2: result.word2,
      cz1: result.cz1,
      cz2: result.cz2,
      d1: result.d1,
      d2: result.d2,
      table: selectedType === "Elements" ? selectedElement : selectedType,
    });
  };

  const handleClose = () => {
    insertResult();
    onClose();
  };

  const tabs = ["Actions", "Descriptions", "Elements"];

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Detail Check — co se skrývá v detailech?</div>
      <div style={{ marginBottom: 12 }}>
        Generátor detailů scény. Neřeší ano/ne — dává ti dva pojmy pro inspiraci k tomu, co vidíš, slyšíš nebo najdeš.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.yellow + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: myš vstoupí do zadní místnosti mlýna. Co tam najde? Jaké zvuky slyší? Detail Check ti dá inspiraci.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.yellow }}>1. Vyber tabulku</div>
      <div style={{ marginBottom: 4 }}>
        Actions (co se děje), Descriptions (jak to vypadá), nebo Elements (konkrétní téma — zvuky, vůně, pachy...).
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Chceš vědět co se děje za zavřenými dveřmi → Actions. Jak vypadá stará pec → Descriptions.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.yellow }}>2. Hoď</div>
      <div style={{ marginBottom: 4 }}>
        Appka hodí 2×d100 a vybere dvě slova z tabulky.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Padne „Abandon + Old" (Opustit + Starý) → místnost vypadá jako kdyby ji někdo narychlo opustil před lety.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.yellow }}>3. Interpretuj výsledek</div>
      <div style={{ marginBottom: 10 }}>
        Spoj ta dvě slova s tím, co tvá postava právě dělá. Výsledek nemusí dávat smysl doslova — hledáš inspiraci.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Vlož výsledek do deníku a pokračuj ve scéně. Detail Check můžeš použít kolikrát chceš — kdykoliv potřebuješ inspiraci.
      </div>
    </>
  );

  return (
    <Sheet title="🔍 DETAIL CHECK" onClose={handleClose} help={helpContent}>
      <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 10, fontFamily: FONT }}>Co se děje? Jak to vypadá? Generuj obsah bez Ano/Ne.</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => doSelect(t)} style={{ flex: 1, padding: "6px 0", border: `1px solid ${selectedType === t ? C.yellow : C.border}`, background: selectedType === t ? C.yellow : "transparent", color: selectedType === t ? "white" : C.muted, borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer" }}>{t}</button>
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
          <button onClick={doRollElement} style={{ padding: "6px 14px", background: C.yellow, color: "white", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>HODIT</button>
        </div>
      )}
      {result ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>d100 = {result.d1}, d100 = {result.d2}</div>
          <div style={{ background: C.yellow + "20", border: `2px solid ${C.yellow}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.yellow, fontFamily: FONT }}>{result.word1} + {result.word2}</div>
            {result.cz1 && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: FONT }}>{result.cz1} + {result.cz2}</div>}
          </div>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>Interpretuj v kontextu scény</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setResult(null)} style={{ flex: 1, height: 46, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>HODIT ZNOVU</button>
            <button onClick={() => { insertResult(); onClose(); }} style={{ flex: 2, height: 46, background: C.yellow, color: C.text, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO DENÍKU</button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>
          {selectedType === "Elements" ? "Vyber tabulku a klikni HODIT ↑" : "Vyber typ tabulky ↑"}
        </div>
      )}
    </Sheet>
  );
}
