import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import Sheet from "../ui/Sheet.jsx";

export default function EndSceneSheet({ onClose, cf, sceneNum, onCFChange, npcs, threads, onNpcsChange, onThreadsChange, onInsert }) {
  const [choice, setChoice] = useState(null);
  const [newNpc, setNewNpc] = useState("");
  const [newThread, setNewThread] = useState("");
  const [showNpcSuggestions, setShowNpcSuggestions] = useState(false);

  const npcSuggestions = newNpc.trim() ? npcs.filter(n => n.name.toLowerCase().includes(newNpc.trim().toLowerCase()) && n.weight < 1) : [];

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

  const changeThreadWeight = (idx, delta) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, weight: Math.max(1, Math.min(3, t.weight + delta)) } : t));
  };

  const changeProgress = (idx, delta) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, progress: Math.max(0, Math.min(t.total, t.progress + delta)) } : t));
  };

  const doEnd = () => {
    const newCf = choice === "minus" ? Math.max(1, cf - 1) : choice === "plus" ? Math.min(9, cf + 1) : cf;
    if (choice) onCFChange(newCf);
    if (onInsert) {
      onInsert({ type: "endscene", sceneNum, cfOld: cf, cfNew: newCf });
    }
    onClose();
  };

  const listItemStyle = { display: "flex", alignItems: "center", gap: 4, marginBottom: 4, padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontFamily: FONT, flexWrap: "wrap", overflow: "hidden" };
  const addRowStyle = { display: "flex", gap: 4, marginBottom: 10 };
  const addInputStyle = { flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" };
  const addBtnStyle = { padding: "5px 10px", border: `1px solid ${C.green}`, background: C.green, color: "white", borderRadius: 4, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: 700 };
  const delBtnStyle = { background: "none", border: "none", color: C.red, fontSize: 13, cursor: "pointer", padding: "0 2px", lineHeight: 1 };
  const weightBtnStyle = { background: "none", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 10, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.text };
  const progressBtnStyle = { background: C.purple + "22", border: `1px solid ${C.purple}`, borderRadius: 4, fontSize: 9, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.purple, fontWeight: 700 };

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Konec scény — bookkeeping</div>
      <div style={{ marginBottom: 12 }}>
        Scéna skončila. Teď je čas zhodnotit co se stalo — appka upraví Chaos Faktor a ty spravíš seznamy NPC a příběhových linek.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.text + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: myš prohledala mlýn, potkala krysu, utekla. Co to znamená pro příběh?
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>1. Měla postava kontrolu?</div>
      <div style={{ marginBottom: 4 }}>
        Pokud tvá postava ovládala situaci → CF klesá (příběh je klidnější). Pokud ne → CF stoupá (víc chaosu příště).
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Myš utekla krysám bez plánu → NE → CF stoupá z 5 na 6.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>2. Uprav NPC seznam</div>
      <div style={{ marginBottom: 10 }}>
        Přidej nové postavy, které se objevily. Váha (1-3×) určuje jak moc jsou důležité pro příběh — čím víc, tím častěji se objeví v náhodných událostech.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>3. Uprav příběhové linky</div>
      <div style={{ marginBottom: 4 }}>
        Přidej nové thready nebo posuň progress stávajících. Váha (1-3×) ovlivňuje šanci na náhodné zapojení.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Nový thread: „Proč jsou v mlýně krysy?" — progress 0/10, váha 1×.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        CF ovlivňuje příští scénu — vyšší CF = větší šance na zvrat. Po ukončení pokračuj novou scénou.
      </div>
    </>
  );

  return (
    <Sheet title={`📕 KONEC SCÉNY ${sceneNum}`} onClose={onClose} help={helpContent}>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT }}>MĚLA POSTAVA KONTROLU NAD PRŮBĚHEM SCÉNY?</div>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 8, fontFamily: FONT, fontStyle: "italic" }}>ANO (hráč řídil děj) → CF−1 · NE (chaos převládl) → CF+1</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setChoice("minus")} style={{ flex: 1, padding: "10px 0", border: `1px solid ${choice==="minus" ? C.green : C.border}`, background: choice==="minus" ? C.green + "22" : "transparent", borderRadius: 8, fontSize: 11, fontFamily: FONT, cursor: "pointer", color: C.green, fontWeight: choice==="minus" ? 700 : 400 }}>ANO → CF−1<br /><span style={{ fontSize: 10 }}>{cf} → {Math.max(1, cf - 1)}</span></button>
        <button onClick={() => setChoice("plus")} style={{ flex: 1, padding: "10px 0", border: `1px solid ${choice==="plus" ? C.red : C.border}`, background: choice==="plus" ? C.red + "22" : "transparent", borderRadius: 8, fontSize: 11, fontFamily: FONT, cursor: "pointer", color: C.red, fontWeight: choice==="plus" ? 700 : 400 }}>NE → CF+1<br /><span style={{ fontSize: 10 }}>{cf} → {Math.min(9, cf + 1)}</span></button>
      </div>

      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT }}>── NPC ({npcs.filter(n => n.weight >= 1).length}/25) ──</div>
      {npcs.map((n, origIdx) => {
        if (n.weight < 1) return null;
        return (
          <div key={origIdx} style={listItemStyle}>
            <span style={{ flex: 1 }}>{n.name}</span>
            <button onClick={() => changeNpcWeight(origIdx, -1)} style={weightBtnStyle}>−</button>
            <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{n.weight}×</span>
            <button onClick={() => changeNpcWeight(origIdx, 1)} style={weightBtnStyle}>+</button>
            <button onClick={() => onNpcsChange(npcs.filter((_, j) => j !== origIdx))} style={delBtnStyle}>✕</button>
          </div>
        );
      })}
      <div style={{ ...addRowStyle, position: "relative" }}>
        <input value={newNpc} onChange={e => { setNewNpc(e.target.value); setShowNpcSuggestions(true); }} onKeyDown={e => e.key === "Enter" && addNpc()} onFocus={() => setShowNpcSuggestions(true)} onBlur={() => setTimeout(() => setShowNpcSuggestions(false), 150)} placeholder="Nový NPC..." style={addInputStyle} />
        <button onClick={addNpc} style={addBtnStyle}>+ NPC</button>
        {showNpcSuggestions && npcSuggestions.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 60, background: "white", border: `1px solid ${C.border}`, borderRadius: 4, zIndex: 10, maxHeight: 120, overflowY: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            {npcSuggestions.map((n, i) => (
              <div key={i} onClick={() => { setNewNpc(n.name); setShowNpcSuggestions(false); }} style={{ padding: "6px 8px", fontSize: 10, fontFamily: FONT, color: C.text, cursor: "pointer", borderBottom: `1px solid ${C.border}` }}>
                {n.name} <span style={{ color: C.muted, fontSize: 8 }}>wiki-only</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT }}>── THREADY ({threads.length}/25) ──</div>
      {threads.map((t, i) => (
        <div key={i} style={listItemStyle}>
          <span style={{ flex: 1 }}>{t.name}</span>
          <button onClick={() => changeProgress(i, -1)} style={progressBtnStyle}>−</button>
          <span style={{ fontSize: 9, color: C.purple, minWidth: 28, textAlign: "center" }}>{t.progress}/{t.total}</span>
          <button onClick={() => changeProgress(i, 1)} style={progressBtnStyle}>+1</button>
          <button onClick={() => changeProgress(i, 2)} style={progressBtnStyle}>+2</button>
          <button onClick={() => changeThreadWeight(i, -1)} style={weightBtnStyle}>−</button>
          <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{t.weight}×</span>
          <button onClick={() => changeThreadWeight(i, 1)} style={weightBtnStyle}>+</button>
          <button onClick={() => onThreadsChange(threads.filter((_, j) => j !== i))} style={delBtnStyle}>✕</button>
        </div>
      ))}
      <div style={addRowStyle}>
        <input value={newThread} onChange={e => setNewThread(e.target.value)} onKeyDown={e => e.key === "Enter" && addThread()} placeholder="Nový Thread..." style={addInputStyle} />
        <button onClick={addThread} style={addBtnStyle}>+ Thread</button>
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, fontFamily: FONT, fontStyle: "italic" }}>
        💡 Nezapomeň aktualizovat NPC wiki karty po setkání
      </div>

      <button onClick={doEnd} style={{ width: "100%", height: 46, background: C.text, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>UKONČIT SCÉNU</button>
    </Sheet>
  );
}
