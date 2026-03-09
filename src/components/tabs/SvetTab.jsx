import { useState, lazy, Suspense } from "react";
import { C, FONT } from "../../constants/theme.js";
import { roll, rollMeaning } from "../../utils/dice.js";

const REAKCE_TABLE = [
  [2, "Agresivní"], [5, "Nepřátelská"], [8, "Nejistá"], [11, "Povídavá"], [12, "Nápomocná"]
];

function rollReakce() {
  const hod = roll(6) + roll(6);
  for (const [max, stav] of REAKCE_TABLE) {
    if (hod <= max) return `${hod} → ${stav}`;
  }
  return `${hod} → Nápomocná`;
}

function reakceColor(text) {
  if (!text) return C.muted;
  if (text.includes("Agresivní") || text.includes("Nepřátelská")) return C.red;
  if (text.includes("Nejistá")) return C.yellow;
  return C.green;
}

const DatovyModel = lazy(() => import("../../docs/datovy-model.jsx"));
const SoloRpgDiagram = lazy(() => import("../../docs/solo-rpg-diagram.jsx"));

export default function SvetTab({ cf, npcs, threads, keyedScenes, perilPoints, onGoToLobby, onNpcsChange, onThreadsChange, onKeyedScenesChange, onPerilPointsChange }) {
  const [sub, setSub] = useState("mythic");
  const [newNpc, setNewNpc] = useState("");
  const [newThread, setNewThread] = useState("");
  const [expandedNpc, setExpandedNpc] = useState(null);
  const [expandedThread, setExpandedThread] = useState(null);
  const [docView, setDocView] = useState("model");
  const [newKsTrigger, setNewKsTrigger] = useState("");
  const [newKsUdalost, setNewKsUdalost] = useState("");
  const [expandedKs, setExpandedKs] = useState(null);
  const subs = [["mythic","Mythic"],["npc","NPC"],["thready","Thready"],["klicove","Klíčové"],["mapa","Mapa"],["docs","Docs"]];

  const addNpc = () => {
    const name = newNpc.trim();
    if (!name) return;
    const existing = npcs.findIndex(n => n.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0) {
      if (npcs[existing].weight >= 3) { setNewNpc(""); return; }
      onNpcsChange(npcs.map((n, i) => i === existing ? { ...n, weight: Math.min(3, n.weight + 1) } : n));
    } else {
      if (npcs.length >= 25) return;
      onNpcsChange([...npcs, { name, weight: 1, flag: false }]);
    }
    setNewNpc("");
  };

  const addThread = () => {
    const name = newThread.trim();
    if (!name) return;
    const existing = threads.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0) {
      if (threads[existing].weight >= 3) { setNewThread(""); return; }
      onThreadsChange(threads.map((t, i) => i === existing ? { ...t, weight: Math.min(3, t.weight + 1) } : t));
    } else {
      if (threads.length >= 25) return;
      onThreadsChange([...threads, { name, weight: 1, progress: 0, total: 10, popis: "", stav: "aktivní", typ: "hlavní", poznamky: "" }]);
    }
    setNewThread("");
  };

  const changeNpcWeight = (idx, delta) => {
    onNpcsChange(npcs.map((n, i) => i === idx ? { ...n, weight: Math.max(0, Math.min(3, n.weight + delta)) } : n));
  };

  const hasWikiDetails = (n) => !!(n.popis || n.lokace || n.vztah || n.poznamky);

  const changeThreadWeight = (idx, delta) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, weight: Math.max(1, Math.min(3, t.weight + delta)) } : t));
  };

  const changeProgress = (idx, delta) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, progress: Math.max(0, Math.min(t.total, t.progress + delta)) } : t));
  };

  const updateNpc = (idx, patch) => {
    onNpcsChange(npcs.map((n, i) => i === idx ? { ...n, ...patch } : n));
  };

  const updateNpcStat = (idx, stat, field, value) => {
    const npc = npcs[idx];
    const current = npc[stat] || { akt: 0, max: 0 };
    updateNpc(idx, { [stat]: { ...current, [field]: Number(value) || 0 } });
  };

  const updateThread = (idx, patch) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, ...patch } : t));
  };

  const addInputStyle = { flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" };
  const addBtnStyle = { padding: "5px 10px", border: `1px solid ${C.green}`, background: C.green, color: "white", borderRadius: 4, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: 700 };
  const delBtnStyle = { background: "none", border: "none", color: C.red, fontSize: 13, cursor: "pointer", padding: "0 4px", lineHeight: 1 };
  const weightBtnStyle = { background: "none", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 10, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.text };
  const progressBtnStyle = { background: C.purple + "22", border: `1px solid ${C.purple}`, borderRadius: 4, fontSize: 9, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.purple, fontWeight: 700 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0, overflowX: "auto" }}>
        {subs.map(([id, label]) => (
          <div key={id} onClick={() => setSub(id)} style={{ padding: "8px 14px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", borderBottom: `2px solid ${sub===id?C.green:"transparent"}`, color: sub===id?C.text:C.muted, fontWeight: sub===id?700:400 }}>{label}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {sub === "mythic" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: C.muted }}>CF:</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.yellow }}>{cf}</span>
              <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${(cf / 9) * 100}%`, height: "100%", background: C.yellow, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 9, color: C.muted }}>1–9</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 10px", border: `1px solid ${C.red}30`, borderRadius: 6, background: C.red + "08" }}>
              <span style={{ fontSize: 9, color: C.red, fontWeight: 700, whiteSpace: "nowrap" }}>PERIL POINTS</span>
              <button onClick={() => onPerilPointsChange({ ...perilPoints, aktualni: Math.max(0, perilPoints.aktualni - 1) })} style={{ background: "none", border: `1px solid ${C.red}`, borderRadius: 4, fontSize: 11, cursor: "pointer", padding: "1px 6px", fontFamily: FONT, color: C.red, fontWeight: 700 }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.red, minWidth: 36, textAlign: "center" }}>{perilPoints.aktualni}/{perilPoints.max}</span>
              <button onClick={() => onPerilPointsChange({ ...perilPoints, aktualni: Math.min(perilPoints.max, perilPoints.aktualni + 1) })} style={{ background: "none", border: `1px solid ${C.red}`, borderRadius: 4, fontSize: 11, cursor: "pointer", padding: "1px 6px", fontFamily: FONT, color: C.red, fontWeight: 700 }}>+</button>
              <span style={{ fontSize: 9, color: C.muted, marginLeft: "auto" }}>max:</span>
              <button onClick={() => { const m = Math.max(0, perilPoints.max - 1); onPerilPointsChange({ ...perilPoints, max: m, aktualni: Math.min(perilPoints.aktualni, m) }); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 10, cursor: "pointer", padding: "1px 5px", fontFamily: FONT, color: C.muted }}>−</button>
              <span style={{ fontSize: 11, color: C.muted, minWidth: 14, textAlign: "center" }}>{perilPoints.max}</span>
              <button onClick={() => onPerilPointsChange({ ...perilPoints, max: Math.min(10, perilPoints.max + 1) })} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 10, cursor: "pointer", padding: "1px 5px", fontFamily: FONT, color: C.muted }}>+</button>
            </div>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>NPC SEZNAM ({npcs.filter(n => n.weight >= 1).length}/25)</div>
            {npcs.map((n, origIdx) => {
              if (n.weight < 1) return null;
              return (
                <div key={origIdx} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, fontSize: 11 }}>
                  <span style={{ flex: 1 }}>{n.name}</span>
                  {hasWikiDetails(n) && <span onClick={() => { setSub("npc"); setExpandedNpc(origIdx); }} style={{ cursor: "pointer", fontSize: 12, opacity: 0.6 }} title="Zobrazit wiki kartu">📋</span>}
                  <span style={{ color: n.flag?C.red:C.muted }}>{n.weight}{n.flag&&" ⚠️"}</span>
                </div>
              );
            })}
            {npcs.some(n => n.weight === 0) && (
              <>
                <div style={{ fontSize: 9, color: C.muted, margin: "10px 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ flex: 1, borderBottom: `1px dashed ${C.border}` }} />
                  <span>WIKI-ONLY</span>
                  <span style={{ flex: 1, borderBottom: `1px dashed ${C.border}` }} />
                </div>
                {npcs.map((n, origIdx) => {
                  if (n.weight !== 0) return null;
                  return (
                    <div key={origIdx} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, fontSize: 11, opacity: 0.7 }}>
                      <span style={{ flex: 1, color: C.muted }}>{n.name}</span>
                      <button onClick={() => changeNpcWeight(origIdx, 1)} style={{ background: "none", border: `1px solid ${C.green}`, borderRadius: 4, fontSize: 9, cursor: "pointer", padding: "1px 6px", fontFamily: FONT, color: C.green }}>→ aktivovat</button>
                    </div>
                  );
                })}
              </>
            )}
            <div style={{ fontSize: 9, color: C.muted, margin: "12px 0 6px" }}>THREAD SEZNAM ({threads.length}/25)</div>
            {threads.map((t, i) => (
              <div key={i} style={{ padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span>{t.name}</span><span style={{ color: C.muted }}>{t.weight} · {t.progress}/{t.total}</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(t.progress / t.total) * 100}%`, height: "100%", background: C.purple }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <button onClick={onGoToLobby} style={{ width: "100%", padding: "8px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Správa her</button>
            </div>
          </>
        )}
        {sub === "npc" && (
          <>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>NPC WIKI ({npcs.length}) · aktivní: {npcs.filter(n => n.weight >= 1).length}</div>
            {npcs.filter(n => n.weight >= 1).map((n) => {
              const i = npcs.indexOf(n);
              const isExpanded = expandedNpc === i;
              const vztahColor = n.vztah === "přátelský" ? C.green : n.vztah === "nepřátelský" ? C.red : C.muted;
              return (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: `1px solid ${isExpanded ? C.green : C.border}`, borderRadius: isExpanded ? "6px 6px 0 0" : 6, fontSize: 11, cursor: "pointer", background: isExpanded ? C.green + "08" : "transparent" }}
                    onClick={() => setExpandedNpc(isExpanded ? null : i)}>
                    <span style={{ flex: 1, fontWeight: isExpanded ? 700 : 400 }}>{n.name}</span>
                    {n.weight >= 1
                      ? <span style={{ fontSize: 8, color: C.green, border: `1px solid ${C.green}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>aktivní {n.weight}×</span>
                      : <span style={{ fontSize: 8, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>jen wiki</span>
                    }
                    {n.vztah && <span style={{ fontSize: 8, color: vztahColor, border: `1px solid ${vztahColor}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>{n.vztah}</span>}
                    <button onClick={e => { e.stopPropagation(); changeNpcWeight(i, -1); }} style={weightBtnStyle}>−</button>
                    <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{n.weight}×</span>
                    <button onClick={e => { e.stopPropagation(); changeNpcWeight(i, 1); }} style={weightBtnStyle}>+</button>
                    <button onClick={e => { e.stopPropagation(); onNpcsChange(npcs.filter((_, j) => j !== i)); if (expandedNpc === i) setExpandedNpc(null); }} style={delBtnStyle}>✕</button>
                  </div>
                  {isExpanded && (
                    <div style={{ border: `1px solid ${C.green}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 10, background: C.bg, fontSize: 10 }}>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Popis</span>
                        <textarea value={n.popis || ""} onChange={e => updateNpc(i, { popis: e.target.value })} rows={2}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Lokace</span>
                        <input value={n.lokace || ""} onChange={e => updateNpc(i, { lokace: e.target.value })}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Vztah</span>
                        <select value={n.vztah || ""} onChange={e => updateNpc(i, { vztah: e.target.value })}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                          <option value="">--</option>
                          <option value="přátelský">přátelský</option>
                          <option value="neutrální">neutrální</option>
                          <option value="nepřátelský">nepřátelský</option>
                        </select>
                      </label>
                      <label style={{ display: "block", marginBottom: 8 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Poznámky</span>
                        <textarea value={n.poznamky || ""} onChange={e => updateNpc(i, { poznamky: e.target.value })} rows={2}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Reakce</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            {n.reakce ? (
                              <>
                                <span style={{ fontSize: 10, color: reakceColor(n.reakce), fontWeight: 700, border: `1px solid ${reakceColor(n.reakce)}`, borderRadius: 4, padding: "2px 6px" }}>{n.reakce}</span>
                                <button onClick={e => { e.stopPropagation(); updateNpc(i, { reakce: rollReakce() }); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>🎲</button>
                              </>
                            ) : (
                              <button onClick={e => { e.stopPropagation(); updateNpc(i, { reakce: rollReakce() }); }}
                                style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 9, fontFamily: FONT, color: C.muted, cursor: "pointer" }}>🎲 Hoď reakci (2d6)</button>
                            )}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Motivace</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            {n.motivace ? (
                              <>
                                <span style={{ fontSize: 10, color: C.purple, fontWeight: 700 }}>{n.motivace}</span>
                                <button onClick={e => { e.stopPropagation(); const m = rollMeaning("actions"); updateNpc(i, { motivace: `${m.cz1} + ${m.cz2}` }); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>🎲</button>
                              </>
                            ) : (
                              <button onClick={e => { e.stopPropagation(); const m = rollMeaning("actions"); updateNpc(i, { motivace: `${m.cz1} + ${m.cz2}` }); }}
                                style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 9, fontFamily: FONT, color: C.muted, cursor: "pointer" }}>🎲 Hoď motivaci</button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontWeight: 700 }}>BOJOVÉ STATY</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
                        {["str", "dex", "wil", "bo"].map(stat => (
                          <div key={stat} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 9, color: C.muted, width: 24, textTransform: "uppercase" }}>{stat}</span>
                            <input type="number" value={n[stat]?.akt ?? ""} onChange={e => updateNpcStat(i, stat, "akt", e.target.value)} placeholder="akt"
                              style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 4px", fontSize: 10, fontFamily: FONT, textAlign: "center", color: C.text, outline: "none" }} />
                            <span style={{ color: C.muted, fontSize: 9 }}>/</span>
                            <input type="number" value={n[stat]?.max ?? ""} onChange={e => updateNpcStat(i, stat, "max", e.target.value)} placeholder="max"
                              style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 4px", fontSize: 10, fontFamily: FONT, textAlign: "center", color: C.text, outline: "none" }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <label style={{ flex: 2 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Zbraň</span>
                          <input value={n.zbran || ""} onChange={e => updateNpc(i, { zbran: e.target.value })} placeholder="Meč, Dýka..."
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                        </label>
                        <label style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Dmg</span>
                          <select value={n.dmg || ""} onChange={e => updateNpc(i, { dmg: e.target.value })}
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                            <option value="">—</option>
                            {["d4","d6","d8","d10"].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </label>
                        <label style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Zbroj</span>
                          <input type="number" value={n.zbroj ?? ""} onChange={e => updateNpc(i, { zbroj: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="0"
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                        </label>
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontWeight: 700 }}>PŘEDMĚTY U SEBE</div>
                      {(n.predmetyUSebe || []).map((item, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                          <input value={item} onChange={e => {
                            const items = [...(n.predmetyUSebe || [])];
                            items[j] = e.target.value;
                            updateNpc(i, { predmetyUSebe: items });
                          }}
                            style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none" }} />
                          <button onClick={() => {
                            const items = (n.predmetyUSebe || []).filter((_, k) => k !== j);
                            updateNpc(i, { predmetyUSebe: items });
                          }} style={delBtnStyle}>✕</button>
                        </div>
                      ))}
                      <button onClick={() => updateNpc(i, { predmetyUSebe: [...(n.predmetyUSebe || []), ""] })}
                        style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 4, padding: "3px 8px", fontSize: 9, fontFamily: FONT, color: C.muted, cursor: "pointer", width: "100%" }}>
                        + Přidat předmět
                      </button>
                      <button onClick={() => { changeNpcWeight(i, n.weight >= 1 ? -n.weight : 1); }}
                        style={{ marginTop: 8, width: "100%", padding: "5px 0", border: `1px solid ${n.weight >= 1 ? C.muted : C.green}`, background: "transparent", borderRadius: 4, fontSize: 9, fontFamily: FONT, color: n.weight >= 1 ? C.muted : C.green, cursor: "pointer" }}>
                        {n.weight >= 1 ? "Odebrat ze seznamu (→ wiki-only)" : "Aktivovat v seznamu"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {npcs.some(n => n.weight === 0) && (
              <>
                <div style={{ fontSize: 9, color: C.muted, margin: "12px 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ flex: 1, borderBottom: `1px dashed ${C.border}` }} />
                  <span>WIKI-ONLY</span>
                  <span style={{ flex: 1, borderBottom: `1px dashed ${C.border}` }} />
                </div>
                {npcs.filter(n => n.weight === 0).map((n) => {
                  const i = npcs.indexOf(n);
                  const isExpanded = expandedNpc === i;
                  const vztahColor = n.vztah === "přátelský" ? C.green : n.vztah === "nepřátelský" ? C.red : C.muted;
                  return (
                    <div key={i} style={{ marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: `1px solid ${isExpanded ? C.muted : C.border}`, borderRadius: isExpanded ? "6px 6px 0 0" : 6, fontSize: 11, cursor: "pointer", background: isExpanded ? C.bg : "transparent", opacity: 0.8 }}
                        onClick={() => setExpandedNpc(isExpanded ? null : i)}>
                        <span style={{ flex: 1, fontWeight: isExpanded ? 700 : 400, color: C.muted }}>{n.name}</span>
                        <span style={{ fontSize: 8, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>jen wiki</span>
                        {n.vztah && <span style={{ fontSize: 8, color: vztahColor, border: `1px solid ${vztahColor}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>{n.vztah}</span>}
                        <button onClick={e => { e.stopPropagation(); changeNpcWeight(i, 1); }} style={{ ...weightBtnStyle, color: C.green, borderColor: C.green, fontSize: 9 }}>→ aktivovat</button>
                        <button onClick={e => { e.stopPropagation(); onNpcsChange(npcs.filter((_, j) => j !== i)); if (expandedNpc === i) setExpandedNpc(null); }} style={delBtnStyle}>✕</button>
                      </div>
                      {isExpanded && (
                        <div style={{ border: `1px solid ${C.muted}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 10, background: C.bg, fontSize: 10 }}>
                          <label style={{ display: "block", marginBottom: 6 }}>
                            <span style={{ color: C.muted, fontSize: 9 }}>Popis</span>
                            <textarea value={n.popis || ""} onChange={e => updateNpc(i, { popis: e.target.value })} rows={2}
                              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                          </label>
                          <label style={{ display: "block", marginBottom: 6 }}>
                            <span style={{ color: C.muted, fontSize: 9 }}>Lokace</span>
                            <input value={n.lokace || ""} onChange={e => updateNpc(i, { lokace: e.target.value })}
                              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                          </label>
                          <label style={{ display: "block", marginBottom: 6 }}>
                            <span style={{ color: C.muted, fontSize: 9 }}>Poznámky</span>
                            <textarea value={n.poznamky || ""} onChange={e => updateNpc(i, { poznamky: e.target.value })} rows={2}
                              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                          </label>
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: C.muted, fontSize: 9 }}>Reakce</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                {n.reakce ? (
                                  <>
                                    <span style={{ fontSize: 10, color: reakceColor(n.reakce), fontWeight: 700, border: `1px solid ${reakceColor(n.reakce)}`, borderRadius: 4, padding: "2px 6px" }}>{n.reakce}</span>
                                    <button onClick={e => { e.stopPropagation(); updateNpc(i, { reakce: rollReakce() }); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>🎲</button>
                                  </>
                                ) : (
                                  <button onClick={e => { e.stopPropagation(); updateNpc(i, { reakce: rollReakce() }); }}
                                    style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 9, fontFamily: FONT, color: C.muted, cursor: "pointer" }}>🎲 Hoď reakci (2d6)</button>
                                )}
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: C.muted, fontSize: 9 }}>Motivace</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                {n.motivace ? (
                                  <>
                                    <span style={{ fontSize: 10, color: C.purple, fontWeight: 700 }}>{n.motivace}</span>
                                    <button onClick={e => { e.stopPropagation(); const m = rollMeaning("actions"); updateNpc(i, { motivace: `${m.cz1} + ${m.cz2}` }); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>🎲</button>
                                  </>
                                ) : (
                                  <button onClick={e => { e.stopPropagation(); const m = rollMeaning("actions"); updateNpc(i, { motivace: `${m.cz1} + ${m.cz2}` }); }}
                                    style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 9, fontFamily: FONT, color: C.muted, cursor: "pointer" }}>🎲 Hoď motivaci</button>
                                )}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => changeNpcWeight(i, 1)}
                            style={{ width: "100%", padding: "5px 0", border: `1px solid ${C.green}`, background: "transparent", borderRadius: 4, fontSize: 9, fontFamily: FONT, color: C.green, cursor: "pointer" }}>
                            Aktivovat v seznamu
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <input value={newNpc} onChange={e => setNewNpc(e.target.value)} onKeyDown={e => e.key === "Enter" && addNpc()} placeholder="Nový NPC..." style={addInputStyle} />
              <button onClick={addNpc} style={addBtnStyle}>+ NPC</button>
            </div>
          </>
        )}
        {sub === "thready" && (
          <>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>THREAD SEZNAM ({threads.length}/25)</div>
            {threads.map((t, i) => {
              const isExpanded = expandedThread === i;
              const stavColor = t.stav === "vyřešený" ? C.green : t.stav === "opuštěný" ? C.muted : C.purple;
              return (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div
                    onClick={() => setExpandedThread(isExpanded ? null : i)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: `1px solid ${isExpanded ? C.purple : C.border}`, borderRadius: isExpanded ? "6px 6px 0 0" : 6, fontSize: 11, cursor: "pointer", background: isExpanded ? C.purple + "08" : "transparent" }}
                  >
                    <span style={{ flex: 1, fontWeight: isExpanded ? 700 : 400 }}>{t.name}</span>
                    {t.typ && t.typ !== "hlavní" && <span style={{ fontSize: 8, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>{t.typ}</span>}
                    <span style={{ fontSize: 8, color: stavColor, border: `1px solid ${stavColor}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>{t.stav || "aktivní"}</span>
                    <button onClick={e => { e.stopPropagation(); changeProgress(i, -1); }} style={progressBtnStyle}>−</button>
                    <span style={{ fontSize: 9, color: C.purple, minWidth: 28, textAlign: "center" }}>{t.progress}/{t.total}</span>
                    <button onClick={e => { e.stopPropagation(); changeProgress(i, 1); }} style={progressBtnStyle}>+1</button>
                    <button onClick={e => { e.stopPropagation(); changeProgress(i, 2); }} style={progressBtnStyle}>+2</button>
                    <button onClick={e => { e.stopPropagation(); changeThreadWeight(i, -1); }} style={weightBtnStyle}>−</button>
                    <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{t.weight}×</span>
                    <button onClick={e => { e.stopPropagation(); changeThreadWeight(i, 1); }} style={weightBtnStyle}>+</button>
                    <button onClick={e => { e.stopPropagation(); onThreadsChange(threads.filter((_, j) => j !== i)); if (expandedThread === i) setExpandedThread(null); }} style={delBtnStyle}>✕</button>
                  </div>
                  {isExpanded && (
                    <div style={{ border: `1px solid ${C.purple}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 10, background: C.bg, fontSize: 10 }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <label style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Typ</span>
                          <select value={t.typ || "hlavní"} onChange={e => updateThread(i, { typ: e.target.value })}
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                            <option value="hlavní">hlavní</option>
                            <option value="vedlejší">vedlejší</option>
                            <option value="osobní">osobní</option>
                          </select>
                        </label>
                        <label style={{ flex: 1 }}>
                          <span style={{ color: C.muted, fontSize: 9 }}>Stav</span>
                          <select value={t.stav || "aktivní"} onChange={e => updateThread(i, { stav: e.target.value })}
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                            <option value="aktivní">aktivní</option>
                            <option value="vyřešený">vyřešený</option>
                            <option value="opuštěný">opuštěný</option>
                          </select>
                        </label>
                      </div>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Popis</span>
                        <textarea value={t.popis || ""} onChange={e => updateThread(i, { popis: e.target.value })} rows={2}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                      <label style={{ display: "block" }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Poznámky</span>
                        <textarea value={t.poznamky || ""} onChange={e => updateThread(i, { poznamky: e.target.value })} rows={2}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <input value={newThread} onChange={e => setNewThread(e.target.value)} onKeyDown={e => e.key === "Enter" && addThread()} placeholder="Nový Thread..." style={addInputStyle} />
              <button onClick={addThread} style={addBtnStyle}>+ Thread</button>
            </div>
          </>
        )}
        {sub === "klicove" && (
          <>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>KLÍČOVÉ SCÉNY ({keyedScenes.length})</div>
            {keyedScenes.map((ks, i) => {
              const isExpanded = expandedKs === i;
              return (
                <div key={ks.id} style={{ marginBottom: 4 }}>
                  <div
                    onClick={() => setExpandedKs(isExpanded ? null : i)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", border: `1px solid ${isExpanded ? C.blue : C.border}`, borderRadius: isExpanded ? "6px 6px 0 0" : 6, fontSize: 11, cursor: "pointer", background: isExpanded ? C.blue + "08" : "transparent" }}
                  >
                    <span
                      onClick={e => { e.stopPropagation(); onKeyedScenesChange(keyedScenes.map((k, j) => j === i ? { ...k, spustena: !k.spustena } : k)); }}
                      style={{ fontSize: 14, cursor: "pointer", lineHeight: 1 }}
                    >{ks.spustena ? "✅" : "⬜"}</span>
                    <span style={{ flex: 1, fontWeight: isExpanded ? 700 : 400, textDecoration: ks.spustena ? "line-through" : "none", color: ks.spustena ? C.muted : C.text }}>{ks.trigger}</span>
                    <button onClick={e => { e.stopPropagation(); onKeyedScenesChange(keyedScenes.filter((_, j) => j !== i)); if (expandedKs === i) setExpandedKs(null); }} style={delBtnStyle}>✕</button>
                  </div>
                  {!isExpanded && ks.udalost && (
                    <div style={{ padding: "2px 10px 4px 32px", fontSize: 10, color: C.muted }}>{ks.udalost}</div>
                  )}
                  {isExpanded && (
                    <div style={{ border: `1px solid ${C.blue}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 10, background: C.bg, fontSize: 10 }}>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Trigger</span>
                        <input value={ks.trigger} onChange={e => onKeyedScenesChange(keyedScenes.map((k, j) => j === i ? { ...k, trigger: e.target.value } : k))}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                      <label style={{ display: "block" }}>
                        <span style={{ color: C.muted, fontSize: 9 }}>Událost</span>
                        <textarea value={ks.udalost} onChange={e => onKeyedScenesChange(keyedScenes.map((k, j) => j === i ? { ...k, udalost: e.target.value } : k))} rows={2}
                          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              <input value={newKsTrigger} onChange={e => setNewKsTrigger(e.target.value)} placeholder="Trigger (kdy se spustí)..." style={addInputStyle} />
              <input value={newKsUdalost} onChange={e => setNewKsUdalost(e.target.value)} placeholder="Událost (co se stane)..." style={addInputStyle} />
              <button onClick={() => {
                const trigger = newKsTrigger.trim();
                if (!trigger) return;
                onKeyedScenesChange([...keyedScenes, { id: Date.now().toString(36), trigger, udalost: newKsUdalost.trim(), spustena: false }]);
                setNewKsTrigger("");
                setNewKsUdalost("");
              }} style={{ ...addBtnStyle, width: "100%" }}>+ Klíčová scéna</button>
            </div>
          </>
        )}
        {sub === "mapa" && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 40 }}>Hexcrawl mapa — placeholder</div>
        )}
        {sub === "docs" && (
          <>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              {[["model", "Datový model"], ["diagram", "Diagram"]].map(([id, label]) => (
                <button key={id} onClick={() => setDocView(id)}
                  style={{ flex: 1, padding: "6px 0", border: `1px solid ${docView === id ? C.green : C.border}`, background: docView === id ? C.green + "15" : "transparent", borderRadius: 6, fontSize: 10, fontFamily: FONT, color: docView === id ? C.green : C.muted, fontWeight: docView === id ? 700 : 400, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
            <Suspense fallback={<div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 20 }}>Načítání...</div>}>
              {docView === "model" ? <DatovyModel /> : <SoloRpgDiagram />}
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
