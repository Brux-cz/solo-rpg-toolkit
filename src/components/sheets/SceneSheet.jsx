import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { checkScene, resolveEventTarget } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

export default function SceneSheet({ onClose, cf, sceneNum, npcs, threads, onInsert }) {
  const [step, setStep] = useState("input");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);

  const doTest = () => {
    const r = checkScene(cf);
    if (r.type === "interrupt") {
      r.target = resolveEventTarget(r.focus, npcs, threads);
    }
    setResult(r);
    setStep("result");
  };

  const doInsert = () => {
    onInsert({
      type: "scene",
      sceneNum: sceneNum + 1,
      title: title || "Nová scéna",
      sceneType: result.type,
      cf,
      d10: result.d10,
      adj: result.adj,
      focus: result.focus,
      meaning: result.meaning,
      ...(result.target ? {
        eventTargetType: result.target.type,
        eventTargetName: result.target.item?.name || null,
        eventTargetReroll: result.target.reroll || false,
        eventTargetEmpty: result.target.empty || false,
      } : {}),
    });
    onClose();
  };

  const typeLabel = result?.type === "expected" ? "OČEKÁVANÁ"
    : result?.type === "altered" ? "POZMĚNĚNÁ!"
    : "PŘERUŠENÁ!";
  const typeColor = result?.type === "expected" ? C.blue
    : result?.type === "altered" ? C.yellow
    : C.red;

  return (
    <Sheet title="🎬 NOVÁ SCÉNA" onClose={onClose}>
      {step === "input" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, fontFamily: FONT }}>CO OČEKÁVÁŠ?</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Co očekáváš ve scéně…"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 12, background: "white", fontFamily: FONT, outline: "none", color: C.text }}
          />
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>CF: <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span>  ·  Test: d10 vs CF</div>
          <button onClick={doTest} style={{ width: "100%", height: 46, background: C.blue, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>TESTOVAT CHAOS</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>
            d10 = {result.d10}  ({result.d10} {result.d10 <= cf ? "≤" : ">"} {cf} = {result.d10 <= cf ? "pod CF" : "nad CF"}{result.d10 <= cf ? (result.d10 % 2 === 0 ? ", sudý" : ", lichý") : ""})
          </div>
          <div style={{ background: typeColor + "20", border: `2px solid ${typeColor}`, borderRadius: 8, padding: "10px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: typeColor, letterSpacing: 2, fontFamily: FONT }}>{typeLabel}</div>
          </div>
          {result.type === "altered" && (
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, fontFamily: FONT, lineHeight: 1.6 }}>
              Scene Adjustment d10={result.adjRoll}: <span style={{ color: C.text, fontWeight: 600 }}>{result.adj}</span>
            </div>
          )}
          {result.type === "interrupt" && (
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, fontFamily: FONT, lineHeight: 1.6 }}>
              Event Focus: <span style={{ color: C.text, fontWeight: 600 }}>{result.focus}</span><br />
              Meaning: <span style={{ color: C.purple, fontWeight: 600 }}>{result.meaning.word1} + {result.meaning.word2}</span>
              {result.target && (
                <>
                  <br />
                  {result.target.type === "npc" ? "NPC" : "Thread"}:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {result.target.empty ? "(prázdný seznam → Current Context)"
                      : result.target.reroll ? "Vyber sám"
                      : result.target.item?.name}
                  </span>
                </>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStep("input"); setResult(null); }} style={{ flex: 1, height: 46, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>ZNOVU</button>
            <button onClick={doInsert} style={{ flex: 2, height: 46, background: C.blue, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT SCÉNU</button>
          </div>
        </>
      )}
    </Sheet>
  );
}
