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

  const insertResult = () => {
    if (!result) return;
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
  };

  const handleClose = () => {
    insertResult();
    onClose();
  };

  const tabs = ["Actions", "Descriptions", "Elements"];

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Meaning Tables — inspirační generátor</div>
      <div style={{ marginBottom: 12 }}>
        Vyber tabulku, appka ti hodí dvě náhodná slova. Z nich si domyslíš co se děje ve hře. Neber je doslova — jsou to vodítka pro tvou fantazii.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.purple + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: tvá myš vstoupí do opuštěného mlýna. Chceš vědět víc o tom co tam najde. Všechny příklady níže se odehrávají na tomto jednom místě.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.purple }}>Actions</div>
      <div style={{ marginBottom: 4 }}>
        Použij, když potřebuješ vědět <b>co se děje</b> nebo <b>co někdo dělá</b>.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Co se tu stalo?" → padne Abandon + Fight (Opuštění + Boj) → Vypadá to, že tu proběhl boj a pak to všichni narychlo opustili. Na zemi jsou převržené stoly a krev.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.purple }}>Descriptions</div>
      <div style={{ marginBottom: 4 }}>
        Použij, když potřebuješ vědět <b>jak něco vypadá</b>, <b>jaká je atmosféra</b> nebo <b>jakým způsobem</b> se něco děje.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Jaká je atmosféra v mlýně?" → padne Nervously + Dimly (Nervózně + Matně) → Uvnitř je šero, světlo proniká jen skrz praskliny v dřevě. Máš pocit, že tě něco sleduje.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.purple }}>Elements</div>
      <div style={{ marginBottom: 4 }}>
        Použij, když chceš <b>konkrétnější inspiraci</b> — co je v místnosti, co slyšíš, co najdeš.
      </div>
      <div style={{ marginBottom: 12, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Co slyším?" → vyber tabulku Sounds → dostaneš konkrétní zvuky místo abstraktních pojmů, třeba skřípání a kapání vody.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Jak interpretovat výsledek?</div>
      <div style={{ marginBottom: 10 }}>
        Dostaneš dvě slova — neber je doslova, jsou to vodítka. Polož si otázky: Co by to mohlo znamenat tady a teď? Která interpretace je nejzajímavější? Neexistuje špatná odpověď — vyber co dává smysl v aktuální scéně.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Tipy</div>
      <div>
        Když první hod nedává smysl, klidně hoď znovu — je to součást hry. Můžeš taky kombinovat s Fate Question: nejdřív se zeptej Ano/Ne (třeba „Je tu někdo?"), a pak si přes Meaning Tables nech vygenerovat detaily (kdo a co dělá).
      </div>
    </>
  );

  return (
    <Sheet title="🔮 MEANING TABLES" onClose={handleClose} help={helpContent}>
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
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>
          {selectedType === "Elements" ? "Vyber tabulku a klikni HODIT ↑" : "Vyber typ tabulky ↑"}
        </div>
      )}
    </Sheet>
  );
}
