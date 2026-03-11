import { useState, useRef, useEffect } from "react";
import { C, FONT } from "../../constants/theme.js";

export default function SceneBlock({ entry, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.title || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== entry.title && onUpdate) {
      onUpdate({ ...entry, title: trimmed });
    }
    setEditing(false);
  };

  const typeLabel = entry.sceneType === "expected" ? "Očekávaná"
    : entry.sceneType === "altered" ? "Pozměněná"
    : "Přerušená";
  const typeColor = entry.sceneType === "expected" ? C.blue
    : entry.sceneType === "altered" ? C.yellow
    : C.red;
  return (
    <div>
      <div style={{ height: 1, background: C.blue + "55" }} />
      <div style={{ borderLeft: `3px solid ${C.blue}`, background: C.blue + "12", padding: "6px 10px" }}>
        <div style={{ fontSize: 9, color: C.blue, fontWeight: 700, letterSpacing: 1 }}>🎬 SCÉNA {entry.sceneNum}</div>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            style={{ fontSize: 12, fontWeight: 600, fontFamily: FONT, color: C.text, background: "white", border: `1px solid ${C.blue}`, borderRadius: 4, padding: "2px 6px", width: "100%", outline: "none", boxSizing: "border-box" }}
          />
        ) : (
          <div onClick={() => setEditing(true)} style={{ fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{entry.title || "Nová scéna"}</div>
        )}
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
