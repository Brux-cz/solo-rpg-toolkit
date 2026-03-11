import { useState, useEffect } from "react";
import { C, FONT } from "./constants/theme.js";
import { loadIndex, saveIndex, loadGameById, saveGameById, INITIAL_GAME } from "./store/gameStore.js";
import { rerollEntry } from "./utils/reroll.js";
import Header from "./components/ui/Header.jsx";
import EditorArea from "./components/ui/EditorArea.jsx";
import ActionToolbar from "./components/ui/ActionToolbar.jsx";
import BottomNav from "./components/ui/BottomNav.jsx";
import FateSheet from "./components/sheets/FateSheet.jsx";
import SceneSheet from "./components/sheets/SceneSheet.jsx";
import MeaningSheet from "./components/sheets/MeaningSheet.jsx";
import EndSceneSheet from "./components/sheets/EndSceneSheet.jsx";
import CombatSheet from "./components/sheets/CombatSheet.jsx";
import NoteSheet from "./components/sheets/NoteSheet.jsx";
import DetailCheckSheet from "./components/sheets/DetailCheckSheet.jsx";
import DiceSheet from "./components/sheets/DiceSheet.jsx";
import RestSheet from "./components/sheets/RestSheet.jsx";
import DiscoveryCheckSheet from "./components/sheets/DiscoveryCheckSheet.jsx";
import CharCreateSheet from "./components/sheets/CharCreateSheet.jsx";
import BehaviorSheet from "./components/sheets/BehaviorSheet.jsx";
import TimeTracker from "./components/ui/TimeTracker.jsx";
import PostavaTab from "./components/tabs/PostavaTab.jsx";
import SvetTab from "./components/tabs/SvetTab.jsx";
import Lobby from "./components/Lobby.jsx";

