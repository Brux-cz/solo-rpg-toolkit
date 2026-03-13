import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { INITIAL_GAME, applyMigrations } from "../store/migrations.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIVE_PATH = join(__dirname, "../../public/agent-live.json");

// Načti poslední _seq z existujícího souboru (aby se neresetoval při každém CLI spuštění)
let _seq = 0;
try {
  if (existsSync(LIVE_PATH)) {
    const prev = JSON.parse(readFileSync(LIVE_PATH, "utf-8"));
    _seq = prev._seq || 0;
  }
} catch { /* soubor neexistuje nebo je poškozený */ }

export function newGame(name) {
  return { name: name || "Agent hra", game: { ...INITIAL_GAME } };
}

export function loadGame(path) {
  const raw = readFileSync(path, "utf-8");
  const parsed = JSON.parse(raw);
  const game = parsed.game || parsed;
  const name = parsed.name || "Importovaná hra";
  return { name, game: applyMigrations(game) };
}

export function saveGame(path, name, game) {
  const data = JSON.stringify({ exportVersion: 1, name, game }, null, 2);
  writeFileSync(path, data, "utf-8");
  // Live sync pro prohlížeč
  _seq++;
  const live = JSON.stringify({ _seq, _ts: Date.now(), name, game });
  writeFileSync(LIVE_PATH, live);
}
