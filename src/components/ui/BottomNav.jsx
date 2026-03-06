import { C, FONT } from "../../constants/theme.js";

export default function BottomNav({ active, onChange }) {
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, height: 54, fontFamily: FONT }}>
      {[["📖","Deník","diary"],["🐭","Postava","char"],["🗺️","Svět","world"]].map(([ic, label, id]) => (
        <div key={id} onClick={() => onChange(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", position: "relative" }}>
          {active === id && <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: C.green, borderRadius: "0 0 2px 2px" }} />}
          <span style={{ fontSize: 18 }}>{ic}</span>
          <span style={{ fontSize: 9, color: active === id ? C.text : C.muted, fontWeight: active === id ? 700 : 400 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
