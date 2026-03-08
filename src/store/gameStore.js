const INDEX_KEY = "solorpg_index";
const SAVE_PREFIX = "solorpg_";
export const CURRENT_VERSION = 8;

export const INITIAL_GAME = {
  version: CURRENT_VERSION,
  cf: 5,
  sceneNum: 1,
  entries: [],
  npcs: [],
  threads: [],
  character: {
    jmeno: "",
    puvod: "",
    uroven: 1,
    zk: 0,
    str: { akt: 8, max: 8 },
    dex: { akt: 10, max: 10 },
    wil: { akt: 7, max: 7 },
    bo: { akt: 4, max: 4 },
    dobky: 0,
    prijmeni: "",
    barvaSrsti: "",
    vzorSrsti: "",
    vyraznyRys: "",
    znameni: "",
    kuraz: 0,
    inventar: Array.from({ length: 10 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } })),
    pomocnici: [],
  },
};

const MIGRATIONS = {
  1: (data) => ({
    ...data,
    character: {
      jmeno: "",
      puvod: "",
      uroven: 1,
      zk: 0,
      str: { akt: 8, max: 8 },
      dex: { akt: 10, max: 10 },
      wil: { akt: 7, max: 7 },
      bo: { akt: 4, max: 4 },
      dobky: 0,
    },
    version: 2,
  }),
  2: (data) => ({
    ...data,
    npcs: (data.npcs || []).map(n => ({ name: n.name || "", weight: n.weight || 1, flag: n.flag || false })),
    threads: (data.threads || []).map(t => ({ name: t.name || "", weight: t.weight || 1, progress: t.progress || 0, total: t.total || 10 })),
    version: 3,
  }),
  3: (data) => ({
    ...data,
    character: {
      ...data.character,
      inventar: data.character?.inventar || Array.from({ length: 10 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } })),
    },
    version: 4,
  }),
  4: (data) => {
    const old = data.character?.pomocnik;
    const pomocnici = old && old.aktivni ? [{ ...old, id: Date.now().toString(36) }] : [];
    const { pomocnik, ...restChar } = data.character || {};
    return { ...data, character: { ...restChar, pomocnici }, version: 5 };
  },
  5: (data) => {
    const migrateSlot = (s) => {
      if (!s || !s.nazev) return s;
      return { ...s, sloty: s.sloty || 1, span: s.span || { rows: 1, cols: 1 } };
    };
    const char = data.character || {};
    return {
      ...data,
      character: {
        ...char,
        inventar: (char.inventar || []).map(migrateSlot),
        pomocnici: (char.pomocnici || []).map(p => ({
          ...p,
          inventar: (p.inventar || []).map(migrateSlot),
        })),
      },
      version: 6,
    };
  },
  6: (data) => {
    const char = data.character || {};
    return {
      ...data,
      character: {
        ...char,
        prijmeni: char.prijmeni || "",
        barvaSrsti: char.barvaSrsti || "",
        vzorSrsti: char.vzorSrsti || "",
        vyraznyRys: char.vyraznyRys || "",
        znameni: char.znameni || "",
        kuraz: char.kuraz ?? 0,
      },
      version: 7,
    };
  },
  7: (data) => ({
    ...data,
    threads: (data.threads || []).map(t => ({
      ...t,
      popis: t.popis || "",
      stav: t.stav || "aktivní",
      typ: t.typ || "hlavní",
      poznamky: t.poznamky || "",
    })),
    version: 8,
  }),
};

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
    let data = JSON.parse(raw);
    while (data.version < CURRENT_VERSION && MIGRATIONS[data.version]) {
      data = MIGRATIONS[data.version](data);
    }
    return { ...INITIAL_GAME, ...data, version: CURRENT_VERSION };
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
