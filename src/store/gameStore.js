import { CURRENT_VERSION, INITIAL_GAME, applyMigrations } from "./migrations.js";

export { CURRENT_VERSION, INITIAL_GAME };

const INDEX_KEY = "solorpg_index";
const SAVE_PREFIX = "solorpg_";

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function loadIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  try {
    const old = localStorage.getItem("solorpg");
    if (old) {
      const data = JSON.parse(old);
      const id = genId();
      const index = { activeId: id, saves: [{ id, name: "Hra 1", lastPlayed: Date.now(), sceneNum: data.sceneNum || 1, cf: data.cf || 5 }] };
      localStorage.setItem(SAVE_PREFIX + id, old);
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
      localStorage.removeItem("solorpg");
      return index;
    }
  } catch { /* ignore */ }
  return { activeId: null, saves: [] };
}

export function saveIndex(index) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(index)); } catch { /* full */ }
}

export function loadGameById(id) {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + id);
    if (!raw) return INITIAL_GAME;
    const data = JSON.parse(raw);
    return applyMigrations(data);
  } catch {
    return INITIAL_GAME;
  }
}

export function saveGameById(id, game) {
  try { localStorage.setItem(SAVE_PREFIX + id, JSON.stringify(game)); } catch { /* full */ }
}

export function deleteGameById(id) {
  try { localStorage.removeItem(SAVE_PREFIX + id); } catch { /* ignore */ }
}

export function exportGame(id, name, game) {
  const data = JSON.stringify({ exportVersion: 1, name, game }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (name || "save").replace(/[^a-zA-Z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ ]/g, "-").replace(/\s+/g, "-").toLowerCase() + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

export function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "dnes";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "včera";
  return d.toLocaleDateString("cs");
}
