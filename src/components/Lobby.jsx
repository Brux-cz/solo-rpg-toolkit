import { useState } from "react";
import { C, FONT } from "../constants/theme.js";
import { loadIndex, saveIndex, loadGameById, saveGameById, deleteGameById, exportGame, formatDate, genId, INITIAL_GAME, CURRENT_VERSION } from "../store/gameStore.js";
import scenarioRaw from "../agent/saves/okral-scenar.md?raw";
import novelaRaw from "../agent/saves/okral-novela.md?raw";
function MdRenderer({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  const fmt = (s) => {
    const parts = [];
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0, m;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) parts.push(s.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index} style={{ color: C.muted }}>{m[3]}</em>);
      last = re.lastIndex;
    }
    if (last < s.length) parts.push(s.slice(last));
    return parts.length ? parts : s;
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{ fontSize: 13, fontWeight: 700, color: C.green, margin: "18px 0 6px" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "24px 0 8px", borderBottom: `1px solid ${C.border}`, paddingBottom: 6 }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>{line.slice(2)}</h1>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "12px 0" }} />);
    } else if (line.trim() === "") {
      // skip
    } else {
      elements.push(<p key={i} style={{ fontSize: 11, lineHeight: 1.7, color: C.text, margin: "4px 0" }}>{fmt(line)}</p>);
    }
    i++;
  }
  return <>{elements}</>;
}

