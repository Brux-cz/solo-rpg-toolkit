import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { checkFate, getEventFocus, rollMeaning } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

export default function FateSheet({ onClose, cf, onInsert }) {
  const [step, setStep] = useState("input");
  const [odds, setOdds] = useState(4);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const oddsLabels = ["Impossible","Nearly imp.","V.unlikely","Unlikely","50/50","Likely","V.likely","Nearly cert.","Certain"];

  const doRoll = () => {
    const r = checkFate(odds, cf);
    let eventData = null;
    if (r.randomEvent) {
      const focus = getEventFocus();
      const meaning = rollMeaning("actions");
      eventData = { focus, meaning };
    }
    setResult({ ...r, question: question || "?", oddsLabel: oddsLabels[odds], eventData });
    setStep("result");
  };

  const doInsert = () => {
    const entry = {
      type: "fate",
      question: result.question,
      oddsLabel: result.oddsLabel,
      d100: result.d100,
      yes: result.yes,
      exceptional: result.exceptional,
      randomEvent: result.randomEvent,
    };
    if (result.eventData) {
      entry.eventFocus = result.eventData.focus;
      entry.eventMeaning = result.eventData.meaning;
    }
    onInsert(entry);
    onClose();
  };

  return (
    <Sheet title="❓ FATE QUESTION" onClose={onClose}>
      {step === "input" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>OTÁZKA:</div>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Je tu stráž?"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 12, background: "white", fontFamily: FONT, outline: "none", color: C.text }}
          />
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>ODDS:</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
            {oddsLabels.map((o, i) => (
              <button key={i} onClick={() => setOdds(i)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 20, border: `1px solid ${i === odds ? C.green : C.border}`, background: i === odds ? C.green : "transparent", color: i === odds ? "white" : C.muted, fontSize: 10, fontFamily: FONT, cursor: "pointer", whiteSpace: "nowrap" }}>{o}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>CF: <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span></div>
          <button onClick={doRoll} style={{ width: "100%", height: 46, background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: "pointer", letterSpacing: 1 }}>🎲  HODIT</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>
            {result.question} · {result.oddsLabel} · CF {cf}<br />
            <span style={{ fontWeight: 700, color: C.text }}>d100 = {result.d100}</span>
            <span style={{ color: C.muted }}> (threshold {result.threshold})</span>
          </div>
          <div style={{ background: (result.yes ? C.green : C.red) + "20", border: `2px solid ${result.yes ? C.green : C.red}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: result.yes ? C.green : C.red, letterSpacing: 3, fontFamily: FONT }}>
              {result.exceptional ? (result.yes ? "E X C.  A N O" : "E X C.  N E") : (result.yes ? "A N O" : "N E")}
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: result.randomEvent ? 8 : 12, fontFamily: FONT }}>
            Exceptional: {result.exceptional ? "ano" : "ne"}  ·  Random Event: {result.randomEvent ? "ano ⚡" : "ne"}
          </div>
          {result.eventData && (
            <div style={{ background: C.yellow + "18", border: `1px solid ${C.yellow}`, borderRadius: 8, padding: "8px 10px", marginBottom: 12, fontFamily: FONT }}>
              <div style={{ fontSize: 9, color: C.yellow, fontWeight: 700, marginBottom: 4 }}>⚡ RANDOM EVENT</div>
              <div style={{ fontSize: 11, color: C.text, marginBottom: 2 }}>Focus: <span style={{ fontWeight: 600 }}>{result.eventData.focus}</span></div>
              <div style={{ fontSize: 11, color: C.purple }}>Meaning: <span style={{ fontWeight: 600 }}>{result.eventData.meaning.word1} + {result.eventData.meaning.word2}</span></div>
            </div>
          )}
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      )}
    </Sheet>
  );
}
