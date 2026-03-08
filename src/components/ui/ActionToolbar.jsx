import { useState, useRef, useEffect } from "react";
import { C, FONT } from "../../constants/theme.js";

export default function ActionToolbar({ onFateOpen, onSceneOpen, onMeaningOpen, onDetailOpen, onEndSceneOpen, onCombatOpen, onNoteOpen, onDiceOpen, onRestOpen, onDiscoveryOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [menuOpen]);

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
          { icon: "🎲", fn: onDiceOpen },
          { icon: "💤", fn: onRestOpen },
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
        <div ref={menuRef} style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(v => !v)} style={{
            flex: "0 0 34px", width: 34, height: 34,
            background: menuOpen ? C.text + "10" : "transparent",
            color: C.text, border: `1px solid ${C.border}`, borderRadius: 6,
            fontSize: 15, fontFamily: FONT, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>⋯</button>
          {menuOpen && (
            <div style={{
              position: "absolute", bottom: 42, right: 0, background: C.bg,
              border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              minWidth: 180, zIndex: 20, overflow: "hidden",
            }}>
              {[
                { icon: "📕", label: "Konec scény", fn: onEndSceneOpen },
                { icon: "🔍", label: "Discovery Check", fn: onDiscoveryOpen },
              ].map((item, i) => (
                <button key={i} onClick={() => { item.fn(); setMenuOpen(false); }} style={{
                  width: "100%", padding: "10px 14px", background: "transparent",
                  border: "none", borderBottom: i === 0 ? `1px solid ${C.border}` : "none",
                  fontSize: 12, fontFamily: FONT, color: C.text, cursor: "pointer",
                  textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
