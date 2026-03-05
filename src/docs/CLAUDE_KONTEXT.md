# Solo RPG Companion — Kontext projektu

## Co to je
Mobilní PWA pro sólové hraní stolních RPG (Mausritter + Mythic GME 2e).
Hráč je zároveň vypravěč — appka simuluje rozhodování GM přes mechaniky Mythic GME.

## Stack
- React + Vite
- Čistý inline CSS (žádný Tailwind, žádné CSS soubory)
- IBM Plex Mono font
- Zatím jeden soubor: src/App.jsx

## Design tokens
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

## Struktura appky — 3 stavy

### Stav A — Editor bez klávesnice
- Header (klikatelný → rozbalí staty postavy)
- Editor s textem a inline bloky
- ActionToolbar (Vložit: Scéna | Fate | 🔮 | ⚔️ | 📝 | ⋯)
- BottomNav (Deník | Postava | Svět)

### Stav B — Editor s klávesnicí
- Header ZMIZÍ
- Editor (menší)
- MiniToolbar nad klávesnicí (8 ikon: 🎬 ❓ 🔮 ⚔️ 📝 📕 🎲 ⋯)
- BottomNav ZMIZÍ
- Klávesnice

### Stav C — Bottom sheet otevřený
- Header viditelný
- Editor (horní ~50% obrazovky)
- ActionToolbar
- BottomNav
- Sheet (height: 52%, pevná výška, obsah scrollovatelný)

## Bottom Sheets — všechny
1. **FateSheet** — Fate Question (❓)
   - Vstup: otázka + odds (10 úrovní) + CF reminder + HODIT
   - Výsledek: ANO/NE velké + exceptional + random event + VLOŽIT DO TEXTU
   
2. **SceneSheet** — Nová Scéna (🎬)
   - Vstup: očekávání + TESTOVAT CHAOS
   - Výsledek: Očekávaná/Pozměněná/Přerušená + detail + VLOŽIT
   
3. **MeaningSheet** — Meaning Tables (🔮)
   - Výběr: Actions / Descriptions / Elements
   - Výsledek: 2 slova velká + VLOŽIT DO TEXTU
   
4. **EndSceneSheet** — Konec Scény (⋯)
   - CF úprava (ANO=−1 / NE=+1)
   - Thready (seznam s progress bary)
   - UKONČIT SCÉNU
   
5. **CombatSheet** — Boj (⚔️)
   - Nepřítel (z DB nebo ruční zadání)
   - Rychlý / Detailní mód
   - Výsledek + VLOŽIT DO TEXTU

## Inline bloky v editoru
Tři typy bloků vložených do textu:
- **Fate blok**: zelený border vlevo, `❓ otázka · odds · d100=X → ANO/NE`
- **Meaning blok**: fialový border vlevo, `🔮 Slovo + Slovo`
- **Scene blok**: modrý border, nadpis sekce s číslem, názvem, typem, CF

## Taby
- **Deník** — editor s inline bloky
- **Postava** — character sheet (Ada Katzenreiserová, STR/DEX/WIL, inventář 10 slotů, pomocník)
- **Svět** — sub-taby: Mythic (CF + NPC seznam + Thread seznam) | NPC | Thready | Mapa

## Co jsme zatím udělali
1. ✅ Projekt vytvořen (Vite + React)
2. ✅ prototype.jsx nakopírován do src/App.jsx
3. ✅ index.html opraven — viewport meta pro mobil
4. ✅ src/index.css a src/App.css opraveny — odstraněn max-width, bílá barva textu
5. ✅ NPC/Thread jména opravena (color: C.text)
6. ✅ Sheet má pevnou height: 52%
7. ⏳ Sheet vnitřní div — overflow-y: auto (ještě neověřeno)

## Co je potřeba udělat dál
- [ ] Ověřit overflow-y: auto na vnitřním divu sheetu
- [ ] Herní logika — skutečné hody kostkami (Math.random)
- [ ] Fate Chart — pravděpodobnostní tabulka podle odds × CF
- [ ] Ukládání dat (localStorage nebo Dexie)
- [ ] Visual Viewport API pro detekci klávesnice

## Důležitá pravidla pro úpravy
- Vždy inline CSS, žádné externí CSS třídy
- Používej konstanty z objektu C pro barvy
- FONT proměnná pro font
- Sheet komponenta: height 52%, pevná, obsah scrollovatelný uvnitř
- 100dvh pro hlavní kontejner (ne 100vh — kvůli iOS Safari)
- Všechny změny v src/App.jsx pokud není řečeno jinak
