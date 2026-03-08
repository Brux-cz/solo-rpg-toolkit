import { useState, useRef, useCallback } from "react";
import { C, FONT } from "../../constants/theme.js";
import { roll } from "../../utils/dice.js";

const TYPY = ["zbraň", "zbroj", "kouzlo", "zásoby", "světlo", "nástroj", "poklad", "stav"];

const PRESETY = {
  "zbraň": [
    { nazev: "Improvizovaná", dmg: "d6", cena: 1, tecky: 1, hint: "Cokoliv po ruce. VŽDY škrtá tečku po boji (ne d6 test)." },
    { nazev: "Lehká (dýka, jehla)", dmg: "d6", cena: 10, tecky: 3, hint: "Jedna packa. Rychlá, nenápadná." },
    { nazev: "Střední (meč, sekera)", dmg: "d8", cena: 20, tecky: 3, hint: "Jedna packa. Spolehlivá volba." },
    { nazev: "Těžká (kopí, hákopí)", dmg: "d10", cena: 40, tecky: 3, hint: "2 sloty. V packách = připravená k boji.", sloty: 2, span: { rows: 2, cols: 1 } },
    { nazev: "Lehká střelná (prak)", dmg: "d6", cena: 10, tecky: 3, hint: "Na dálku. Za krytem cíl hází jen d4." },
    { nazev: "Těžká střelná (luk)", dmg: "d8", cena: 40, tecky: 3, hint: "2 sloty. V packách = připravený k boji.", sloty: 2, span: { rows: 2, cols: 1 } },
    { nazev: "Toulec šípů", dmg: "d6", cena: 5, tecky: 3, hint: "Munice k luku." },
    { nazev: "Váček kamenů", dmg: "d6", cena: 1, tecky: 3, hint: "Munice k praku." },
    { nazev: "Postříbřená lehká", dmg: "d6", cena: 100, tecky: 3, hint: "Postříbřená. VŽDY škrtá tečku po boji (ne d6 test).", jePostribrena: true },
    { nazev: "Postříbřená střední", dmg: "d8", cena: 200, tecky: 3, hint: "Postříbřená. VŽDY škrtá tečku po boji (ne d6 test).", jePostribrena: true },
    { nazev: "Postříbřená těžká", dmg: "d10", cena: 400, tecky: 3, hint: "Postříbřená. VŽDY škrtá tečku po boji (ne d6 test).", jePostribrena: true, sloty: 2, span: { rows: 2, cols: 1 } },
  ],
  "zbroj": [
    { nazev: "Lehká zbroj", obrana: 1, cena: 150, tecky: 3, hint: "2 sloty (1×2). Na těle = připravená.", sloty: 2, span: { rows: 1, cols: 2 } },
    { nazev: "Těžká zbroj", obrana: 1, cena: 500, tecky: 3, hint: "2 sloty (2×1). Na těle = připravená.", sloty: 2, span: { rows: 2, cols: 1 } },
    { nazev: "Štít", obrana: 1, cena: 15, tecky: 3, hint: "Jedna packa (1 slot)." },
  ],
  "světlo": [
    { nazev: "Pochodeň", cena: 10, tecky: 3, hint: "6 směn na tečku." },
    { nazev: "Lucerna", cena: 50, tecky: 3, hint: "6 směn na tečku. Nehasne ve větru." },
    { nazev: "Elektrická lampa", cena: 200, tecky: 6, hint: "6 směn na tečku. 6 teček!" },
  ],
  "zásoby": [
    { nazev: "Cestovní zásoby", cena: 5, tecky: 3, hint: "Jídlo na 3 porce." },
  ],
  "kouzlo": [
    { nazev: "Ohnivá koule", tecky: 3, hint: "Všichni v okruhu 15cm utrpí zranění. Dobití: 3 dny v plamenech divokého ohně." },
    { nazev: "Zahojení", tecky: 3, hint: "Zahojí STR a odstraní Poranění. Dobití: pořež se za d6 STR, potřísni krví." },
    { nazev: "Kouzelná střela", tecky: 3, hint: "Zranění jednomu tvoru v dohledu. Dobití: upusť z 10m, do 1 směny se dotkni." },
    { nazev: "Strach", tecky: 3, hint: "Udělí Vystrašení více tvorům. Dobití: nech si způsobit Vystrašení s kouzlem u sebe." },
    { nazev: "Tma", tecky: 3, hint: "Koule černočerné tmy. Dobití: 3 dny nezakrytě na neosvětleném místě." },
    { nazev: "Zotavení", tecky: 3, hint: "Odstraní Vyčerpání/Vystrašení. Dobití: zakopej na 3 dny na poklidném poli/břehu." },
    { nazev: "Srozumitelnost", tecky: 3, hint: "Tvorové jiného druhu ti rozumí. Dobití: nezištně obdaruj tvora jiného druhu." },
    { nazev: "Přízračný brouk", tecky: 3, hint: "Přízračný brouk unese 6 slotů inventáře. Dobití: zakopej na broučím hřbitově 3 noci." },
    { nazev: "Světlo", tecky: 3, hint: "Omámí tvory (WIL save) nebo světlo jako pochodeň. Dobití: 3 dny východ+západ slunce." },
    { nazev: "Neviditelný prstenec", tecky: 3, hint: "Neviditelná nehybná bariéra. Dobití: vyrob železný kruh stejné velikosti, protáhni." },
    { nazev: "Zaklepání", tecky: 3, hint: "Otevře dveře/nádobu (STR 10+). Dobití: 3× zamknout ve skříňkách na 3 dny." },
    { nazev: "Tuk", tecky: 3, hint: "Kluzký hořlavý tuk, DEX save nebo pád. Dobití: pomazat tukem, počkat až zežlukne." },
    { nazev: "Zvětšení", tecky: 3, hint: "Zvětší tvora na 1 směnu. Dobití: 3 dny v nejvyšších větvích stromu." },
    { nazev: "Neviditelnost", tecky: 3, hint: "Zneviditelní tvora, pohyb zkracuje trvání. Dobití: celý den neotevírej oči." },
    { nazev: "Šanta", tecky: 3, hint: "Předmět se stane neodolatelným pro kočky. Dobití: dej kočce dárek po jakém touží." },
  ],
  "stav": [
    { nazev: "Hlad", tecky: 0, hint: "Odstranění: sněz porci jídla." },
    { nazev: "Vyčerpání", tecky: 0, hint: "Odstranění: dlouhý odpočinek (6h spánku)." },
    { nazev: "Poranění", tecky: 0, hint: "Odstranění: ošetření + krátký odpočinek." },
    { nazev: "Vystrašení", tecky: 0, hint: "Odstranění: kouzlo nebo odpočinek." },
    { nazev: "Pomátení", tecky: 0, hint: "Odstranění: odpočinek." },
  ],
  "nástroj": [
    { nazev: "Lano", cena: 40, tecky: 3 },
    { nazev: "Páčidlo", cena: 10, tecky: 3 },
    { nazev: "Šperháky", cena: 100, tecky: 3 },
    { nazev: "Zápalky", cena: 80, tecky: 3 },
    { nazev: "Stan", cena: 80, tecky: 3 },
    { nazev: "Síť", cena: 10, tecky: 3 },
    { nazev: "Zámek", cena: 20, tecky: 3 },
    { nazev: "Jed", cena: 100, tecky: 3 },
  ],
};

