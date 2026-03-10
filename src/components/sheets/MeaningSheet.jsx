import { useState, useRef } from "react";
import { C, FONT } from "../../constants/theme.js";
import { rollMeaning } from "../../utils/dice.js";
import { fetchWhisper } from "../../utils/whisper.js";
import { ELEMENT_NAMES } from "../../constants/elements.js";
import Sheet from "../ui/Sheet.jsx";

export default function MeaningSheet({ onClose, onInsert }) {
  const [result, setResult] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedElement, setSelectedElement] = useState(ELEMENT_NAMES[0]);
  const [whisperResult, setWhisperResult] = useState(null);
  const [whisperLoading, setWhisperLoading] = useState(false);
  const [kontextText, setKontextText] = useState("");
  const [selectedWhisper, setSelectedWhisper] = useState(null);
  const whisperIdRef = useRef(0);

  const fireWhisper = async (rollResult) => {
    const id = ++whisperIdRef.current;
    setWhisperLoading(true);
    setWhisperResult(null);
    setSelectedWhisper(null);
    const whispers = await fetchWhisper({
      word1: rollResult.word1,
      word2: rollResult.word2,
      cz1: rollResult.cz1,
      cz2: rollResult.cz2,
      kontext: kontextText.trim() || null,
    });
    if (id !== whisperIdRef.current) return;
    setWhisperResult(whispers);
    setWhisperLoading(false);
  };

  const doSelect = (t) => {
    setSelectedType(t);
    setWhisperResult(null);
    setSelectedWhisper(null);
    if (t === "Elements") return; // ceka na vyber z dropdownu + HODIT
    const table = t === "Descriptions" ? "descriptions" : "actions";
    const r = rollMeaning(table);
    setResult(r);
    fireWhisper(r);
  };

  const doRollElement = () => {
    setWhisperResult(null);
    setSelectedWhisper(null);
    const r = rollMeaning(selectedElement);
    setResult(r);
    fireWhisper(r);
  };

  const insertResult = () => {
    if (!result) return;
    const entry = {
      type: "meaning",
      word1: result.word1,
      word2: result.word2,
      cz1: result.cz1,
      cz2: result.cz2,
      d1: result.d1,
      d2: result.d2,
      table: selectedType === "Elements" ? selectedElement : selectedType,
    };
    if (kontextText.trim()) {
      entry.context = kontextText.trim();
    }
    if (selectedWhisper) {
      entry.inspirace = selectedWhisper;
    }
    onInsert(entry);
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
      <input
        type="text"
        value={kontextText}
        onChange={(e) => setKontextText(e.target.value)}
        placeholder="Na co hážeš? (nepovinné)"
        style={{ width: "100%", padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 10, fontFamily: FONT, background: C.bg, color: C.text, marginBottom: 10, boxSizing: "border-box" }}
      />

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
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>Interpretuj v kontextu scény</div>

          {/* Whisper sekce */}
          {whisperLoading && (
            <div style={{ fontSize: 10, color: C.muted, textAlign: "center", fontFamily: FONT, marginBottom: 8 }}>···</div>
          )}
          {whisperResult && (
            <div style={{ marginBottom: 8 }}>
              {whisperResult.map((line, i) => {
                const isSelected = selectedWhisper === line;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedWhisper(isSelected ? null : line)}
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      fontStyle: "italic",
                      fontFamily: FONT,
                      padding: "3px 8px",
                      marginBottom: 2,
                      cursor: "pointer",
                      borderRadius: 4,
                      border: isSelected ? `1px solid ${C.purple}` : "1px solid transparent",
                      background: isSelected ? C.purple + "10" : "transparent",
                    }}
                  >
                    💭 {line}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>
          {selectedType === "Elements" ? "Vyber tabulku a klikni HODIT ↑" : "Vyber typ tabulky ↑"}
        </div>
      )}
    </Sheet>
  );
}
