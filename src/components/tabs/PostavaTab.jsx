import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";

const SLOT_SECTIONS = [
  { label: "Packy", start: 0, count: 2 },
  { label: "Tělo", start: 2, count: 2 },
  { label: "Batoh", start: 4, count: 6 },
];

const TYPY = ["zbraň", "zbroj", "kouzlo", "zásoby", "světlo", "nástroj", "poklad", "stav"];

export default function PostavaTab({ character, onUpdate }) {
  const ch = character;
  const zkMax = ch.uroven * 6;
  const [editSlot, setEditSlot] = useState(null);
  const inv = ch.inventar || Array.from({ length: 10 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } }));
  const statInput = { border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 4px", fontSize: 11, fontFamily: FONT, textAlign: "center", width: 36, background: "white", color: C.text, outline: "none" };

  const setStat = (key, field, val) => {
    const v = Math.max(0, Number(val) || 0);
    onUpdate({ ...ch, [key]: { ...ch[key], [field]: v } });
  };

  const setField = (key, val) => onUpdate({ ...ch, [key]: val });

  const updateSlot = (idx, patch) => {
    const next = inv.map((s, i) => i === idx ? { ...s, ...patch } : s);
    onUpdate({ ...ch, inventar: next });
  };

  const clearSlot = (idx) => {
    updateSlot(idx, { nazev: "", typ: "", tecky: { akt: 0, max: 0 } });
    setEditSlot(null);
  };

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

      {/* Inventář */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, letterSpacing: 0.8 }}>INVENTÁŘ (10 slotů)</div>
        {SLOT_SECTIONS.map(sec => (
          <div key={sec.label}>
            <div style={{ fontSize: 8, color: C.muted, marginBottom: 2, marginTop: sec.start > 0 ? 6 : 0, letterSpacing: 0.5 }}>{sec.label}</div>
            {Array.from({ length: sec.count }, (_, j) => {
              const idx = sec.start + j;
              const slot = inv[idx];
              const empty = !slot.nazev;
              const editing = editSlot === idx;
              const isStav = slot.typ === "stav";

              if (editing) {
                return (
                  <div key={idx} style={{ border: `1px solid ${C.blue}`, borderRadius: 6, padding: "6px 8px", marginBottom: 4, background: C.blue + "08" }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      <input
                        autoFocus
                        value={slot.nazev}
                        onChange={e => updateSlot(idx, { nazev: e.target.value })}
                        placeholder="Název předmětu"
                        style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                      <select
                        value={slot.typ}
                        onChange={e => updateSlot(idx, { typ: e.target.value })}
                        style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 4px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none" }}
                      >
                        <option value="">—typ—</option>
                        {TYPY.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span style={{ fontSize: 9, color: C.muted }}>tečky</span>
                      <input
                        type="number"
                        value={slot.tecky.akt}
                        onChange={e => updateSlot(idx, { tecky: { ...slot.tecky, akt: Math.max(0, Number(e.target.value) || 0) } })}
                        style={{ ...statInput, width: 28, fontSize: 10 }}
                      />
                      <span style={{ fontSize: 9, color: C.muted }}>/</span>
                      <input
                        type="number"
                        value={slot.tecky.max}
                        onChange={e => updateSlot(idx, { tecky: { ...slot.tecky, max: Math.max(0, Number(e.target.value) || 0) } })}
                        style={{ ...statInput, width: 28, fontSize: 10 }}
                      />
                      <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                        <button onClick={() => clearSlot(idx)} style={{ border: "none", background: "none", color: C.red, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px" }}>smazat</button>
                        <button onClick={() => setEditSlot(null)} style={{ border: "none", background: "none", color: C.green, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px", fontWeight: 700 }}>✓</button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  onClick={() => setEditSlot(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 8px", marginBottom: 3,
                    border: `1px solid ${empty ? C.border : isStav ? C.red + "55" : C.blue + "55"}`,
                    borderRadius: 5, cursor: "pointer",
                    background: empty ? "transparent" : isStav ? C.red + "08" : C.blue + "08",
                  }}
                >
                  {empty ? (
                    <span style={{ flex: 1, fontSize: 10, color: C.muted, textAlign: "center" }}>+ prázdný slot</span>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 11, color: isStav ? C.red : C.text, fontWeight: isStav ? 600 : 400 }}>{slot.nazev}</span>
                      {slot.typ && <span style={{ fontSize: 8, color: C.muted, flexShrink: 0 }}>{slot.typ}</span>}
                      {slot.tecky.max > 0 && (
                        <span style={{ fontSize: 9, color: C.muted, flexShrink: 0 }}>
                          {Array.from({ length: slot.tecky.max }, (_, d) => d < slot.tecky.akt ? "●" : "○").join("")}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
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
