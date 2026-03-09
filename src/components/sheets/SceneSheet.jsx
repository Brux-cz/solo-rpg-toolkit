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

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Nová scéna — začátek další části příběhu</div>
      <div style={{ marginBottom: 12 }}>
        Příběh se skládá ze scén — jako v knize nebo filmu. Každá scéna je situace, kterou tvá postava prožívá. Tady rozhodneš co se bude dít, a chaos rozhodne jestli to půjde podle plánu.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.blue + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: tvá myš právě dorazila k opuštěnému mlýnu. Chce ho prohledat a najít zásoby. Všechny příklady níže ukazují co se může stát.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.blue }}>1. Napiš co očekáváš</div>
      <div style={{ marginBottom: 4 }}>
        Co by se teď logicky mělo stát? Kam jde tvá postava, co chce udělat?
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Napíšeš: „Myšák prohledá mlýn a hledá zásoby."
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.blue }}>2. Test chaosu</div>
      <div style={{ marginBottom: 4 }}>
        Appka hodí d10 proti tvému Chaos Faktoru (CF). CF ukazuje, jak moc je příběh nepředvídatelný. Čím vyšší CF, tím větší šance na zvrat.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Tvé CF je 5. Appka hodí d10 — padne 3. To je pod CF, takže se něco změní!
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.blue }}>3. Tři možné výsledky</div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: C.blue, fontWeight: 600 }}>Očekávaná</span> — scéna proběhne podle plánu. Myšák v klidu prohledá mlýn.
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: C.yellow, fontWeight: 600 }}>Pozměněná</span> — něco je jinak. Appka napoví co: třeba „Přidej postavu" → v mlýně už někdo je! Zásoby hledáš, ale nejsi sám.
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ color: C.red, fontWeight: 600 }}>Přerušená</span> — plán padá, stane se něco úplně jiného. Appka vygeneruje typ události a dvě slova pro inspiraci → třeba „NPC Action: Betray + Trust (Zradit + Důvěra)" → někdo koho jsi považoval za přítele tě zradil právě tady.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Klikni „Vložit scénu" — do deníku se zapíše nadpis. Pak hraj: piš co se děje, pokládej otázky osudu (Fate), používej Meaning Tables pro inspiraci. Až bude scéna u konce, klikni na ⋯ → „Konec scény".
      </div>
    </>
  );

  return (
    <Sheet title="🎬 NOVÁ SCÉNA" onClose={onClose} help={helpContent}>
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
