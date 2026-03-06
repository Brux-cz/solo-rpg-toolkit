import { C, FONT } from "../../constants/theme.js";

export default function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.bg, borderRadius: "12px 12px 0 0", maxHeight: "45%", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp .25s ease both" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2 }} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 1, color: C.muted, textAlign: "center", marginBottom: 10, flexShrink: 0 }}>{title}</div>
        <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}
