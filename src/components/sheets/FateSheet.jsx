import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { checkFate, getEventFocus, rollMeaning, resolveEventTarget } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

export default function FateSheet({ onClose, cf, npcs, threads, onInsert }) {
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
      const target = resolveEventTarget(focus, npcs, threads);
      eventData = { focus, meaning, target };
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
      if (result.eventData.target) {
        entry.eventTargetType = result.eventData.target.type;
        entry.eventTargetName = result.eventData.target.item?.name || null;
        entry.eventTargetReroll = result.eventData.target.reroll || false;
        entry.eventTargetEmpty = result.eventData.target.empty || false;
      }
    }
    onInsert(entry);
    onClose();
  };

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Fate Question — otázka osudu</div>
      <div style={{ marginBottom: 12 }}>
        Toto je tvé orákulum — náhrada za Game Mastera. Když potřebuješ rozhodnutí, které bys normálně nechal na GM, polož otázku s odpovědí Ano/Ne.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.green + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: tvá myš prohledává opuštěný mlýn. Vstoupila do tmavé místnosti a chce vědět víc. Všechny příklady níže se odehrávají tady.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>1. Polož otázku</div>
      <div style={{ marginBottom: 4 }}>
        Napiš otázku, na kterou jde odpovědět Ano nebo Ne. Čím konkrétnější, tím lépe.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Je v téhle místnosti někdo?" nebo „Najdu tady jídlo?" nebo „Jsou dveře zamčené?"
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>2. Zvol pravděpodobnost (Odds)</div>
      <div style={{ marginBottom: 4 }}>
        Odhadni, jak moc je Ano pravděpodobné vzhledem k situaci. Když nevíš, nech 50/50.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Je v opuštěném mlýně jídlo?" — mlýn zpracovával obilí, takže zásoby jsou pravděpodobné → Likely. „Čeká tu na mě past?" — nikdo nečekal návštěvu → Unlikely.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>3. Výsledek</div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: C.green, fontWeight: 600 }}>ANO / NE</span> — jednoznačná odpověď. Hraj podle ní.
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.green, fontWeight: 600 }}>EXCEPTIONAL</span> — extrémní výsledek, víc než jsi čekal.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Najdu tady jídlo?" → Exceptional Ano = celý pytel obilí, čerstvý, jako by ho tu někdo nechal včera. Exceptional Ne = zásoby jsou tu, ale plesnivé a otrávené — pozor.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.yellow }}>Random Event ⚡</div>
      <div style={{ marginBottom: 4 }}>
        Někdy se při hodu spustí náhodná událost — něco nečekaného se stane navíc, nezávisle na tvé otázce. Odpověď stále platí, ale přibyde zvrat.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Ptal ses na jídlo a dostal Ano, ale navíc ⚡ Random Event: „NPC Action: Arrive + Mistrust (Přijít + Nedůvěra)" → někdo právě vešel do mlýna a nevypadá přátelsky. Jídlo máš, ale máš i problém.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Chaos Faktor (CF)</div>
      <div>
        CF ovlivňuje šanci na Ano i na Random Event. Vyšší CF = víc chaosu a nečekaných zvratů. CF se mění na konci každé scény — pokud měla tvá postava kontrolu, CF klesá, pokud ne, stoupá.
      </div>
    </>
  );

  return (
    <Sheet title="❓ FATE QUESTION" onClose={onClose} help={helpContent}>
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
              {result.eventData.meaning.cz1 && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{result.eventData.meaning.cz1} + {result.eventData.meaning.cz2}</div>}
              {result.eventData.target && (
                <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>
                  {result.eventData.target.type === "npc" ? "NPC" : "Thread"}:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {result.eventData.target.empty ? "(prázdný seznam → Current Context)"
                      : result.eventData.target.reroll ? "Vyber sám"
                      : result.eventData.target.item?.name}
                  </span>
                </div>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStep("input"); setResult(null); }} style={{ flex: 1, height: 46, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>HODIT ZNOVU</button>
            <button onClick={doInsert} style={{ flex: 2, height: 46, background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
          </div>
        </>
      )}
    </Sheet>
  );
}
