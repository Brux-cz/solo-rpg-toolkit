import { C, FONT } from "../../constants/theme.js";

export default function PostavaTab({ character, onUpdate }) {
  const ch = character;
  const zkMax = ch.uroven * 6;
  const statInput = { border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 4px", fontSize: 11, fontFamily: FONT, textAlign: "center", width: 36, background: "white", color: C.text, outline: "none" };

  const setStat = (key, field, val) => {
    const v = Math.max(0, Number(val) || 0);
    onUpdate({ ...ch, [key]: { ...ch[key], [field]: v } });
  };

  const setField = (key, val) => onUpdate({ ...ch, [key]: val });

  return (
    <div style={{ padding: "14px 16px", overflowY: "auto", height: "100%", fontFamily: FONT }}>
      {/* Identita */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={ch.jmeno} onChange={e => setField("jmeno", e.target.value)} placeholder="Jméno postavy" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", fontSize: 13, fontWeight: 700, fontFamily: FONT, background: "white", color: C.text, outline: "none" }} />
          <span style={{ fontSize: 10, color: C.muted, alignSelf: "center", whiteSpace: "nowrap" }}>Úr. {ch.uroven}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={ch.puvod} onChange={e => setField("puvod", e.target.value)} placeholder="Původ (Kuchařka...)" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.muted, outline: "none" }} />
          <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>ZK {ch.zk}/{zkMax}</span>
          <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>Ďobky</span>
          <input type="number" value={ch.dobky} onChange={e => setField("dobky", Math.max(0, Number(e.target.value) || 0))} style={{ ...statInput, width: 44, color: C.yellow, fontWeight: 700 }} />
        </div>
      </div>

      {/* Staty */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        {[["str","STR",C.green],["dex","DEX",C.green],["wil","WIL",C.green],["bo","BO",C.red]].map(([key, label, col]) => {
          const s = ch[key];
          const pct = s.max > 0 ? (s.akt / s.max) * 100 : 0;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ width: 28, fontSize: 10, fontWeight: 700, color: col }}>{label}</span>
              <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: col, borderRadius: 3 }} />
              </div>
              <input type="number" value={s.akt} onChange={e => setStat(key, "akt", e.target.value)} style={{ ...statInput, color: col }} />
              <span style={{ fontSize: 10, color: C.muted }}>/</span>
              <input type="number" value={s.max} onChange={e => setStat(key, "max", e.target.value)} style={{ ...statInput, color: C.muted }} />
            </div>
          );
        })}
      </div>

      {/* Inventář — placeholder */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, letterSpacing: 0.8 }}>INVENTÁŘ (10 slotů)</div>
        {[
          ["Packy","Nůž d6","Provaz"],
          ["Tělo","Kožená zbroj","—"],
          ["Batoh","Pochodně 3×","Jídlo"],
          ["","Léčivé bylinky","—"],
          ["","—","—"],
        ].map(([label, a, b], i) => (
          <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center" }}>
            <span style={{ width: 36, fontSize: 9, color: C.muted, flexShrink: 0 }}>{label}</span>
            {[a,b].map((item, j) => (
              <div key={j} style={{ flex: 1, padding: "4px 8px", border: `1px solid ${item==="—"?C.border:C.blue+"55"}`, borderRadius: 5, fontSize: 10, color: item==="—"?C.border:C.text, background: item==="—"?"transparent":C.blue+"08", textAlign: "center" }}>{item}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Pomocník — placeholder */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: 0.8 }}>POMOCNÍK</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>Hrách</span>
          <span style={{ fontSize: 10, color: C.muted }}>Mzda: 2ď/den</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>STR 4  BO 0  Dýka d6</div>
      </div>
    </div>
  );
}
