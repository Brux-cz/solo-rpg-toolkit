import { C } from "../../constants/theme.js";

export default function SceneBlock({ entry }) {
  const typeLabel = entry.sceneType === "expected" ? "Očekávaná"
    : entry.sceneType === "altered" ? "Pozměněná"
    : "Přerušená";
  const typeColor = entry.sceneType === "expected" ? C.blue
    : entry.sceneType === "altered" ? C.yellow
    : C.red;
  return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ height: 1, background: C.blue + "55" }} />
      <div style={{ borderLeft: `3px solid ${C.blue}`, background: C.blue + "12", padding: "6px 10px", margin: "2px 0" }}>
        <div style={{ fontSize: 9, color: C.blue, fontWeight: 700, letterSpacing: 1 }}>🎬 SCÉNA {entry.sceneNum}</div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{entry.title || "Nová scéna"}</div>
        <div style={{ fontSize: 9, color: typeColor, fontWeight: 600 }}>{typeLabel} · CF {entry.cf}</div>
        {entry.focus && (
          <div style={{ fontSize: 9, color: C.muted, marginTop: 2, wordBreak: "break-word" }}>
            ⚡ {entry.focus} · <span style={{ color: C.purple }}>{entry.meaning?.word1} + {entry.meaning?.word2}</span>
            {entry.meaning?.cz1 && <span style={{ color: C.muted }}> ({entry.meaning.cz1} + {entry.meaning.cz2})</span>}
            {entry.eventTargetName && <span style={{ color: C.text, fontWeight: 600 }}> → {entry.eventTargetName}</span>}
            {entry.eventTargetReroll && <span style={{ color: C.text, fontWeight: 600 }}> → Vyber sám</span>}
            {entry.eventTargetEmpty && <span style={{ color: C.text, fontWeight: 600 }}> → (prázdný seznam)</span>}
          </div>
        )}
      </div>
      <div style={{ height: 1, background: C.blue + "55" }} />
    </div>
  );
}