const VLASTNI_HINT = {
  "zbraň": "Magická, unikátní nebo z lootu.",
  "zbroj": "Nestandardní ochrana.",
  "kouzlo": "Vlastní kouzlo. Sesílání: moc 1-3, za 4-6 na d6 škrtni tečku.",
  "stav": "Vlastní podmínka. Zabírá 1 slot v inventáři.",
  "světlo": "Jiný zdroj světla.",
  "zásoby": "Jiný typ zásob.",
  "nástroj": "Jiný nástroj nebo vybavení.",
};

// Mausritter tabulka pomocníků (přesně z knihy)
// dostupnost = kostka na počet dostupných v osadě po úspěšném verbování
const ROLE = [
  { name: "světlonoš", mzda: 1, dostupnost: "d6" },
  { name: "dělník", mzda: 2, dostupnost: "d6" },
  { name: "kopáč chodeb", mzda: 5, dostupnost: "d4" },
  { name: "zbrojíř/kovář", mzda: 8, dostupnost: "d2" },
  { name: "místní průvodce", mzda: 10, dostupnost: "d4" },
  { name: "zbrojmyš", mzda: 10, dostupnost: "d6" },
  { name: "učenec", mzda: 20, dostupnost: "d2" },
  { name: "rytíř", mzda: 25, dostupnost: "d3" },
  { name: "tlumočník", mzda: 30, dostupnost: "d2" },
];

const PLAYER_GRID = [
  "Packa L", "Tělo", "Batoh", "Batoh", "Batoh",
  "Packa R", "Tělo", "Batoh", "Batoh", "Batoh",
];
const HIRELING_GRID = [
  "Packa", "Tělo", "Batoh",
  "Packa", "Tělo", "Batoh",
];

const TYPE_COLOR = {
  "zbraň": C.red,
  "zbroj": C.blue,
  "světlo": C.yellow,
  "zásoby": C.green,
  "nástroj": C.muted,
  "kouzlo": C.purple,
  "poklad": C.yellow,
  "stav": C.red,
};

const EMPTY_SLOT = { nazev: "", typ: "", tecky: { akt: 0, max: 0 } };

function getSpannedIndices(index, span, gridCols) {
  if (!span || (span.rows <= 1 && span.cols <= 1)) return [index];
  const row = Math.floor(index / gridCols);
  const col = index % gridCols;
  const indices = [];
  for (let r = 0; r < (span.rows || 1); r++) {
    for (let c = 0; c < (span.cols || 1); c++) {
      indices.push((row + r) * gridCols + col + c);
    }
  }
  return indices;
}

function recalcOccupied(inv, gridCols) {
  const totalRows = Math.ceil(inv.length / gridCols);
  // Strip all _occupied markers
  const next = inv.map(s => s?._occupied ? { ...EMPTY_SLOT } : { ...s });
  // Set _occupied for multi-slot items
  for (let i = 0; i < next.length; i++) {
    const s = next[i];
    if (!s?.nazev || !s.span || (s.span.rows <= 1 && s.span.cols <= 1)) continue;
    const row = Math.floor(i / gridCols);
    const col = i % gridCols;
    if (col + (s.span.cols || 1) > gridCols || row + (s.span.rows || 1) > totalRows) continue;
    const indices = getSpannedIndices(i, s.span, gridCols);
    let canFit = true;
    for (const idx of indices) {
      if (idx === i || idx >= next.length) continue;
      if (next[idx].nazev || next[idx]._occupied) { canFit = false; break; }
    }
    if (!canFit) continue;
    for (const idx of indices) {
      if (idx !== i && idx < next.length) {
        next[idx] = { _occupied: true, _owner: i };
      }
    }
  }
  return next;
}

function newPomocnik() {
  // Mausritter: STR/DEX/WIL = 2d6, BO = d6
  const s = roll(6) + roll(6), d = roll(6) + roll(6), w = roll(6) + roll(6), b = roll(6);
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    jmeno: "", role: "", vernost: "bezny", denniMzda: 0,
    str: { akt: s, max: s }, dex: { akt: d, max: d }, wil: { akt: w, max: w }, bo: { akt: b, max: b },
    inventar: Array.from({ length: 6 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } })),
  };
}

