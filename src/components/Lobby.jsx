import { useState } from "react";
import { C, FONT } from "../constants/theme.js";
import { loadIndex, saveIndex, loadGameById, saveGameById, deleteGameById, exportGame, formatDate, genId, INITIAL_GAME, CURRENT_VERSION } from "../store/gameStore.js";

export default function Lobby({ onPlay }) {
  const [index, setIndex] = useState(loadIndex);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [importError, setImportError] = useState(null);

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
      </div>
    </div>
  );
}
