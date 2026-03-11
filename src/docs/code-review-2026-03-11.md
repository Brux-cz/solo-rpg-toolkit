# Kompletní revize kódu — Solo RPG Toolkit
**Datum:** 2026-03-11 | **Rozsah:** 35 souborů, ~8500 ř. kódu

---

## 1. ARCHITEKTURA — DATOVÝ TOK

```
┌─────────────────────────────────────────────────────────┐
│                    UŽIVATEL (dotyk)                      │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────┐
│  UI VRSTVA (bloky, sheety, taby)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │EditorArea│ │PostavaTab│ │ SvetTab  │ │  Sheets   │ │
│  │(bloky)   │ │(postava) │ │(wiki,CF) │ │(13 typů)  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘ │
│       │ callbacks   │            │              │       │
└───────┼─────────────┼────────────┼──────────────┼──────┘
        ↓             ↓            ↓              ↓
┌────────────────────────────────────────────────────────┐
│  ORCHESTRÁTOR — App.jsx (Prototype)                    │
│                                                        │
│  game = {                                              │
│    cf, sceneNum, entries[], npcs[], threads[],          │
│    keyedScenes[], perilPoints, character{}, cas{}       │
│  }                                                     │
│                                                        │
│  updateGame(patch)  →  setGame(g => ({...g, ...patch}))│
│  handleInsert(entry) → entries.push(entry)             │
│                                                        │
│  useEffect [game] → saveGameById(activeId, game)       │
└──────────────────────────┬─────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────┐
│  PERSISTENCE — gameStore.js                            │
│  localStorage: "solorpg_index" + "solorpg_<id>"        │
│  MIGRATIONS chain (v1→v10), INITIAL_GAME               │
└────────────────────────────────────────────────────────┘
        ↕ sdílené jádro
┌────────────────────────────────────────────────────────┐
│  HERNÍ LOGIKA (utils/)                                 │
│  dice.js     — hody, Fate Chart, Meaning, scény       │
│  combat.js   — damage pipeline, iniciativa, morálka    │
│  reroll.js   — reroll entrit v deníku                  │
│  whisper.js  — ⚠️ ODPOJENÝ (AI našeptávač)             │
└────────────────────────────────────────────────────────┘
        ↕ sdílené konstanty
┌────────────────────────────────────────────────────────┐
│  KONSTANTY (constants/)                                │
│  theme.js    — C (barvy), FONT                         │
│  tables.js   — Fate tabulky, odds, tabulky postav      │
│  bestiary.js — 13 tvorů                                │
│  elements.js — 45 Mythic 2e tabulek (50KB)             │
└────────────────────────────────────────────────────────┘
```

### Paralelní větev: Agent (standalone)
```
src/agent/
  cli.js    — CLI rozhraní (node src/agent/cli.js ...)
  engine.js — GameEngine třída (wrappuje dice.js + combat.js)
  state.js  — file I/O (fs.readFileSync/writeFileSync)
  saves/    — uložené hry agenta

✅ Migrace sjednoceny do src/store/migrations.js
✅ perilPoints opraveno (akt → aktualni)
```

---

## 2. SLEPÁ MÍSTA (Dead Code / Unused)

### 🔴 Kritické — ✅ OPRAVENO
| Co | Stav |
|----|------|
| `whisper.js` | ✅ Smazán |
| `ai-naseptavac-diagram.jsx` | ✅ Smazán |
| `showKeyboard = false` | ✅ Odstraněn |
| `initIndex` state | ✅ Odstraněn |
| `apiKey` / `apiKeySaved` v SvetTab | ✅ Odstraněn i s UI sekcí |
| MIGRATIONS duplikace | ✅ Sjednoceno do `migrations.js` |
| `perilPoints.akt` bug v agentovi | ✅ Opraveno na `aktualni` |

### 🟡 Zbývající duplikace (nízké riziko)
| Co | Kde | Riziko |
|----|-----|-------|
| `ODDS_REVERSE` / `BEHAVIOR_REVERSE` | `reroll.js` | Ruční mapování; rozbije se pokud se změní labels v tabulkách. |
| `NPC_FOCUSES` / `THREAD_FOCUSES` | `dice.js:92-93` | Hardcoded místo v tables.js. |

### 🟢 Nepoužité ale neškodné
| Co | Kde |
|----|-----|
| `agent/saves/` | Prázdná složka pro CLI testy |
| `src/docs/agent-diagram.jsx` | Nový, untracked soubor |

---

## 3. PROP DRILLING — HORKÁ MÍSTA

| Komponenta | Počet props | Problém |
|------------|:-----------:|---------|
| **ActionToolbar** | 11 | 11 samostatných `onXxxOpen` callbacků |
| **EndSceneSheet** | 10 | CF, NPC, Thread + 4 onChange callbacky |
| **SvetTab** | 10+ | Vše z game statu + 4 onChange + onGoToLobby |
| **Header** | 8 | cf, sceneNum, character, tab, cas... |

**Doporučení:** React Context pro `game` + `dispatch` by eliminoval většinu prop drillingu. Ale pro 35 souborů to není kritické.

---

## 4. KOMPLEXNÍ KOMPONENTY (> 500 ř.)