export default function Prototype() {
  const [initIndex] = useState(loadIndex);
  const [screen, setScreen] = useState(initIndex.activeId ? "game" : "lobby");
  const [activeId, setActiveId] = useState(initIndex.activeId);

  const [tab, setTab] = useState("diary");
  const [sheet, setSheet] = useState(null);
  const showKeyboard = false;
  const [headerExpanded, setHeaderExpanded] = useState(false);

  const [game, setGame] = useState(() => activeId ? loadGameById(activeId) : INITIAL_GAME);

  const updateGame = (patch) => setGame(g => ({ ...g, ...patch }));

  // API klíč přes URL hash: #apikey=sk-ant-...
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#apikey=")) {
      const key = decodeURIComponent(hash.slice(8));
      if (key) localStorage.setItem("solorpg_api_key", key);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.target.type === "number") e.target.select(); };
    document.addEventListener("focus", handler, true);
    return () => document.removeEventListener("focus", handler, true);
  }, []);

  useEffect(() => {
    if (activeId && screen === "game") {
      saveGameById(activeId, game);
      try {
        const idx = loadIndex();
        const save = idx.saves.find(s => s.id === activeId);
        if (save) {
          save.lastPlayed = Date.now();
          save.sceneNum = game.sceneNum;
          save.cf = game.cf;
          saveIndex(idx);
        }
      } catch { /* ignore */ }
    }
  }, [game, activeId, screen]);

  const sheetOpen = !!sheet;

  const handleInsert = (entry) => {
    setGame(g => ({
      ...g,
      entries: [...g.entries, entry],
      ...(entry.type === "scene" ? { sceneNum: entry.sceneNum } : {}),
    }));
  };

  const handleDeleteEntry = (index) => {
    setGame(g => ({ ...g, entries: g.entries.filter((_, i) => i !== index) }));
  };

  const handleUpdateEntry = (index, updatedEntry) => {
    setGame(g => {
      const entries = [...g.entries];
      entries[index] = updatedEntry;
      return { ...g, entries };
    });
  };

  const handleRerollEntry = (index) => {
    setGame(g => {
      const entry = g.entries[index];
      const newEntry = rerollEntry(entry, g.cf, g.npcs, g.threads);
      if (!newEntry) return g;
      const entries = [...g.entries];
      entries[index] = newEntry;
      return { ...g, entries };
    });
  };

  const handlePlay = (id, gameData) => {
    setActiveId(id);
    setGame(gameData);
    setTab("diary");
    setSheet(null);
    setScreen("game");
  };

  const handleGoToLobby = () => {
    setScreen("lobby");
  };

  if (screen === "lobby") {
    return <Lobby onPlay={handlePlay} />;
  }

  return (
    <div style={{ width: "100%", height: "100dvh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: FONT, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 2px }
        ::-webkit-scrollbar-thumb { background: #ddd }
      `}</style>

      {!showKeyboard && (
        <Header expanded={headerExpanded} onToggle={() => setHeaderExpanded(x => !x)} cf={game.cf} sceneNum={game.sceneNum} character={game.character} tab={tab} cas={game.cas} onTimeOpen={() => setSheet("time")} />
      )}

      <div style={{ flex: 1, overflow: "hidden", maxHeight: sheetOpen ? "calc(50% - 10px)" : undefined }}>
        {tab === "diary" && <EditorArea entries={game.entries || []} onDeleteEntry={handleDeleteEntry} onRerollEntry={handleRerollEntry} onUpdateEntry={handleUpdateEntry} swipeSeen={game.hints?.swipeSeen} onSwipeSeen={() => updateGame({ hints: { ...game.hints, swipeSeen: true } })} />}
        {tab === "char" && <PostavaTab character={game.character} onUpdate={(ch) => updateGame({ character: ch })} onCharCreate={() => setSheet("charcreate")} />}
        {tab === "world" && <SvetTab cf={game.cf} npcs={game.npcs || []} threads={game.threads || []} keyedScenes={game.keyedScenes || []} perilPoints={game.perilPoints || { aktualni: 2, max: 2 }} onGoToLobby={handleGoToLobby} onNpcsChange={(npcs) => updateGame({ npcs })} onThreadsChange={(threads) => updateGame({ threads })} onKeyedScenesChange={(ks) => updateGame({ keyedScenes: ks })} onPerilPointsChange={(pp) => updateGame({ perilPoints: pp })} />}
      </div>

      {tab === "diary" && (
        <ActionToolbar
          onFateOpen={() => setSheet("fate")}
          onSceneOpen={() => setSheet("scene")}
          onMeaningOpen={() => setSheet("meaning")}
          onDetailOpen={() => setSheet("detail")}
          onEndSceneOpen={() => setSheet("endscene")}
          onCombatOpen={() => setSheet("combat")}
          onNoteOpen={() => setSheet("note")}
          onDiceOpen={() => setSheet("dice")}
          onRestOpen={() => setSheet("rest")}
          onDiscoveryOpen={() => setSheet("discovery")}
          onBehaviorOpen={() => setSheet("behavior")}
        />
      )}

      <BottomNav active={tab} onChange={setTab} />

      {sheet === "fate" && <FateSheet onClose={() => setSheet(null)} cf={game.cf} npcs={game.npcs} threads={game.threads} onInsert={handleInsert} />}
      {sheet === "scene" && <SceneSheet onClose={() => setSheet(null)} cf={game.cf} sceneNum={game.sceneNum} npcs={game.npcs} threads={game.threads} keyedScenes={game.keyedScenes || []} onInsert={handleInsert} />}
      {sheet === "meaning" && <MeaningSheet onClose={() => setSheet(null)} onInsert={handleInsert} />}
      {sheet === "endscene" && <EndSceneSheet onClose={() => setSheet(null)} cf={game.cf} sceneNum={game.sceneNum} onCFChange={(v) => updateGame({ cf: v })} npcs={game.npcs} threads={game.threads} keyedScenes={game.keyedScenes || []} onNpcsChange={(npcs) => updateGame({ npcs })} onThreadsChange={(threads) => updateGame({ threads })} onInsert={handleInsert} />}
      {sheet === "combat" && <CombatSheet onClose={() => setSheet(null)} onInsert={handleInsert} character={game.character} onCharUpdate={(ch) => updateGame({ character: ch })} />}
      {sheet === "note" && <NoteSheet onClose={() => setSheet(null)} onInsert={handleInsert} />}
      {sheet === "detail" && <DetailCheckSheet onClose={() => setSheet(null)} onInsert={handleInsert} />}
      {sheet === "dice" && <DiceSheet onClose={() => setSheet(null)} onInsert={handleInsert} />}
      {sheet === "rest" && <RestSheet onClose={() => setSheet(null)} onInsert={handleInsert} character={game.character} onCharUpdate={(ch) => updateGame({ character: ch })} />}
      {sheet === "discovery" && <DiscoveryCheckSheet cf={game.cf} threads={game.threads} npcs={game.npcs} onThreadsChange={(t) => updateGame({ threads: t })} onInsert={handleInsert} onClose={() => setSheet(null)} />}
      {sheet === "charcreate" && <CharCreateSheet onClose={() => setSheet(null)} onComplete={(ch) => { updateGame({ character: ch }); setSheet(null); }} />}
      {sheet === "behavior" && <BehaviorSheet onClose={() => setSheet(null)} onInsert={handleInsert} npcList={game.npcs} />}
      {sheet === "time" && <TimeTracker cas={game.cas || {}} onCasChange={(c) => updateGame({ cas: c })} onClose={() => setSheet(null)} onInsert={handleInsert} />}

    </div>
  );
}
