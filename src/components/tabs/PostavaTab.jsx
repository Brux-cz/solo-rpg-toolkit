import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";

const SLOT_SECTIONS = [
  { label: "Packy", start: 0, count: 2 },
  { label: "Tělo", start: 2, count: 2 },
  { label: "Batoh", start: 4, count: 6 },
];

const TYPY = ["zbraň", "zbroj", "kouzlo", "zásoby", "světlo", "nástroj", "poklad", "stav"];

const POMOCNIK_SECTIONS = [
  { label: "Packy", start: 0, count: 2 },
  { label: "Tělo", start: 2, count: 2 },
  { label: "Batoh", start: 4, count: 2 },
];

function newPomocnik() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    jmeno: "", role: "", vernost: "bezny", denniMzda: 0,
    str: { akt: 0, max: 0 }, dex: { akt: 0, max: 0 }, wil: { akt: 0, max: 0 }, bo: { akt: 0, max: 0 },
    inventar: Array.from({ length: 6 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } })),
  };
}

export default function PostavaTab({ character, onUpdate }) {
  const ch = character;
  const zkMax = ch.uroven * 6;
  const [editSlot, setEditSlot] = useState(null);
  const [editHSlot, setEditHSlot] = useState(null); // "pomId:slotIdx"
  const [expandedPom, setExpandedPom] = useState(null);
  const inv = ch.inventar || Array.from({ length: 10 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } }));
  const pomocnici = ch.pomocnici || [];
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

  const pridatPomocnika = () => {
    const p = newPomocnik();
    onUpdate({ ...ch, pomocnici: [...pomocnici, p] });
    setExpandedPom(p.id);
  };
  const updatePom = (id, patch) => {
    onUpdate({ ...ch, pomocnici: pomocnici.map(p => p.id === id ? { ...p, ...patch } : p) });
  };
  const propustitPomocnika = (id) => {
    onUpdate({ ...ch, pomocnici: pomocnici.filter(p => p.id !== id) });
    setEditHSlot(null);
  };
  const setPomStat = (id, key, field, val) => {
    const pom = pomocnici.find(p => p.id === id);
    if (!pom) return;
    const v = Math.max(0, Number(val) || 0);
    updatePom(id, { [key]: { ...pom[key], [field]: v } });
  };
  const updateHSlot = (pomId, idx, patch) => {
    const pom = pomocnici.find(p => p.id === pomId);
    if (!pom) return;
    const next = (pom.inventar || []).map((s, i) => i === idx ? { ...s, ...patch } : s);
    updatePom(pomId, { inventar: next });
  };
  const clearHSlot = (pomId, idx) => {
    updateHSlot(pomId, idx, { nazev: "", typ: "", tecky: { akt: 0, max: 0 } });
    setEditHSlot(null);
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
                  <div key={idx} style={{ border: `1px solid ${C.blue}`, borderRadius: 6, padding: "8px 10px", marginBottom: 4, background: C.blue + "08" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <label style={{ flex: 2 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Název</span>
                        <input autoFocus value={slot.nazev} onChange={e => updateSlot(idx, { nazev: e.target.value })} placeholder="Název předmětu"
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                      <label style={{ flex: 1 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Typ</span>
                        <select value={slot.typ} onChange={e => updateSlot(idx, { typ: e.target.value })}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                          <option value="">—</option>
                          {TYPY.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      {slot.typ === "zbraň" && (
                        <label style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Dmg</span>
                          <select value={slot.dmg || ""} onChange={e => updateSlot(idx, { dmg: e.target.value })}
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                            <option value="">—</option>
                            {["d4","d6","d8","d10"].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </label>
                      )}
                      {slot.typ === "zbroj" && (
                        <label style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Obrana</span>
                          <input type="number" value={slot.obrana ?? ""} onChange={e => updateSlot(idx, { obrana: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="1"
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                        </label>
                      )}
                      <label style={{ flex: 1 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Tečky</span>
                        <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                          <input type="number" value={slot.tecky.akt} onChange={e => updateSlot(idx, { tecky: { ...slot.tecky, akt: Math.max(0, Number(e.target.value) || 0) } })}
                            style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", textAlign: "center" }} />
                          <span style={{ fontSize: 9, color: C.muted }}>/</span>
                          <input type="number" value={slot.tecky.max} onChange={e => updateSlot(idx, { tecky: { ...slot.tecky, max: Math.max(0, Number(e.target.value) || 0) } })}
                            style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", textAlign: "center" }} />
                        </div>
                      </label>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={() => clearSlot(idx)} style={{ border: "none", background: "none", color: C.red, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px" }}>smazat</button>
                      <button onClick={() => setEditSlot(null)} style={{ border: "none", background: "none", color: C.green, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px", fontWeight: 700 }}>✓</button>
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
                      {slot.typ && <span style={{ fontSize: 8, color: C.muted, flexShrink: 0 }}>{slot.typ}{slot.dmg ? ` ${slot.dmg}` : ""}{slot.obrana ? ` ⛨${slot.obrana}` : ""}</span>}
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

      {/* Pomocníci */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: C.muted }}>POMOCNÍCI ({pomocnici.length})</span>
          {pomocnici.length > 0 && (
            <span style={{ fontSize: 9, color: C.yellow }}>
              {pomocnici.reduce((s, p) => s + (p.denniMzda || 0), 0)}ď/den
            </span>
          )}
        </div>
        {pomocnici.map(pom => {
          const hInv = pom.inventar || Array.from({ length: 6 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } }));
          const isExpanded = expandedPom === pom.id;
          return (
            <div key={pom.id} style={{ marginBottom: 4 }}>
              {/* Hlavička — stejný styl jako NPC */}
              <div
                onClick={() => setExpandedPom(isExpanded ? null : pom.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: `1px solid ${isExpanded ? C.green : C.border}`, borderRadius: isExpanded ? "6px 6px 0 0" : 6, fontSize: 11, cursor: "pointer", background: isExpanded ? C.green + "08" : "transparent" }}
              >
                <span style={{ flex: 1, fontWeight: isExpanded ? 700 : 400 }}>{pom.jmeno || "Bez jména"}</span>
                {pom.role && <span style={{ fontSize: 8, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>{pom.role}</span>}
                {pom.denniMzda > 0 && <span style={{ fontSize: 9, color: C.yellow }}>{pom.denniMzda}ď</span>}
                <button onClick={e => { e.stopPropagation(); propustitPomocnika(pom.id); }} style={{ background: "none", border: "none", color: C.red, fontSize: 13, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>✕</button>
              </div>
              {isExpanded && (
              <div style={{ border: `1px solid ${C.green}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 10, background: C.bg, fontSize: 10 }}>
              {/* Jméno, role */}
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Jméno</span>
                  <input value={pom.jmeno} onChange={e => updatePom(pom.id, { jmeno: e.target.value })} placeholder="Jméno"
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                </label>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Role</span>
                  <input value={pom.role} onChange={e => updatePom(pom.id, { role: e.target.value })} placeholder="Světlonoš..."
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                </label>
              </div>
              {/* Věrnost + mzda */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Věrnost</span>
                  <select value={pom.vernost} onChange={e => updatePom(pom.id, { vernost: e.target.value })}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                    <option value="bezny">běžný</option>
                    <option value="verny">věrný</option>
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Mzda (ď/den)</span>
                  <input type="number" value={pom.denniMzda} onChange={e => updatePom(pom.id, { denniMzda: Math.max(0, Number(e.target.value) || 0) })}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                </label>
              </div>
              {/* Staty — grid jako NPC */}
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontWeight: 700 }}>STATY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
                {["str", "dex", "wil", "bo"].map(key => {
                  const s = pom[key];
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, color: C.muted, width: 24, textTransform: "uppercase" }}>{key}</span>
                      <input type="number" value={s.akt} onChange={e => setPomStat(pom.id, key, "akt", e.target.value)} placeholder="akt"
                        style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 4px", fontSize: 10, fontFamily: FONT, textAlign: "center", color: C.text, outline: "none" }} />
                      <span style={{ color: C.muted, fontSize: 9 }}>/</span>
                      <input type="number" value={s.max} onChange={e => setPomStat(pom.id, key, "max", e.target.value)} placeholder="max"
                        style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 4px", fontSize: 10, fontFamily: FONT, textAlign: "center", color: C.text, outline: "none" }} />
                    </div>
                  );
                })}
              </div>
              {/* Inventář pomocníka (6 slotů) */}
              <div style={{ fontSize: 8, color: C.muted, marginBottom: 4, letterSpacing: 0.5 }}>INVENTÁŘ (6 slotů)</div>
              {POMOCNIK_SECTIONS.map(sec => (
                <div key={sec.label}>
                  <div style={{ fontSize: 8, color: C.muted, marginBottom: 2, marginTop: sec.start > 0 ? 4 : 0, letterSpacing: 0.5 }}>{sec.label}</div>
                  {Array.from({ length: sec.count }, (_, j) => {
                    const idx = sec.start + j;
                    const slot = hInv[idx];
                    const empty = !slot.nazev;
                    const editKey = pom.id + ":" + idx;
                    const editing = editHSlot === editKey;
                    const isStav = slot.typ === "stav";

                    if (editing) {
                      return (
                        <div key={idx} style={{ border: `1px solid ${C.blue}`, borderRadius: 6, padding: "8px 10px", marginBottom: 4, background: C.blue + "08" }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <label style={{ flex: 2 }}>
                              <span style={{ color: C.muted, fontSize: 9 }}>Název</span>
                              <input autoFocus value={slot.nazev} onChange={e => updateHSlot(pom.id, idx, { nazev: e.target.value })} placeholder="Název předmětu"
                                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                            </label>
                            <label style={{ flex: 1 }}>
                              <span style={{ color: C.muted, fontSize: 9 }}>Typ</span>
                              <select value={slot.typ} onChange={e => updateHSlot(pom.id, idx, { typ: e.target.value })}
                                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                                <option value="">—</option>
                                {TYPY.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </label>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            {slot.typ === "zbraň" && (
                              <label style={{ flex: 1 }}>
                                <span style={{ color: C.muted, fontSize: 9 }}>Dmg</span>
                                <select value={slot.dmg || ""} onChange={e => updateHSlot(pom.id, idx, { dmg: e.target.value })}
                                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                                  <option value="">—</option>
                                  {["d4","d6","d8","d10"].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </label>
                            )}
                            {slot.typ === "zbroj" && (
                              <label style={{ flex: 1 }}>
                                <span style={{ color: C.muted, fontSize: 9 }}>Obrana</span>
                                <input type="number" value={slot.obrana ?? ""} onChange={e => updateHSlot(pom.id, idx, { obrana: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="1"
                                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                              </label>
                            )}
                            <label style={{ flex: 1 }}>
                              <span style={{ color: C.muted, fontSize: 9 }}>Tečky</span>
                              <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                                <input type="number" value={slot.tecky.akt} onChange={e => updateHSlot(pom.id, idx, { tecky: { ...slot.tecky, akt: Math.max(0, Number(e.target.value) || 0) } })}
                                  style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", textAlign: "center" }} />
                                <span style={{ fontSize: 9, color: C.muted }}>/</span>
                                <input type="number" value={slot.tecky.max} onChange={e => updateHSlot(pom.id, idx, { tecky: { ...slot.tecky, max: Math.max(0, Number(e.target.value) || 0) } })}
                                  style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", textAlign: "center" }} />
                              </div>
                            </label>
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button onClick={() => clearHSlot(pom.id, idx)} style={{ border: "none", background: "none", color: C.red, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px" }}>smazat</button>
                            <button onClick={() => setEditHSlot(null)} style={{ border: "none", background: "none", color: C.green, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px", fontWeight: 700 }}>✓</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} onClick={() => setEditHSlot(editKey)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", marginBottom: 3, border: `1px solid ${empty ? C.border : isStav ? C.red + "55" : C.blue + "55"}`, borderRadius: 5, cursor: "pointer", background: empty ? "transparent" : isStav ? C.red + "08" : C.blue + "08" }}>
                        {empty ? (
                          <span style={{ flex: 1, fontSize: 10, color: C.muted, textAlign: "center" }}>+ prázdný slot</span>
                        ) : (
                          <>
                            <span style={{ flex: 1, fontSize: 11, color: isStav ? C.red : C.text, fontWeight: isStav ? 600 : 400 }}>{slot.nazev}</span>
                            {slot.typ && <span style={{ fontSize: 8, color: C.muted, flexShrink: 0 }}>{slot.typ}{slot.dmg ? ` ${slot.dmg}` : ""}{slot.obrana ? ` ⛨${slot.obrana}` : ""}</span>}
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
              )}
            </div>
          );
        })}
        <button
          onClick={pridatPomocnika}
          style={{ width: "100%", padding: "8px 0", border: `1px dashed ${C.border}`, borderRadius: 6, background: "transparent", fontFamily: FONT, fontSize: 11, color: C.muted, cursor: "pointer" }}
        >+ Přidat pomocníka</button>
      </div>
    </div>
  );
}
