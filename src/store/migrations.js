// Sdílené migrace a INITIAL_GAME — jediný zdroj pravdy
// Importuje gameStore.js (browser/localStorage) i agent/state.js (Node/fs)

export const CURRENT_VERSION = 10;

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
    kurazSloty: [],
    inventar: Array.from({ length: 10 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } })),
    pomocnici: [],
  },
  cas: {
    den: 1,
    hlidka: "ráno",
    smena: 1,
    rocniObdobi: "podzim",
    pocasi: "",
    jeNepriznive: false,
    odpocinutoDnes: false,
  },
  keyedScenes: [],
  perilPoints: { aktualni: 2, max: 2 },
};

export const MIGRATIONS = {
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
  8: (data) => {
    const char = data.character || {};
    const kuraz = char.kuraz || 0;
    const emptySlot = () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } });
    return {
      ...data,
      character: {
        ...char,
        kurazSloty: Array.from({ length: kuraz }, emptySlot),
      },
      version: 9,
    };
  },
  9: (data) => ({
    ...data,
    cas: {
      den: 1, hlidka: "ráno", smena: 1,
      rocniObdobi: "podzim", pocasi: "", jeNepriznive: false,
      odpocinutoDnes: false,
    },
    version: 10,
  }),
};

export function applyMigrations(data) {
  while (data.version < CURRENT_VERSION && MIGRATIONS[data.version]) {
    data = MIGRATIONS[data.version](data);
  }
  return { ...INITIAL_GAME, ...data, version: CURRENT_VERSION };
}