export default function Lobby({ onPlay }) {
  const [index, setIndex] = useState(loadIndex);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [importError, setImportError] = useState(null);
  const [showReading, setShowReading] = useState(null);

  const handleCreate = () => {
    const name = newName.trim() || ("Hra " + (index.saves.length + 1));
    const id = genId();
    const game = { ...INITIAL_GAME };
    saveGameById(id, game);
    const newIndex = {
      activeId: id,
      saves: [...index.saves, { id, name, lastPlayed: Date.now(), sceneNum: game.sceneNum, cf: game.cf }],
    };
    saveIndex(newIndex);
    setIndex(newIndex);
    setCreating(false);
    setNewName("");
    onPlay(id, game);
  };

  const handlePlay = (id) => {
    const game = loadGameById(id);
    const newIndex = { ...index, activeId: id };
    saveIndex(newIndex);
    setIndex(newIndex);
    onPlay(id, game);
  };

  const handleDelete = (id) => {
    deleteGameById(id);
    const newSaves = index.saves.filter(s => s.id !== id);
    const newIndex = { activeId: index.activeId === id ? null : index.activeId, saves: newSaves };
    saveIndex(newIndex);
    setIndex(newIndex);
    setConfirmDelete(null);
  };

  const handleExport = (id) => {
    const save = index.saves.find(s => s.id === id);
    const game = loadGameById(id);
    exportGame(id, save?.name, game);
  };


  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!parsed.exportVersion || !parsed.game) throw new Error("bad format");
          const id = genId();
          const game = { ...INITIAL_GAME, ...parsed.game, version: CURRENT_VERSION };
          const name = parsed.name || ("Import " + (index.saves.length + 1));
          saveGameById(id, game);
          const newIndex = {
            ...index,
            saves: [...index.saves, { id, name, lastPlayed: Date.now(), sceneNum: game.sceneNum, cf: game.cf }],
          };
          saveIndex(newIndex);
          setIndex(newIndex);
          setImportError(null);
        } catch {
          setImportError("Neplatný soubor");
          setTimeout(() => setImportError(null), 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (showReading) {
    const readingText = showReading === "scenar" ? scenarioRaw : novelaRaw;
    const readingTitle = showReading === "scenar" ? "Scénář" : "Novela";
    return (
      <div style={{ width: "100%", height: "100dvh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: FONT, overflow: "hidden" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          ::-webkit-scrollbar { width: 2px }
          ::-webkit-scrollbar-thumb { background: #ddd }
        `}</style>
        <div style={{ padding: "12px 16px", flexShrink: 0, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setShowReading(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 10, fontFamily: FONT, color: C.muted, cursor: "pointer" }}>Zpět</button>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{readingTitle}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 40px" }}>
          <MdRenderer text={readingText} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100dvh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: FONT, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 2px }
        ::-webkit-scrollbar-thumb { background: #ddd }
      `}</style>

      <div style={{ padding: "20px 16px 10px", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Solo RPG Companion</div>
        <div style={{ fontSize: 10, color: C.muted }}>Mythic GME 2e + Mausritter</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
        {index.saves.length === 0 && !creating && (
          <div style={{ marginTop: 20, padding: "14px 16px", background: C.green + "10", borderRadius: 10, fontSize: 11, lineHeight: 1.7, color: C.text }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Vítej v Solo RPG Companion!</div>
            <div style={{ marginBottom: 8, color: C.muted }}>
              Tahle appka ti umožňuje hrát stolní RPG úplně sám. Nemusíš čekat na partu — appka simuluje Game Mastera za tebe. Ty jsi hráč i vypravěč zároveň.
            </div>
            <div style={{ marginBottom: 8, color: C.muted }}>
              Píšeš příběh své postavy — malé myši ve velkém světě (Mausritter). Když potřebuješ rozhodnutí, ptáš se orákula: „Je tu nepřítel?" — a osud odpoví.
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Jak začít?</div>
            <div style={{ color: C.muted }}>
              Klikni <span style={{ color: C.green, fontWeight: 600 }}>+ Nová hra</span> níže. Pojmenuj si kampaň a jsi v deníku — tam se odehrává celý příběh. Neboj se, všude najdeš nápovědu <span style={{ color: C.blue, fontWeight: 700, border: `1px solid ${C.border}`, borderRadius: 12, padding: "0 5px", fontSize: 10 }}>?</span> která tě provede.
            </div>
          </div>
        )}

        {index.saves.map((s) => (
          <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{s.name}</span>
              <span style={{ fontSize: 9, color: C.muted }}>{formatDate(s.lastPlayed)}</span>
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>
              Scéna {s.sceneNum} · CF {s.cf}
            </div>
            {confirmDelete === s.id ? (
              <div>
                <div style={{ fontSize: 10, color: C.red, marginBottom: 6 }}>Opravdu smazat?</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Zrušit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.red}`, background: C.red + "22", borderRadius: 6, fontSize: 10, color: C.red, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>Smazat</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handlePlay(s.id)} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.green}`, background: C.green, borderRadius: 6, fontSize: 10, color: "white", fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>Hrát</button>
                <button onClick={() => handleExport(s.id)} style={{ padding: "7px 10px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Export</button>
                <button onClick={() => setConfirmDelete(s.id)} style={{ padding: "7px 10px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.red, fontFamily: FONT, cursor: "pointer" }}>Smazat</button>
              </div>
            )}
          </div>
        ))}

        {creating ? (
          <div style={{ border: `1px solid ${C.green}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>NÁZEV HRY:</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={"Hra " + (index.saves.length + 1)}
              autoFocus
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 10, background: "white", fontFamily: FONT, outline: "none", color: C.text }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { setCreating(false); setNewName(""); }} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Zrušit</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.green}`, background: C.green, borderRadius: 6, fontSize: 10, color: "white", fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>Vytvořit</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} style={{ width: "100%", padding: "10px 0", border: `1px dashed ${C.green}`, background: "transparent", borderRadius: 8, fontSize: 11, color: C.green, fontWeight: 600, fontFamily: FONT, cursor: "pointer", marginBottom: 8 }}>+ Nová hra</button>
        )}

        <button onClick={handleImport} style={{ width: "100%", padding: "8px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Importovat</button>
        {importError && <div style={{ fontSize: 10, color: C.red, textAlign: "center", marginTop: 6 }}>{importError}</div>}

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>KE ČTENÍ</div>
          <button onClick={() => setShowReading("scenar")} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.blue}`, background: C.blue + "10", borderRadius: 8, fontSize: 11, color: C.text, fontFamily: FONT, cursor: "pointer", textAlign: "left", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Okřál Trnka — Scénář</div>
            <div style={{ fontSize: 9, color: C.muted }}>Filmový scénář · Prolog + 4 akty</div>
          </button>
          <button onClick={() => setShowReading("novela")} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.green}`, background: C.green + "10", borderRadius: 8, fontSize: 11, color: C.text, fontFamily: FONT, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Okřál Trnka — Novela</div>
            <div style={{ fontSize: 9, color: C.muted }}>Příběh · Prolog + 4 kapitoly</div>
          </button>
        </div>
      </div>
    </div>
  );
}