| Soubor | Řádky | Problém |
|--------|:-----:|---------|
| **PostavaTab.jsx** | 1342 | Inventářový grid editor, drag&drop, multi-slot, 9+ useState |
| **CombatSheet.jsx** | 1106 | 3-fázový boj, multi-enemy, damage pipeline |
| **SvetTab.jsx** | 592 | 6 sub-tabů, NPC wiki karty, lazy loading docs |
| **CharCreateSheet.jsx** | 550 | 5-krokový wizard, generátory |

**Kandidáti na rozložení:**
- PostavaTab → extrahovat `InventoryGrid.jsx` (~600 ř.)
- CombatSheet → extrahovat `CombatSimulation.jsx` (fighting fáze)

---

## 5. KVALITA KÓDU — PŘEHLED

### ✅ Co funguje dobře
- **Jednosměrný datový tok** — žádné cirkulární závislosti
- **Centralizovaný stav** — jediný `game` objekt v App.jsx
- **Konzistentní theming** — všech 35 souborů používá `C` + `FONT`
- **Čistý inline CSS** — žádné CSS třídy, nula výjimek
- **Auto-save** — každá změna se automaticky uloží
- **Backward kompatibilita** — bloky zvládají starý i nový formát dat
- **Sdílené jádro** — agent i React app používají stejné dice.js/combat.js

### ⚠️ Co chybí (✅ = opraveno)
| Oblast | Detail |
|--------|--------|
| **Error Boundary** | ✅ Přidán `ErrorBoundary.jsx`, obaluje celou herní UI |
| **Debouncing auto-save** | ✅ Debounce 300ms přes setTimeout v useEffect |
| **Memoizace** | ✅ `React.memo()` na 8 blocích v EditorArea |
| **Stabilní klíče** | ✅ `entry.id` generováno v handleInsert, key={e.id \|\| i} |
| **Validace dat** | Žádná runtime validace entry objektů. Poškozená data = tiché selhání. |
| **Undo** | Žádný undo pro smazání/reroll bloků. |
| **Test suite** | Nulové testy (unit, integration, E2E). |
| **Error logging** | Try/catch bloky s prázdným catch. Žádné logování chyb. |

### 🐛 Potenciální bugy (✅ = opraveno)
| Kde | Bug |
|-----|-----|
| `TextBlock.jsx`, `SceneBlock.jsx` | Volají `onUpdate()` bez null checku — pokud prop chybí, crash |
| `EndSceneSheet.jsx` | Autocomplete dropdown bez z-index — překrytý jinými elementy |
| `CombatSheet.jsx` | `useMemo` weapons závisí jen na `character.inventar`, ne na celém character |
| ~~`EditorArea.jsx`~~ | ✅ Opraveno — stabilní klíče `entry.id` |
| `Header.jsx` | `getZkMax()` inline funkce místo v utils — recalc při každém renderu |
| ~~`agent/state.js`~~ | ✅ Opraveno — `perilPoints.aktualni`, sdílené migrations.js |

---

## 6. PERFORMANCE PROFIL

```
Akce uživatele:
  Klik na tlačítko v sheetu
    → handler vytvoří entry objekt        ~0ms
    → updateGame({ entries: [...old, new] })
    → setGame triggers re-render          ~5ms (176 ř. App.jsx)
    → useEffect auto-save:
       JSON.stringify(game)               ~1-5ms (záleží na velikosti)
       localStorage.setItem()             ~1ms
       loadIndex() + saveIndex()          ~1ms
    → child components re-render          ~10-20ms

Celkem: ~20-30ms per action (OK pro mobil)

⚠️ Riziko: Hra s 500+ entries → stringify bude ~50ms → pocititelné zpomalení
```

---

## 7. SOUBORY MIMO STANDARD (untracked/modified)

```
M  src/components/tabs/SvetTab.jsx     — rozpracovaná změna
?? .claude/skills/play-workspace/      — testovací data play skillu
?? src/agent/                          — standalone CLI agent
?? src/docs/agent-diagram.jsx          — nový diagram
```

---

## 8. DOPORUČENÍ (seřazeno dle priority)

### P0 — ✅ HOTOVO
1. ~~Smazat whisper.js~~ ✅
2. ~~Opravit agent/state.js perilPoints~~ ✅
3. ~~Přidat Error Boundary~~ ✅

### P1 — ✅ HOTOVO
4. ~~Odstranit mrtvý kód (showKeyboard, initIndex, apiKey, AI diagram)~~ ✅
5. **Extrahovat `InventoryGrid`** z PostavaTab (1342 → ~700 + ~600) — ZBÝVÁ
6. ~~Sjednotit migrace do migrations.js~~ ✅

### P2 — ✅ HOTOVO
7. ~~Debounce auto-save (300ms)~~ ✅
8. ~~React.memo() na 8 bloků~~ ✅
9. ~~Stabilní klíče (entry.id)~~ ✅
10. **Přidat `@slideUp` keyframes** do index.css (Sheet.jsx na ně odkazuje)

### P3 — Nice to have
11. React Context pro game state (eliminuje prop drilling)
12. Unit testy na dice.js + combat.js (čistá logika, snadno testovatelná)
13. Runtime validace entry objektů (schema check)
