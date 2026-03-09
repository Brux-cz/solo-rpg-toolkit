import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";

export default function Sheet({ title, onClose, children, help }) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column" }}>
      {/* Horní prostor — overlay nebo nápověda */}
      <div onClick={showHelp ? undefined : onClose} style={{ flex: 1, minHeight: 0, background: "rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", cursor: showHelp ? "default" : "pointer" }}>
        {showHelp && help && (
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", margin: 12, padding: "14px 16px", background: C.bg, borderRadius: 10, color: C.text, fontFamily: FONT, fontSize: 11, lineHeight: 1.7, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
            {help}
          </div>
        )}
      </div>

      {/* Sheet panel — dole */}
      <div style={{ flexShrink: 0, maxHeight: "52%", background: C.bg, borderRadius: "12px 12px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp .25s ease both" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2 }} />
        </div>
        <div style={{ position: "relative", flexShrink: 0, marginBottom: 10 }}>
          {help && <button onClick={() => setShowHelp(v => !v)} style={{ position: "absolute", top: -2, left: 12, background: showHelp ? C.blue + "18" : "none", border: `1px solid ${showHelp ? C.blue : C.border}`, borderRadius: 12, fontSize: 10, color: showHelp ? C.blue : C.muted, cursor: "pointer", padding: "1px 8px", fontFamily: FONT, fontWeight: 700 }}>?</button>}
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 1, color: C.muted, textAlign: "center" }}>{title}</div>
          <button onClick={onClose} style={{ position: "absolute", top: -2, right: 12, background: "none", border: "none", fontSize: 18, color: C.muted, cursor: "pointer", padding: "0 4px", fontFamily: FONT }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}
