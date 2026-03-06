import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";

export default function SvetTab({ cf, npcs, threads, onGoToLobby, onNpcsChange, onThreadsChange }) {
  const [sub, setSub] = useState("mythic");
  const [newNpc, setNewNpc] = useState("");
  const [newThread, setNewThread] = useState("");
  const subs = [["mythic","Mythic"],["npc","NPC"],["thready","Thready"],["mapa","Mapa"]];

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
      onThreadsChange([...threads, { name, weight: 1, progress: 0, total: 10 }]);
    }
    setNewThread("");
  };

  const changeNpcWeight = (idx, delta) => {
    onNpcsChange(npcs.map((n, i) => i === idx ? { ...n, weight: Math.max(1, Math.min(3, n.weight + delta)) } : n));
  };

  const changeThreadWeight = (idx, delta) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, weight: Math.max(1, Math.min(3, t.weight + delta)) } : t));
  };

  const addProgress = (idx) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, progress: Math.min(t.total, t.progress + 2) } : t));
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
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>NPC SEZNAM ({npcs.length}/25)</div>
            {npcs.map((n, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, fontSize: 11 }}>
                <span>{n.name}</span>
                <span style={{ color: n.flag?C.red:C.muted }}>{n.weight}{n.flag&&" ⚠️"}</span>
              </div>
            ))}
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
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>NPC SEZNAM ({npcs.length}/25)</div>
            {npcs.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 }}>
                <span style={{ flex: 1 }}>{n.name}</span>
                <button onClick={() => changeNpcWeight(i, -1)} style={weightBtnStyle}>−</button>
                <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{n.weight}×</span>
                <button onClick={() => changeNpcWeight(i, 1)} style={weightBtnStyle}>+</button>
                <button onClick={() => onNpcsChange(npcs.filter((_, j) => j !== i))} style={delBtnStyle}>✕</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <input value={newNpc} onChange={e => setNewNpc(e.target.value)} onKeyDown={e => e.key === "Enter" && addNpc()} placeholder="Nový NPC..." style={addInputStyle} />
              <button onClick={addNpc} style={addBtnStyle}>+ NPC</button>
            </div>
          </>
        )}
        {sub === "thready" && (
          <>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>THREAD SEZNAM ({threads.length}/25)</div>
            {threads.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 }}>
                <span style={{ flex: 1 }}>{t.name}</span>
                <span style={{ fontSize: 9, color: C.purple }}>{t.progress}/{t.total}</span>
                <button onClick={() => addProgress(i)} style={progressBtnStyle}>+2</button>
                <button onClick={() => changeThreadWeight(i, -1)} style={weightBtnStyle}>−</button>
                <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{t.weight}×</span>
                <button onClick={() => changeThreadWeight(i, 1)} style={weightBtnStyle}>+</button>
                <button onClick={() => onThreadsChange(threads.filter((_, j) => j !== i))} style={delBtnStyle}>✕</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <input value={newThread} onChange={e => setNewThread(e.target.value)} onKeyDown={e => e.key === "Enter" && addThread()} placeholder="Nový Thread..." style={addInputStyle} />
              <button onClick={addThread} style={addBtnStyle}>+ Thread</button>
            </div>
          </>
        )}
        {sub === "mapa" && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 40 }}>Hexcrawl mapa — placeholder</div>
        )}
      </div>
    </div>
  );
}
