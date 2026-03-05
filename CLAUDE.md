# Solo RPG Companion — Claude Code Kontext

## Co to je
Mobilní PWA pro sólové hraní stolních RPG (Mausritter + Mythic GME 2e).
Hráč je zároveň vypravěč — appka simuluje rozhodování GM přes mechaniky Mythic GME.

## Stack
- React + Vite (JSX, ne TypeScript)
- Čistý inline CSS — žádný Tailwind, žádné externí CSS třídy
- IBM Plex Mono font
- Hlavní soubor: `src/App.jsx`

## Design tokens — VŽDY používej tyto konstanty
```js
const C = {
  bg: "#faf9f6",
  text: "#2a2a2a",
  muted: "#888",
  border: "#e0ddd8",
  green: "#4a7a4a",   // hlavní akcentová barva, Fate Q
  red: "#aa4444",     // boj, nebezpečí
  yellow: "#c89030",  // CF, varování
  purple: "#7a5aaa",  // Meaning tables
  blue: "#8888cc",    // Scéna bloky
};
const FONT = "'IBM Plex Mono', monospace";
```

## Pravidla pro každou změnu
- Edituj `src/App.jsx` pokud není řečeno jinak
- Vždy inline CSS, nikdy externí CSS třídy
- Barvy pouze z objektu `C`, font pouze z `FONT`
- Hlavní kontejner má `height: 100dvh` (ne 100vh — kvůli iOS Safari)
- Sheet komponenta: `height: 52%`, pevná, obsah scrollovatelný (`overflow-y: auto`)
- Po změně řekni co jsi udělal (1-2 věty), nic víc

## Architektura — 3 stavy appky

### Stav A — Editor bez klávesnice
Header → Editor → ActionToolbar → BottomNav

### Stav B — Klávesnice otevřená
Header ZMIZÍ · Editor (menší) · MiniToolbar (8 ikon) · BottomNav ZMIZÍ · Klávesnice

### Stav C — Bottom sheet
Header · Editor (max 50% výšky) · ActionToolbar · BottomNav · Sheet (52% výšky)

## Komponenty v src/App.jsx
- `EditorArea` — statický editor s inline bloky
- `Header` — Scéna/CF/den, klik = rozbalí staty
- `ActionToolbar` — Vložit: Scéna | ❓Fate | 🔮 | ⚔️ | 📝 | ⋯
- `MiniToolbar` — 8 ikon nad klávesnicí: 🎬 ❓ 🔮 ⚔️ 📝 📕 🎲 ⋯
- `BottomNav` — Deník / Postava / Svět
- `FakeKeyboard` — simulovaná klávesnice pro dev
- `Sheet` — základ bottom sheetu (height: 52%, slide-up animace)
- `FateSheet` — Fate Question (vstup → výsledek ANO/NE)
- `SceneSheet` — Nová Scéna (očekávání → chaos test → výsledek)
- `MeaningSheet` — Meaning Tables (Actions/Descriptions/Elements → 2 slova)
- `EndSceneSheet` — Konec Scény (CF úprava + thready)
- `CombatSheet` — Boj (nepřítel → výsledek)
- `PostavaTab` — character sheet (staty, inventář, pomocník)
- `SvetTab` — Mythic (CF + NPC seznam + Thread seznam) + sub-taby
- `Prototype` — hlavní App, state: tab/sheet/showKeyboard/headerExpanded

## Inline bloky v editoru
- **Fate**: zelený border vlevo `❓ otázka · odds · d100=X → ANO/NE`
- **Meaning**: fialový border vlevo `🔮 Slovo + Slovo`
- **Scene**: modrý border, nadpis sekce s číslem/názvem/typem/CF

## Co je hotovo ✅
1. Projekt vytvořen (Vite + React JSX)
2. src/App.jsx — prototyp se všemi komponentami
3. index.html — viewport meta pro mobil
4. src/index.css — odstraněn max-width, bílá barva textu
5. NPC/Thread jména opravena (color: C.text)
6. Sheet má pevnou height: 52%
7. Repo uklizeno — smazán starý TypeScript projekt

## Co je potřeba udělat 📋
- [ ] Sheet vnitřní div — ověřit overflow-y: auto
- [ ] Reálné hody kostkami (Math.random místo statických hodnot)
- [ ] Fate Chart — pravděpodobnostní tabulka podle odds × CF
- [ ] Visual Viewport API — detekce skutečné klávesnice
- [ ] Ukládání dat (localStorage)
- [ ] Postava tab — editovatelné hodnoty
- [ ] Svět tab — NPC karty, Thread detail

## Detailní dokumentace
- `src/docs/pencil-handoff.md` — kompletní UI specifikace
- `src/docs/bottom-sheets-diagram.jsx` — flow všech sheetů
- `src/docs/datovy-model.jsx` — datový model
- `src/docs/CLAUDE_KONTEXT.md` — shrnutí kontextu