function presetLabel(preset) {
  const info = [];
  if (preset.dmg) info.push(preset.dmg);
  if (preset.obrana) info.push(`⛨${preset.obrana}`);
  if (preset.cena) info.push(`${preset.cena}ď`);
  if (preset.tecky > 0 && !preset.cena) info.push(`${preset.tecky}✦`);
  return info.length > 0 ? `${preset.nazev} — ${info.join(", ")}` : preset.nazev;
}

// --- Drag and drop hook ---
function useGridDrag(inventar, onSwap) {
  const dragState = useRef(null);
  const ghostRef = useRef(null);
  const timerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dragState.current = null;
    // Remove highlight from all slots
    document.querySelectorAll("[data-slot-index]").forEach(el => {
      el.style.outline = "";
    });
  }, []);

  const onPointerDown = useCallback((e, index) => {
    if (e.button !== 0) return;
    const slot = inventar[index];
    if (!slot || !slot.nazev) return; // Can't drag empty slots

    const startX = e.clientX;
    const startY = e.clientY;
    dragState.current = { index, startX, startY, dragging: false };

    timerRef.current = setTimeout(() => {
      if (!dragState.current) return;
      dragState.current.dragging = true;

      // Create ghost
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const ghost = target.cloneNode(true);
      ghost.style.position = "fixed";
      ghost.style.left = rect.left + "px";
      ghost.style.top = rect.top + "px";
      ghost.style.width = rect.width + "px";
      ghost.style.height = rect.height + "px";
      ghost.style.opacity = "0.85";
      ghost.style.zIndex = "1000";
      ghost.style.pointerEvents = "none";
      ghost.style.transform = "scale(1.05)";
      ghost.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      ghost.style.transition = "none";
      document.body.appendChild(ghost);
      ghostRef.current = ghost;

      dragState.current.offsetX = startX - rect.left;
      dragState.current.offsetY = startY - rect.top;

      // Dim original
      target.style.opacity = "0.3";
      dragState.current.originalEl = target;

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(30);
    }, 300);
  }, [inventar]);

  const onPointerMove = useCallback((e) => {
    if (!dragState.current) return;
    if (!dragState.current.dragging) {
      // If moved too far before long-press, cancel
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        cleanup();
      }
      return;
    }

    e.preventDefault();
    const ghost = ghostRef.current;
    if (ghost) {
      ghost.style.left = (e.clientX - dragState.current.offsetX) + "px";
      ghost.style.top = (e.clientY - dragState.current.offsetY) + "px";
    }

    // Highlight target slot
    document.querySelectorAll("[data-slot-index]").forEach(el => {
      el.style.outline = "";
    });
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const slotEl = target?.closest("[data-slot-index]");
    if (slotEl) {
      const targetIdx = Number(slotEl.dataset.slotIndex);
      if (targetIdx !== dragState.current.index) {
        slotEl.style.outline = `2px solid ${C.green}`;
      }
    }
  }, [cleanup]);

  const onPointerUp = useCallback((e) => {
    if (!dragState.current) return;

    if (dragState.current.originalEl) {
      dragState.current.originalEl.style.opacity = "";
    }

    if (dragState.current.dragging) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = target?.closest("[data-slot-index]");
      if (slotEl) {
        const targetIdx = Number(slotEl.dataset.slotIndex);
        const sourceIdx = dragState.current.index;
        if (targetIdx !== sourceIdx) {
          onSwap(sourceIdx, targetIdx);
        }
      }
    }

    cleanup();
  }, [onSwap, cleanup]);

  return { onPointerDown, onPointerMove, onPointerUp };
}

