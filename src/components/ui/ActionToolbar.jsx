import { C, FONT } from "../../constants/theme.js";

export default function ActionToolbar({ onFateOpen, onSceneOpen, onMeaningOpen, onDetailOpen, onEndSceneOpen, onCombatOpen, onNoteOpen }) {
  return (
    <div style={{ padding: "6px 12px 5px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, fontFamily: FONT }}>
      <div style={{ fontSize: 8, color: C.border, letterSpacing: 0.8, marginBottom: 4, textTransform: "uppercase" }}>Vložit:</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { icon: "🎬", label: "Scéna", fn: onSceneOpen },
          { icon: "❓", label: "Fate", fn: onFateOpen, accent: true },
          { icon: "🔮", fn: onMeaningOpen },
          { icon: "🔍", fn: onDetailOpen },
          { icon: "⚔️", fn: onCombatOpen },
          { icon: "📝", fn: onNoteOpen },
          { icon: "⋯", fn: onEndSceneOpen },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} style={{
            flex: b.label ? "1 1 auto" : "0 0 34px",
            height: 34,
            background: b.accent ? C.green : "transparent",
            color: b.accent ? "white" : C.text,
            border: `1px solid ${b.accent ? C.green : C.border}`,
            borderRadius: 6,
            fontSize: b.label ? 11 : 15,
            fontFamily: FONT,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            fontWeight: b.accent ? 700 : 400,
          }}>
            {b.icon}{b.label && <span>{b.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