// --- Inventory Card ---
function InventoryCard({ slot, index, label, isEditing, onEdit, onDotToggle, dragHandlers, gridId, gridRow, gridCol, totalRows, totalCols, gridLabels }) {
  const empty = !slot.nazev;
  const color = TYPE_COLOR[slot.typ] || C.muted;

  // Check if span physically fits at this position
  const spanValid = (() => {
    if (!slot.span || (slot.span.rows <= 1 && slot.span.cols <= 1)) return true;
    if (gridRow + (slot.span.rows || 1) - 1 > totalRows) return false;
    if (gridCol + (slot.span.cols || 1) - 1 > totalCols) return false;
    return true;
  })();

  if (empty) {
    return (
      <div
        data-slot-index={index}
        data-grid-id={gridId}
        onClick={() => onEdit(index)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          minHeight: 56,
          background: C.bg,
          touchAction: "none",
          gridRow: gridRow,
          gridColumn: gridCol,
        }}
      >
        <span style={{ fontSize: 11, color: C.border, fontFamily: FONT, fontWeight: 500 }}>{label}</span>
      </div>
    );
  }

  const stat = slot.dmg || (slot.obrana ? `⛨${slot.obrana}` : null);

  return (
    <div
      data-slot-index={index}
      data-grid-id={gridId}
      onClick={() => onEdit(index)}
      onPointerDown={dragHandlers ? (e) => dragHandlers.onPointerDown(e, index) : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        minHeight: 56,
        background: C.bg,
        touchAction: "none",
        userSelect: "none",
        overflow: "hidden",
        boxShadow: `inset 0 0 0 1px ${color}40`,
        gridRow: (slot.span?.rows > 1 && spanValid) ? `${gridRow} / span ${slot.span.rows}` : gridRow,
        gridColumn: (slot.span?.cols > 1 && spanValid) ? `${gridCol} / span ${slot.span.cols}` : gridCol,
      }}
    >
      {/* Název nahoře */}
      <div style={{
        padding: "3px 5px 2px",
        borderBottom: `1px solid ${color}30`,
        fontSize: 9,
        fontWeight: 700,
        color: C.text,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: 1.3,
      }}>
        {slot.nazev}
      </div>
      {/* Střed — tečky + stat */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5px" }}>
        {slot.tecky?.max > 0 ? (
          <div
            style={{ display: "flex", gap: 3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from({ length: slot.tecky.max }, (_, d) => (
              <div
                key={d}
                onClick={(e) => { e.stopPropagation(); onDotToggle(index, d); }}
                style={{
                  width: 8, height: 8,
                  borderRadius: "50%",
                  border: `1.5px solid ${color}`,
                  background: d < slot.tecky.akt ? color : "transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        ) : <div />}
        {stat && (
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            color,
            border: `1px solid ${color}40`,
            padding: "1px 3px",
            lineHeight: 1.2,
          }}>{stat}</span>
        )}
      </div>
      {/* Typ dole */}
      <div style={{
        padding: "1px 5px 3px",
        fontSize: 7,
        color: color,
        opacity: 0.7,
        lineHeight: 1.2,
      }}>
        {slot.typ}
      </div>
    </div>
  );
}

// --- Slot Editor (unchanged logic, slightly adapted) ---
function SlotEditor({ slot, slotIndex, gridCols, gridRows, gridLabels, inv, onUpdate, onClear, onClose, onMoveAndUpdate }) {
  const fSt = { width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 };
  const typ = slot.typ;
  const slotRow = Math.floor(slotIndex / gridCols);
  const slotCol = slotIndex % gridCols;

  // Find the best starting slot for a multi-slot preset (physical fit only)
  const findFitStart = (span) => {
    if (!span) return slotIndex;
    const tryFit = (idx) => {
      const r = Math.floor(idx / gridCols);
      const c = idx % gridCols;
      if (r + (span.rows || 1) > gridRows) return false;
      if (c + (span.cols || 1) > gridCols) return false;
      const indices = getSpannedIndices(idx, span, gridCols);
      for (const si of indices) {
        if (si === slotIndex) continue;
        if (si >= inv.length) return false;
        if (inv[si]?._occupied && inv[si]?._owner === slotIndex) continue;
        if (inv[si]?.nazev || inv[si]?._occupied) return false;
      }
      return true;
    };
    if (tryFit(slotIndex)) return slotIndex;
    // Search starts where slotIndex is part of the spanned area
    for (let i = 0; i < inv.length; i++) {
      if (i === slotIndex) continue;
      const spanned = getSpannedIndices(i, span, gridCols);
      if (!spanned.includes(slotIndex)) continue;
      if (tryFit(i)) return i;
    }
    // Fallback: any valid position in the grid
    for (let i = 0; i < inv.length; i++) {
      if (i === slotIndex) continue;
      if (tryFit(i)) return i;
    }
    return -1;
  };

  const canFitSpan = (span) => findFitStart(span) >= 0;
  const presets = PRESETY[typ];
  const hasPresets = !!presets;
  const isPreset = hasPresets && presets.some(p => p.nazev === slot._preset);

  const handleTypChange = (t) => {
    const patch = { typ: t };
    if (t !== "zbraň") patch.dmg = undefined;
    if (t !== "zbroj") patch.obrana = undefined;
    // Reset multi-slot when switching type
    patch.sloty = undefined;
    patch.span = undefined;
    patch._preset = undefined;
    const newPresets = PRESETY[t];
    const firstFit = newPresets?.find(p => canFitSpan(p.span));
    if (firstFit) {
      patch.nazev = firstFit.nazev;
      patch._preset = firstFit.nazev;
      if (firstFit.dmg) patch.dmg = firstFit.dmg;
      if (firstFit.obrana) patch.obrana = firstFit.obrana;
      patch.tecky = { akt: firstFit.tecky, max: firstFit.tecky };
      if (firstFit.sloty) patch.sloty = firstFit.sloty;
      if (firstFit.span) patch.span = { ...firstFit.span };
      const fitIdx = findFitStart(firstFit.span);
      if (fitIdx >= 0 && fitIdx !== slotIndex && onMoveAndUpdate) {
        onMoveAndUpdate(fitIdx, patch);
        return;
      }
    }
    onUpdate(patch);
  };

  const handlePresetChange = (val) => {
    if (val === "__vlastni__") {
      const patch = { nazev: "", sloty: undefined, span: undefined, _preset: undefined, jePostribrena: undefined, jeKouzelna: undefined };
      if (typ === "zbraň") patch.dmg = "";
      if (typ === "zbroj") patch.obrana = "";
      onUpdate(patch);
    } else {
      const p = presets.find(p => p.nazev === val);
      if (!p) return;
      const fitIdx = findFitStart(p.span);
      if (fitIdx < 0) return;
      const patch = { nazev: p.nazev, _preset: p.nazev, tecky: { akt: p.tecky, max: p.tecky }, sloty: p.sloty || undefined, span: p.span ? { ...p.span } : undefined, jePostribrena: p.jePostribrena || undefined, jeKouzelna: undefined };
      if (p.dmg) patch.dmg = p.dmg;
      if (p.obrana) patch.obrana = p.obrana;
      if (fitIdx !== slotIndex && onMoveAndUpdate) {
        onMoveAndUpdate(fitIdx, patch);
      } else {
        onUpdate(patch);
      }
    }
  };

  return (
    <div style={{ border: `1px solid ${C.blue}`, padding: "8px 10px", background: C.bg }}>
      <div style={{ display: "flex", gap: 6, marginBottom: hasPresets ? 2 : 6 }}>
        <label style={{ flex: 1 }}>
          <span style={{ color: C.muted, fontSize: 9 }}>Typ</span>
          <select value={typ} onChange={e => handleTypChange(e.target.value)} style={fSt}>
            <option value="">—</option>
            {TYPY.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        {hasPresets && (
          <label style={{ flex: 2 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Předmět</span>
            <select value={isPreset ? slot._preset : "__vlastni__"} onChange={e => handlePresetChange(e.target.value)} style={fSt}>
              {presets.map(p => {
                const fits = canFitSpan(p.span);
                return <option key={p.nazev} value={p.nazev} disabled={!fits}>{presetLabel(p)}{fits ? "" : " (nevejde se)"}</option>;
              })}
              <option value="__vlastni__">{{
                "zbraň": "jiná zbraň...", "zbroj": "jiná zbroj...", "světlo": "jiné světlo...",
                "zásoby": "jiné zásoby...", "nástroj": "jiný nástroj...",
                "kouzlo": "jiné kouzlo...", "stav": "jiný stav...",
              }[typ] || "jiný..."}</option>
            </select>
          </label>
        )}
      </div>
      {hasPresets && (
        <div style={{ fontSize: 9, color: C.muted, fontStyle: "italic", marginBottom: 6, lineHeight: 1.3 }}>
          {isPreset ? (presets.find(p => p.nazev === slot._preset)?.hint || "") : (VLASTNI_HINT[typ] || "")}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <label style={{ flex: 2 }}>
          <span style={{ color: C.muted, fontSize: 9 }}>Název</span>
          <input value={slot.nazev} onChange={e => onUpdate({ nazev: e.target.value })} placeholder="Název předmětu" style={fSt} />
        </label>
        {typ === "zbraň" ? (
          <label style={{ flex: 1 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Dmg</span>
            <select value={slot.dmg || ""} onChange={e => onUpdate({ dmg: e.target.value })} style={fSt}>
              <option value="">—</option>
              {["d4","d6","d8","d10"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        ) : typ === "zbroj" ? (
          <label style={{ flex: 1 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Obrana</span>
            <input type="number" value={slot.obrana ?? ""} onChange={e => onUpdate({ obrana: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="1" style={fSt} />
          </label>
        ) : (
          <div style={{ flex: 1 }} />
        )}
      </div>
      {typ === "zbraň" && !isPreset && (
        <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
          <label style={{ fontSize: 9, color: C.muted, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={!!slot.jeKouzelna} onChange={e => onUpdate({ jeKouzelna: e.target.checked || undefined, jePostribrena: e.target.checked ? undefined : slot.jePostribrena })} />
            Kouzelná (tečka jen na 6)
          </label>
          <label style={{ fontSize: 9, color: C.muted, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={!!slot.jePostribrena} onChange={e => onUpdate({ jePostribrena: e.target.checked || undefined, jeKouzelna: e.target.checked ? undefined : slot.jeKouzelna })} />
            Postříbřená (vždy škrtá)
          </label>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
        <label style={{ flex: 1 }}>
          <span style={{ color: C.muted, fontSize: 9 }}>Tečky</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
            <input type="number" value={slot.tecky.akt} onChange={e => onUpdate({ tecky: { ...slot.tecky, akt: Math.max(0, Number(e.target.value) || 0) } })}
              style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", textAlign: "center" }} />
            <span style={{ fontSize: 9, color: C.muted }}>/</span>
            <input type="number" value={slot.tecky.max} onChange={e => onUpdate({ tecky: { ...slot.tecky, max: Math.max(0, Number(e.target.value) || 0) } })}
              style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", textAlign: "center" }} />
          </div>
        </label>
        <div style={{ display: "flex", gap: 8, paddingBottom: 2 }}>
          <button onClick={onClear} style={{ border: "none", background: "none", color: C.red, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px" }}>smazat</button>
          <button onClick={onClose} style={{ border: "none", background: "none", color: C.green, fontSize: 10, fontFamily: FONT, cursor: "pointer", padding: "2px 4px", fontWeight: 700 }}>✓</button>
        </div>
      </div>
    </div>
  );
}

// --- Inventory Grid ---
function InventoryGrid({ inv, gridLabels, cols, editSlot, setEditSlot, updateSlot, clearSlot, gridId }) {
  const handleSwap = useCallback((fromIdx, toIdx) => {
    // Strip all _occupied before swap, then recalc will rebuild them
    const clean = inv.map(s => s?._occupied ? { ...EMPTY_SLOT } : { ...s });
    const a = clean[fromIdx];
    const b = clean[toIdx];
    const totalRows = Math.ceil(inv.length / cols);

    // Validate multi-slot items physically fit at new position
    const canPlace = (slot, idx) => {
      if (!slot?.nazev || !slot.span || (slot.span.rows <= 1 && slot.span.cols <= 1)) return true;
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      if (r + (slot.span.rows || 1) > totalRows) return false;
      if (c + (slot.span.cols || 1) > cols) return false;
      return true;
    };

    if (!canPlace(a, toIdx) || !canPlace(b, fromIdx)) return;

    clean[fromIdx] = b;
    clean[toIdx] = a;
    updateSlot("__swap__", clean);
  }, [inv, updateSlot, cols]);

  const handleDotToggle = useCallback((idx, dotIdx) => {
    const slot = inv[idx];
    if (!slot || !slot.tecky) return;
    // Toggle: if clicking a filled dot, reduce akt to that position; if empty, fill to that position+1
    const newAkt = dotIdx < slot.tecky.akt ? dotIdx : dotIdx + 1;
    updateSlot(idx, { tecky: { ...slot.tecky, akt: Math.min(newAkt, slot.tecky.max) } });
  }, [inv, updateSlot]);

  const drag = useGridDrag(inv, handleSwap);
  const totalRows = Math.ceil(inv.length / cols);

  return (
    <div
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerLeave={drag.onPointerUp}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        border: `1px solid ${C.border}`,
        background: C.border,
        gap: 1,
      }}
    >
      {inv.map((slot, idx) => {
        const row = Math.floor(idx / cols) + 1;
        const col = (idx % cols) + 1;

        if (slot?._occupied) return null;

        if (editSlot === idx) {
          return (
            <div key={idx} style={{ gridColumn: "1 / -1", gridRow: `${row} / span 1`, zIndex: 10 }}>
              <SlotEditor
                slot={slot}
                slotIndex={idx}
                gridCols={cols}
                gridRows={totalRows}
                gridLabels={gridLabels}
                inv={inv}
                onUpdate={patch => updateSlot(idx, patch)}
                onClear={() => clearSlot(idx)}
                onClose={() => setEditSlot(null)}
                onMoveAndUpdate={(targetIdx, patch) => {
                  const next = inv.map((s, i) => {
                    if (i === idx) return { ...EMPTY_SLOT };
                    if (i === targetIdx) return { ...EMPTY_SLOT, typ: slot.typ, ...patch };
                    return s;
                  });
                  updateSlot("__swap__", next);
                  setEditSlot(targetIdx);
                }}
              />
            </div>
          );
        }

        return (
          <InventoryCard
            key={idx}
            slot={slot}
            index={idx}
            label={gridLabels[idx]}
            isEditing={false}
            onEdit={setEditSlot}
            onDotToggle={handleDotToggle}
            dragHandlers={drag}
            gridId={gridId}
            gridRow={row}
            gridCol={col}
            totalRows={totalRows}
            totalCols={cols}
            gridLabels={gridLabels}
          />
        );
      })}
    </div>
  );
}

function getZkMax(uroven) {
  if (uroven <= 1) return 0;
  if (uroven === 2) return 1000;
  if (uroven === 3) return 3000;
  if (uroven === 4) return 6000;
  // úr. 5+: předchozí + 5000
  return 6000 + (uroven - 4) * 5000;
}

export default function PostavaTab({ character, onUpdate }) {
  const ch = character;
  const zkMax = getZkMax(ch.uroven + 1);
  const [editSlot, setEditSlot] = useState(null);
  const [editHSlot, setEditHSlot] = useState(null); // "pomId:slotIdx"
  const [expandedPom, setExpandedPom] = useState(null);
  const [levelUpResult, setLevelUpResult] = useState(null);
  const inv = ch.inventar || Array.from({ length: 10 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } }));
  const pomocnici = ch.pomocnici || [];
  const statInput = { border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 4px", fontSize: 11, fontFamily: FONT, textAlign: "center", width: 36, background: "white", color: C.text, outline: "none" };

  const setStat = (key, field, val) => {
    const v = Math.max(0, Number(val) || 0);
    onUpdate({ ...ch, [key]: { ...ch[key], [field]: v } });
  };

  const setField = (key, val) => onUpdate({ ...ch, [key]: val });

  const handleLevelUp = () => {
    const novaUroven = ch.uroven + 1;
    const log = [];
    const updated = { ...ch };

    // 1) d20 per vlastnost — pokud hod > max → max +1
    for (const key of ["str", "dex", "wil"]) {
      const d = roll(20);
      const label = key.toUpperCase();
      if (d > updated[key].max) {
        updated[key] = { ...updated[key], max: updated[key].max + 1, akt: updated[key].max + 1 };
        log.push(`${label}: d20=${d} > ${updated[key].max - 1} → max +1 (${updated[key].max})`);
      } else {
        log.push(`${label}: d20=${d} ≤ ${updated[key].max} → beze změny`);
      }
    }

    // 2) Nový hod BO: min(novaUroven, 4) kostek d6
    const pocetKostek = Math.min(novaUroven, 4);
    let noveBo = 0;
    const boHody = [];
    for (let i = 0; i < pocetKostek; i++) {
      const d = roll(6);
      noveBo += d;
      boHody.push(d);
    }
    const staryMax = updated.bo.max;
    if (noveBo > staryMax) {
      updated.bo = { akt: noveBo, max: noveBo };
      log.push(`BO: ${pocetKostek}d6=[${boHody.join(",")}]=${noveBo} > ${staryMax} → nové max ${noveBo}`);
    } else {
      updated.bo = { akt: staryMax + 1, max: staryMax + 1 };
      log.push(`BO: ${pocetKostek}d6=[${boHody.join(",")}]=${noveBo} ≤ ${staryMax} → max +1 (${staryMax + 1})`);
    }

    // 3) Kuráž
    const kurazTable = { 2: 1, 3: 2, 4: 2 };
    const novaKuraz = novaUroven >= 5 ? 3 : (kurazTable[novaUroven] || 0);
    updated.kuraz = novaKuraz;
    log.push(`Kuráž: ${novaKuraz}`);

    // 4) Úroveň +1, ZK = 0
    updated.uroven = novaUroven;
    updated.zk = 0;

    setLevelUpResult(log);
    onUpdate(updated);
  };

  const updateSlot = (idx, patch) => {
    if (idx === "__swap__") {
      onUpdate({ ...ch, inventar: recalcOccupied(patch, 5) });
      return;
    }
    const next = inv.map((s, i) => i === idx ? { ...s, ...patch } : s);
    onUpdate({ ...ch, inventar: recalcOccupied(next, 5) });
  };

  const clearSlot = (idx) => {
    const next = inv.map((s, i) => i === idx ? { ...EMPTY_SLOT } : s);
    onUpdate({ ...ch, inventar: recalcOccupied(next, 5) });
    setEditSlot(null);
  };

  const pridatPomocnika = () => {
    const p = newPomocnik();
    onUpdate({ ...ch, pomocnici: [...pomocnici, p] });
    setExpandedPom(p.id);
  };
  const updatePom = (id, patch) => {
    onUpdate({ ...ch, pomocnici: pomocnici.map(p => p.id === id ? { ...p, ...patch } : p) });
  };
  const propustitPomocnika = (id) => {
    onUpdate({ ...ch, pomocnici: pomocnici.filter(p => p.id !== id) });
    setEditHSlot(null);
  };
  const setPomStat = (id, key, field, val) => {
    const pom = pomocnici.find(p => p.id === id);
    if (!pom) return;
    const v = Math.max(0, Number(val) || 0);
    updatePom(id, { [key]: { ...pom[key], [field]: v } });
  };
  const makeHSlotUpdater = (pomId) => (idx, patch) => {
    if (idx === "__swap__") {
      updatePom(pomId, { inventar: recalcOccupied(patch, 3) });
      return;
    }
    const pom = pomocnici.find(p => p.id === pomId);
    if (!pom) return;
    const next = (pom.inventar || []).map((s, i) => i === idx ? { ...s, ...patch } : s);
    updatePom(pomId, { inventar: recalcOccupied(next, 3) });
  };
  const makeHSlotClear = (pomId) => (idx) => {
    const pom = pomocnici.find(p => p.id === pomId);
    if (!pom) return;
    const next = (pom.inventar || []).map((s, i) => i === idx ? { ...EMPTY_SLOT } : s);
    updatePom(pomId, { inventar: recalcOccupied(next, 3) });
    setEditHSlot(null);
  };

  return (
    <div style={{ padding: "14px 16px", overflowY: "auto", height: "100%", fontFamily: FONT }}>
      {/* Identita */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={ch.jmeno} onChange={e => setField("jmeno", e.target.value)} placeholder="Jméno postavy" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", fontSize: 13, fontWeight: 700, fontFamily: FONT, background: "white", color: C.text, outline: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 2, alignSelf: "center" }}>
            <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>Úr.</span>
            <input type="number" value={ch.uroven} onChange={e => setField("uroven", Math.max(1, Number(e.target.value) || 1))} style={{ ...statInput, width: 28, fontSize: 10, color: C.text, fontWeight: 700 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={ch.puvod} onChange={e => setField("puvod", e.target.value)} placeholder="Původ (Kuchařka...)" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.muted, outline: "none" }} />
          <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>ZK</span>
          <input type="number" value={ch.zk} onChange={e => setField("zk", Math.max(0, Number(e.target.value) || 0))} style={{ ...statInput, width: 44, fontSize: 10, color: C.text }} />
          <span style={{ fontSize: 10, color: C.muted }}>/</span>
          <span style={{ fontSize: 10, color: C.muted }}>{zkMax}</span>
          <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>Ďobky</span>
          <input type="number" value={ch.dobky} onChange={e => setField("dobky", Math.max(0, Number(e.target.value) || 0))} style={{ ...statInput, width: 44, color: C.yellow, fontWeight: 700 }} />
        </div>
      </div>

      {/* Staty */}
      <div style={{ marginBottom: 10 }}>
        {[["str","STR",C.green],["dex","DEX",C.green],["wil","WIL",C.green],["bo","BO",C.red]].map(([key, label, col]) => {
          const s = ch[key];
          const pct = s.max > 0 ? (s.akt / s.max) * 100 : 0;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ width: 28, fontSize: 10, fontWeight: 700, color: col }}>{label}</span>
              <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: col, borderRadius: 3 }} />
              </div>
              <input type="number" value={s.akt} onChange={e => setStat(key, "akt", e.target.value)} style={{ ...statInput, color: col }} />
              <span style={{ fontSize: 10, color: C.muted }}>/</span>
              <input type="number" value={s.max} onChange={e => setStat(key, "max", e.target.value)} style={{ ...statInput, color: C.muted }} />
            </div>
          );
        })}
        {ch.zk >= zkMax && zkMax > 0 && (
          <button onClick={handleLevelUp} style={{ width: "100%", padding: "8px 0", background: C.green, color: "white", border: "none", borderRadius: 6, fontSize: 12, fontFamily: FONT, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
            ⬆ LEVEL UP → Úroveň {ch.uroven + 1}
          </button>
        )}
        {levelUpResult && (
          <div onClick={() => setLevelUpResult(null)} style={{ marginTop: 6, padding: "8px 10px", background: "#e8f5e8", border: `1px solid ${C.green}`, borderRadius: 6, fontSize: 10, fontFamily: FONT, color: C.text, cursor: "pointer" }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: C.green }}>Level Up → Úroveň {ch.uroven}</div>
            {levelUpResult.map((line, i) => <div key={i} style={{ marginBottom: 2 }}>{line}</div>)}
            <div style={{ color: C.muted, marginTop: 4, fontSize: 9 }}>Klikni pro zavření</div>
          </div>
        )}
      </div>

      {/* Vzhled a detaily */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, letterSpacing: 0.8 }}>VZHLED</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <label style={{ flex: 1 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Příjmení</span>
            <input value={ch.prijmeni || ""} onChange={e => setField("prijmeni", e.target.value)} placeholder="d20" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Znamení</span>
            <input value={ch.znameni || ""} onChange={e => setField("znameni", e.target.value)} placeholder="d6" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
          </label>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <label style={{ flex: 1 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Barva srsti</span>
            <input value={ch.barvaSrsti || ""} onChange={e => setField("barvaSrsti", e.target.value)} placeholder="d6" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Vzor srsti</span>
            <input value={ch.vzorSrsti || ""} onChange={e => setField("vzorSrsti", e.target.value)} placeholder="d6" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
          </label>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <label style={{ flex: 2 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Výrazný rys</span>
            <input value={ch.vyraznyRys || ""} onChange={e => setField("vyraznyRys", e.target.value)} placeholder="d66" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Kuráž</span>
            <input type="number" value={ch.kuraz ?? 0} onChange={e => setField("kuraz", Math.max(0, Number(e.target.value) || 0))} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2, textAlign: "center" }} />
          </label>
        </div>
      </div>

      {/* Inventář — Grid */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, letterSpacing: 0.8 }}>INVENTÁŘ (10 slotů)</div>
        <InventoryGrid
          inv={inv}
          gridLabels={PLAYER_GRID}
          cols={5}
          editSlot={editSlot}
          setEditSlot={setEditSlot}
          updateSlot={updateSlot}
          clearSlot={clearSlot}
          gridId="player"
        />
      </div>

      {/* Pomocníci */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: C.muted }}>POMOCNÍCI ({pomocnici.length})</span>
          {pomocnici.length > 0 && (
            <span style={{ fontSize: 9, color: C.yellow }}>
              {pomocnici.reduce((s, p) => s + (p.denniMzda || 0), 0)}ď/den
            </span>
          )}
        </div>
        {pomocnici.map(pom => {
          const hInv = pom.inventar || Array.from({ length: 6 }, () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 } }));
          const isExpanded = expandedPom === pom.id;
          const currentEditH = editHSlot?.startsWith(pom.id + ":") ? Number(editHSlot.split(":")[1]) : null;
          return (
            <div key={pom.id} style={{ marginBottom: 4 }}>
              {/* Hlavička */}
              <div
                onClick={() => setExpandedPom(isExpanded ? null : pom.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: `1px solid ${isExpanded ? C.green : C.border}`, borderRadius: isExpanded ? "6px 6px 0 0" : 6, fontSize: 11, cursor: "pointer", background: isExpanded ? C.green + "08" : "transparent" }}
              >
                <span style={{ flex: 1, fontWeight: isExpanded ? 700 : 400 }}>{pom.jmeno || "Bez jména"}</span>
                {pom.role && <span style={{ fontSize: 8, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "0 4px", lineHeight: "16px" }}>{pom.role}</span>}
                {pom.denniMzda > 0 && <span style={{ fontSize: 9, color: C.yellow }}>{pom.denniMzda}ď</span>}
                <button onClick={e => { e.stopPropagation(); propustitPomocnika(pom.id); }} style={{ background: "none", border: "none", color: C.red, fontSize: 13, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>✕</button>
              </div>
              {isExpanded && (
              <div style={{ border: `1px solid ${C.green}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 10, background: C.bg, fontSize: 10 }}>
              {/* Jméno, role */}
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Jméno</span>
                  <input value={pom.jmeno} onChange={e => updatePom(pom.id, { jmeno: e.target.value })} placeholder="Jméno"
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                </label>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Role</span>
                  <select value={pom.role} onChange={e => {
                    const r = ROLE.find(x => x.name === e.target.value);
                    updatePom(pom.id, { role: e.target.value, ...(r && !pom.denniMzda ? { denniMzda: r.mzda } : {}) });
                  }}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                    <option value="">—</option>
                    {ROLE.map(r => <option key={r.name} value={r.name}>{r.name} ({r.mzda}ď)</option>)}
                  </select>
                </label>
              </div>
              {/* Věrnost + mzda */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Věrnost</span>
                  <select value={pom.vernost} onChange={e => updatePom(pom.id, { vernost: e.target.value })}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }}>
                    <option value="bezny">běžný</option>
                    <option value="verny">věrný</option>
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>Mzda (ď/den)</span>
                  <input type="number" value={pom.denniMzda} onChange={e => updatePom(pom.id, { denniMzda: Math.max(0, Number(e.target.value) || 0) })}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 10, fontFamily: FONT, background: "white", color: C.text, outline: "none", boxSizing: "border-box", marginTop: 2 }} />
                </label>
              </div>
              {/* Staty */}
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontWeight: 700 }}>STATY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
                {["str", "dex", "wil", "bo"].map(key => {
                  const s = pom[key];
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, color: C.muted, width: 24, textTransform: "uppercase" }}>{key}</span>
                      <input type="number" value={s.akt} onChange={e => setPomStat(pom.id, key, "akt", e.target.value)} placeholder="akt"
                        style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 4px", fontSize: 10, fontFamily: FONT, textAlign: "center", color: C.text, outline: "none" }} />
                      <span style={{ color: C.muted, fontSize: 9 }}>/</span>
                      <input type="number" value={s.max} onChange={e => setPomStat(pom.id, key, "max", e.target.value)} placeholder="max"
                        style={{ width: 32, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 4px", fontSize: 10, fontFamily: FONT, textAlign: "center", color: C.text, outline: "none" }} />
                    </div>
                  );
                })}
              </div>
              {/* Inventář pomocníka — Grid */}
              <div style={{ fontSize: 8, color: C.muted, marginBottom: 4, letterSpacing: 0.5 }}>INVENTÁŘ (6 slotů)</div>
              <InventoryGrid
                inv={hInv}
                gridLabels={HIRELING_GRID}
                cols={3}
                editSlot={currentEditH}
                setEditSlot={(idx) => setEditHSlot(idx === null ? null : pom.id + ":" + idx)}
                updateSlot={makeHSlotUpdater(pom.id)}
                clearSlot={makeHSlotClear(pom.id)}
                gridId={`hireling-${pom.id}`}
              />
              </div>
              )}
            </div>
          );
        })}
        <button
          onClick={pridatPomocnika}
          style={{ width: "100%", padding: "8px 0", border: `1px dashed ${C.border}`, borderRadius: 6, background: "transparent", fontFamily: FONT, fontSize: 11, color: C.muted, cursor: "pointer" }}
        >+ Přidat pomocníka</button>
      </div>
    </div>
  );
}
