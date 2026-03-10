/**
 * AI NAŠEPTÁVAČ — interaktivní designový diagram
 * Verze: 0.1 (koncept / brainstorming)
 * Stav: NIČEHO z tohoto není implementováno
 */
import { useState, useRef, useEffect } from "react";

// ── POPISY (klik na nod → detail panel) ─────────────────────

const DESCRIPTIONS = {
  _intro: {
    title: "AI Našeptávač — Koncept",
    text: `Našeptávač je AI asistent, který po hodu na Meaning Tables jemně nahodí 2–3 poetické střípky, co by výsledek mohl evokovat.

Jako nápověda v divadle — neříká co to JE, jen šeptá možnosti. Hráč si vybere jestli ho to inspiruje nebo ne.

KLÍČOVÉ PRINCIPY:
• Appka funguje úplně stejně i bez něj
• Výsledek hodu se zobrazí okamžitě (žádné čekání na AI)
• AI jede async na pozadí
• Bez API klíče se nic nestane, žádný error
• Hráč rozhoduje co to znamená, ne AI

STAV: Brainstorming. Nic není implementováno. Tento diagram slouží k diskuzi a plánování.`,
  },

  meaning_sheet: {
    title: "Meaning Sheet",
    text: `Stávající bottom sheet pro Meaning Tables. Hráč vybere tabulku (Actions / Descriptions / obě) a hodí 2× d100.

NOVÉ: Přibude volitelný selektor kontextu — pomůže AI lépe zaměřit návrhy.

Kontext NENÍ povinný. Bez něj AI dostane jen holá slova. S kontextem ví jestli hráč hledá inspiraci pro terén, postavu, událost nebo předmět.

Sheet zůstává jednoduchý. Kontext je jen řada chipů, ne nový formulář.`,
  },

  kontext: {
    title: "Kontext (volitelný)",
    text: `Řada chipů/tlačítek v Meaning Sheet:
• terén — krajina, místo, počasí
• postava — NPC, chování, vzhled
• událost — co se stane, zápletka
• předmět — věc, nález, poklad
• (volný text) — hráč napíše vlastní kontext

Výchozí stav: nic není vybráno. AI pak dostane jen slova bez kontextu — pořád funguje, jen méně zaměřeně.

Kontext se NEUKLÁDÁ do deníku. Je to jen vstup pro AI.`,
  },

  hod: {
    title: "Hod 2× d100",
    text: `Standardní mechanika Meaning Tables — dvě d100 kostky, každá vybere jedno slovo z tabulky.

Tady se nic nemění. Hod funguje přesně jako teď.

Výsledek (dvě slova) se zobrazí OKAMŽITĚ. Hráč nemusí čekat na AI.`,
  },

  vysledek: {
    title: "Výsledek — zobrazí se hned",
    text: `Klíčový designový princip: výsledek hodu (dvě slova) se zobrazí OKAMŽITĚ.

Hráč nečeká na AI. Vidí "Remarkable + Small" a může rovnou přemýšlet. AI střípky se objeví async pod výsledkem, až budou ready.

Pokud AI klíč neexistuje → výsledek je finální, žádný loading, žádný placeholder. Appka se chová přesně jako teď.

Pokud AI klíč existuje → pod výsledkem se objeví jemný loading indikátor (tři tečky? fade?) a po 1–2 sekundách se zobrazí střípky.`,
  },

  async_label: {
    title: "Async volání",
    text: `Pokud hráč má nastavený API klíč, po zobrazení výsledku se na pozadí spustí volání Claude API.

Klíčové: NIKDY neblokuje UI. Hráč může rovnou kliknout "Vložit do deníku" a střípky ignorovat. Nebo počkat 1–2 sekundy.

Pokud API selže (timeout, chyba, limit) → tiše se skryje. Žádný error dialog. Našeptávač prostě nepřijde.`,
  },

  api_call: {
    title: "Claude API — volání",
    text: `Přímý fetch na Anthropic Messages API.

VSTUP (co se posílá):
• Systémový prompt (pravidla pro AI — viz uzel "Systémový prompt")
• Hodená slova (např. "Remarkable + Small")
• Kontext kategorie (terén/postava/událost/předmět)
• Název aktuální scény
• Posledních N zápisů z deníku (kontext příběhu)
• Svět = Mausritter (myší fantasy)

VÝSTUP:
• 2–3 krátké poetické střípky (5–10 slov každý)
• Formát: prostý text, jeden střípek na řádek

PARAMETRY:
• max_tokens: ~100
• temperature: ~0.9 (kreativní)
• Jeden dotaz ≈ 200 input + 50 output tokenů

CORS OTÁZKA:
Anthropic API možná nepovoluje volání přímo z browseru. Pokud ne → potřebujeme jednoduchý proxy. Tohle musíme ověřit.`,
  },

  sys_prompt: {
    title: "Systémový prompt",
    text: `Draft systémového promptu pro AI:

"Jsi tichý našeptávač pro sólové RPG zasazené do světa Mausritter — fantasy světa inteligentních myší.

Hráč hodil na tabulku významu a padla mu dvě slova. Tvůj úkol: nahoď 2–3 krátké poetické střípky (5–10 slov), co by ta slova MOHLA evokovat v daném kontextu.

Pravidla:
- Neříkej co to JE. Jen šeptej co by to mohlo být.
- Buď konkrétní a smyslový (zvuky, barvy, textury).
- Respektuj myší měřítko (žalud = balvan, kočka = drak).
- Piš česky.
- Žádné úvody, žádné vysvětlování. Jen střípky.
- Každý střípek na vlastní řádek."

OTEVŘENÉ: Prompt bude potřeba iterovat a testovat. Tohle je první draft.`,
  },

  kontext_deniku: {
    title: "Kontext z deníku",
    text: `Aby AI věděl co se ve hře děje, posíláme mu kontext z deníku.

CO POSÍLAT:
• Název aktuální scény
• Posledních N zápisů (texty, fate výsledky, combat logy...)
• Jméno postavy, aktuální lokace?

OTEVŘENÉ OTÁZKY:
• Kolik zápisů? 5? 10? Celou aktuální scénu?
• Víc kontextu = lepší návrhy, ale víc tokenů = dražší
• Posílat i NPC seznam? Thread seznam?
• Jak formátovat zápisy pro AI? (raw text, strukturovaný?)

CENOVÝ DOPAD:
• Každých 100 tokenů kontextu ≈ +$0.000025 (Haiku)
• 10 zápisů ≈ 500 tokenů ≈ zanedbatelné
• Celá scéna (50 zápisů) ≈ 2500 tokenů ≈ pořád levné`,
  },

  naseptavac: {
    title: "💭 Našeptávač — výstup",
    text: `Jádro celé featury. Pod výsledkem hodu se objeví 2–3 krátké poetické střípky.

PŘÍKLAD:
🔮 Remarkable + Small
💭 křišťálová dutina v kořenu
💭 svítící kapka na pavučině
💭 kamenný kruh menší než dlaň

VIZUÁLNÍ STYL (k diskuzi):
• Kurzíva, tlumená barva (C.muted nebo C.purple?)
• Čárkovaný border? Nebo jen odsazení?
• Fade-in animace? (subtle, ne flashy)
• Ikonka 💭 před každým střípkem

INTERAKCE:
• Klik na střípek → označí ho pro uložení do deníku
• Klik na "Vložit" → MeaningBlock + vybraný střípek
• Nebo prostě "Vložit" bez výběru → jen slova jako teď`,
  },

  ulozit: {
    title: "Uložit s inspirací",
    text: `Hráč klikne na střípek, který ho zaujal. Ten se přidá do MeaningBlock v deníku.

VÝSLEDEK V DENÍKU:
🔮 Remarkable + Small
💭 křišťálová dutina v kořenu

Střípek je vizuálně odlišený (kurzíva, menší, tlumená barva) — jasně viditelné že to je inspirace, ne výsledek hodu.

Hráč může vybrat max 1 střípek? Nebo víc? K diskuzi.`,
  },

  ignorovat: {
    title: "Ignorovat — jen slova",
    text: `Hráč klikne "Vložit do deníku" bez výběru střípku. Do deníku se uloží jen hodená slova, přesně jako teď.

🔮 Remarkable + Small

Našeptávač splnil svou roli — pomohl hráči přemýšlet. Ale hráč se rozhodl jinak a to je v pořádku.

Tohle je výchozí chování. Našeptávač nikdy nic nenutí.`,
  },

  denik_s: {
    title: "MeaningBlock s inspirací",
    text: `Rozšířený MeaningBlock v deníku. Obsahuje hodená slova + vybraný střípek.

Příklad:
🔮 Remarkable + Small
💭 křišťálová dutina v kořenu

Střípek se uloží do game.entries[] jako součást meaning bloku — nové pole "inspirace" nebo podobně.

DATOVÝ MODEL (draft):
{
  type: "meaning",
  text: "Remarkable + Small",
  inspirace: "křišťálová dutina v kořenu"  // nové, volitelné
}`,
  },

  denik_bez: {
    title: "MeaningBlock bez inspirace",
    text: `Standardní MeaningBlock — přesně jako teď.

🔮 Remarkable + Small

Žádná změna v datovém modelu. Pole "inspirace" je undefined/null.`,
  },

  nastaveni: {
    title: "⚙️ Nastavení — API klíč",
    text: `Nová sekce v UI kde hráč vloží svůj Anthropic API klíč.

KDE V UI:
• Svět tab → Nastavení? Nebo vlastní tab?
• Nebo ikonka ⚙️ v headeru?
• K diskuzi — nechceme to schovat příliš hluboko

ULOŽENÍ:
• localStorage (jako zbytek appky)
• Plain text (šifrování bez serveru = security theater)
• Klíč: "solorpg_api_key" nebo uvnitř game objektu?

VALIDACE:
• Po vložení klíče → zkušební API call?
• Nebo prostě uložit a zjistit při prvním hodu?

BEZ KLÍČE:
• Žádný našeptávač, žádný loading, žádný error
• Appka se chová přesně jako teď
• Ani zmínka o AI v UI (nebo jemný hint v nastavení?)`,
  },

  model: {
    title: "Volba modelu",
    text: `Který Claude model použít:

HAIKU (claude-haiku-4-5-20251001):
• Nejrychlejší (~0.5s odpověď)
• Nejlevnější ($0.25/M input, $1.25/M output)
• Pro krátké poetické střípky asi stačí
• 100 hodů ≈ 1 cent

SONNET (claude-sonnet-4-6-20250514):
• Lepší kvalita, kreativnější
• Pomalejší (~1-2s)
• Dražší ($3/M input, $15/M output)
• 100 hodů ≈ 10 centů

OTÁZKA: Dát hráči na výběr? Nebo hardcoded Haiku?
Pro začátek asi Haiku — rychlost je důležitá pro plynulost hry.`,
  },

  bez_klice: {
    title: "Bez API klíče",
    text: `Když hráč nemá nastavený API klíč, appka se chová PŘESNĚ jako teď.

• Meaning Sheet funguje normálně
• Žádný loading indikátor
• Žádná zmínka o AI
• Žádný error, žádný warning

Našeptávač je čistě opt-in. Hráč se o něm dozví z nastavení, nebo z nápovědy.

Tohle je důležité — appka nesmí vypadat "rozbitě" bez API klíče. AI vrstva je bonus, ne základ.`,
  },
};

// ── STYLY NODŮ ──────────────────────────────────────────────

const STYLES = {
  flow_start: { fill: "#faf9f6", stroke: "#555", textFill: "#333", fontWeight: 700, rx: 8, fontSize: 11 },
  flow: { fill: "#faf9f6", stroke: "#888", textFill: "#444", fontWeight: 500, rx: 6, fontSize: 10 },
  flow_action: { fill: "#e8e5dd", stroke: "#555", textFill: "#222", fontWeight: 700, rx: 6, fontSize: 11 },
  flow_result: { fill: "#2a2a2a", stroke: "#2a2a2a", textFill: "#faf9f6", fontWeight: 700, rx: 6, fontSize: 11 },
  ai_core: { fill: "#3a2a4a", stroke: "#7a5aaa", textFill: "#faf9f6", fontWeight: 700, rx: 6, fontSize: 11 },
  ai_input: { fill: "#f5f3fa", stroke: "#9a8aba", textFill: "#4a3a6a", fontWeight: 500, rx: 4, fontSize: 9.5 },
  ai_output: { fill: "#f0ecf8", stroke: "#7a5aaa", textFill: "#3a2a5a", fontWeight: 700, rx: 8, fontSize: 11 },
  output_yes: { fill: "#dde8dd", stroke: "#4a7a4a", textFill: "#2a4a2a", fontWeight: 600, rx: 6, fontSize: 10 },
  output_no: { fill: "#faf9f6", stroke: "#bbb", textFill: "#888", fontWeight: 500, rx: 6, fontSize: 10 },
  denik: { fill: "#faf9f6", stroke: "#999", textFill: "#555", fontWeight: 500, rx: 4, fontSize: 9 },
  config: { fill: "#faf9f6", stroke: "#c89030", textFill: "#6a4a10", fontWeight: 600, rx: 4, fontSize: 9.5 },
  config_note: { fill: "#faf9f6", stroke: "#ddd", textFill: "#aaa", fontWeight: 500, rx: 4, fontSize: 9 },
  sublabel: { fill: "transparent", stroke: "none", textFill: "#999", fontWeight: 400, rx: 0, fontSize: 8.5 },
};

// ── NODY ────────────────────────────────────────────────────

const NODES = [
  // Skupiny (groups)
  { id: "grp_player", type: "group", label: "HRACOVA AKCE", x: 235, y: 42, w: 270, h: 290 },
  { id: "grp_ai", type: "group", label: "AI VRSTVA (async, volitena)", x: 15, y: 400, w: 505, h: 220 },
  { id: "grp_output", type: "group", label: "VYSTUP DO DENIKU", x: 195, y: 655, w: 380, h: 155 },

  // Hlavni flow (stred)
  { id: "meaning_sheet", type: "flow_start", label: "MEANING SHEET\nHrac otevre tabulky", x: 270, y: 65, w: 200, h: 48 },
  { id: "kontext", type: "flow", label: "Kontext (volitelny)\nteren \u00b7 postava \u00b7 udalost \u00b7 predmet", x: 252, y: 148, w: 236, h: 42 },
  { id: "hod", type: "flow_action", label: "HOD 2\u00d7 d100\n\u2192 dve slova", x: 305, y: 228, w: 130, h: 42 },
  { id: "vysledek", type: "flow_result", label: "VYSLEDEK\nzobrazi se OKAMZITE", x: 265, y: 310, w: 210, h: 48 },

  // Async label
  { id: "async_label", type: "sublabel", label: "async \u00b7 pokud existuje API klic", x: 270, y: 375, w: 200, h: 18 },

  // AI vrstva
  { id: "api_call", type: "ai_core", label: "CLAUDE API\nasync na pozadi", x: 265, y: 475, w: 210, h: 48 },
  { id: "naseptavac", type: "ai_output", label: "\ud83d\udcad NASEPTAVAC\n2\u20133 poeticke stripky", x: 255, y: 570, w: 230, h: 52 },

  // AI vstupy (vlevo)
  { id: "sys_prompt", type: "ai_input", label: "Systemovy prompt\npravidla pro AI", x: 30, y: 450, w: 180, h: 42 },
  { id: "kontext_deniku", type: "ai_input", label: "Kontext z deniku\nposlednich N zapisu", x: 30, y: 530, w: 180, h: 42 },

  // Konfigurace (vpravo)
  { id: "nastaveni", type: "config", label: "\u2699\ufe0f NASTAVENI\nAPI klic hrace", x: 565, y: 65, w: 155, h: 40 },
  { id: "model", type: "config", label: "Model\nHaiku \u00b7 Sonnet", x: 565, y: 475, w: 140, h: 38 },
  { id: "bez_klice", type: "config_note", label: "Bez klice =\nfunguje jako ted\nzadny error", x: 555, y: 560, w: 155, h: 50 },

  // Vystup (dole)
  { id: "ulozit", type: "output_yes", label: "Klik na stripek\n\u2192 ulozi inspiraci", x: 215, y: 680, w: 165, h: 42 },
  { id: "ignorovat", type: "output_no", label: "Ignorovat\n\u2192 jen slova", x: 415, y: 680, w: 140, h: 42 },
  { id: "denik_s", type: "denik", label: "\ud83d\udd2e Slova + \ud83d\udcad", x: 222, y: 755, w: 150, h: 34 },
  { id: "denik_bez", type: "denik", label: "\ud83d\udd2e Jen slova", x: 425, y: 755, w: 120, h: 34 },
];

// ── HRANY ───────────────────────────────────────────────────

const EDGES = [
  // Hlavni flow (solid)
  { from: "meaning_sheet", fromSide: "bottom", to: "kontext", toSide: "top", style: "solid" },
  { from: "kontext", fromSide: "bottom", to: "hod", toSide: "top", style: "solid" },
  { from: "hod", fromSide: "bottom", to: "vysledek", toSide: "top", style: "solid" },

  // Async AI vetev (dashed)
  { from: "vysledek", fromSide: "bottom", to: "api_call", toSide: "top", style: "dashed" },
  { from: "api_call", fromSide: "bottom", to: "naseptavac", toSide: "top", style: "dashed" },

  // Vystup (solid)
  { from: "naseptavac", fromSide: "bottom", to: "ulozit", toSide: "top", style: "solid" },
  { from: "naseptavac", fromSide: "bottom", to: "ignorovat", toSide: "top", style: "solid" },
  { from: "ulozit", fromSide: "bottom", to: "denik_s", toSide: "top", style: "solid" },
  { from: "ignorovat", fromSide: "bottom", to: "denik_bez", toSide: "top", style: "solid" },

  // AI vstupy → API call (dashed)
  { from: "sys_prompt", fromSide: "right", to: "api_call", toSide: "left", style: "dashed" },
  { from: "kontext_deniku", fromSide: "right", to: "api_call", toSide: "left", style: "dashed" },

  // Konfig → API call (dashed)
  { from: "model", fromSide: "left", to: "api_call", toSide: "right", style: "dashed" },
];

// ── SVG KOMPONENTY ──────────────────────────────────────────

function getAnchor(node, side) {
  const cx = node.x + node.w / 2, cy = node.y + node.h / 2;
  switch (side) {
    case "top": return { x: cx, y: node.y };
    case "bottom": return { x: cx, y: node.y + node.h };
    case "left": return { x: node.x, y: cy };
    case "right": return { x: node.x + node.w, y: cy };
    default: return { x: cx, y: cy };
  }
}

function EdgePath({ edge, nodes }) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const a = getAnchor(fromNode, edge.fromSide);
  const b = getAnchor(toNode, edge.toSide);
  const fs = edge.fromSide, ts = edge.toSide;
  let path;

  if (fs === "bottom" && ts === "top") {
    const midY = (a.y + b.y) / 2;
    path = `M${a.x},${a.y} L${a.x},${midY} L${b.x},${midY} L${b.x},${b.y}`;
  } else if (fs === "right" && ts === "left") {
    const midX = (a.x + b.x) / 2;
    path = `M${a.x},${a.y} L${midX},${a.y} L${midX},${b.y} L${b.x},${b.y}`;
  } else if (fs === "left" && ts === "right") {
    const midX = (a.x + b.x) / 2;
    path = `M${a.x},${a.y} L${midX},${a.y} L${midX},${b.y} L${b.x},${b.y}`;
  } else {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  }

  const color = edge.style === "solid" ? "#555" : "#aaa";
  return (
    <g>
      <path d={path} fill="none" stroke={color} strokeWidth={1.4}
        strokeDasharray={edge.style === "dashed" ? "6 4" : "none"} />
      <ArrowHead x={b.x} y={b.y} side={edge.toSide} color={color} />
    </g>
  );
}

function ArrowHead({ x, y, side, color }) {
  const s = 6;
  const pts = {
    left: `${x},${y} ${x+s},${y-s/2} ${x+s},${y+s/2}`,
    right: `${x},${y} ${x-s},${y-s/2} ${x-s},${y+s/2}`,
    top: `${x},${y} ${x-s/2},${y+s} ${x+s/2},${y+s}`,
    bottom: `${x},${y} ${x-s/2},${y-s} ${x+s/2},${y-s}`,
  };
  return pts[side] ? <polygon points={pts[side]} fill={color} /> : null;
}

function NodeBox({ node, selected, onSelect }) {
  const hasDesc = DESCRIPTIONS[node.id];
  const isSelected = selected === node.id;
  const clickable = !!hasDesc;

  if (node.type === "group") {
    return (
      <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined}
        style={{ cursor: clickable ? "pointer" : "default" }}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={isSelected ? "rgba(100,100,200,0.06)" : "none"}
          stroke={isSelected ? "#666" : "#ccc"} strokeWidth={isSelected ? 1.5 : 1}
          strokeDasharray="6 3" rx={6} />
        <text x={node.x + node.w / 2} y={node.y - 6} textAnchor="middle"
          style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace",
            fill: isSelected ? "#555" : "#999", fontWeight: 600, letterSpacing: "0.08em" }}>
          {node.label}
        </text>
      </g>
    );
  }

  const s = STYLES[node.type] || STYLES.flow;
  const lines = node.label.split("\n");
  const fontSize = s.fontSize || 10;
  const lineHeight = fontSize + 3.5;
  const totalH = lines.length * lineHeight;
  const startY = node.y + node.h / 2 - totalH / 2 + lineHeight * 0.72;
  const hlStroke = isSelected
    ? (s.fill.startsWith("#2") || s.fill.startsWith("#3") || s.fill.startsWith("#4") ? "#8888cc" : "#555")
    : s.stroke;
  const hlWidth = isSelected ? 2.5 : 1.2;

  return (
    <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined}
      style={{ cursor: clickable ? "pointer" : "default" }}>
      {s.stroke !== "none" && (
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={s.fill} stroke={hlStroke} strokeWidth={hlWidth} rx={s.rx} />
      )}
      {lines.map((line, i) => (
        <text key={i} x={node.x + node.w / 2} y={startY + i * lineHeight} textAnchor="middle"
          style={{ fontSize, fontFamily: "'IBM Plex Mono', monospace",
            fill: s.textFill, fontWeight: i === 0 ? s.fontWeight : Math.min(s.fontWeight, 500),
            letterSpacing: "0.02em" }}>
          {line}
        </text>
      ))}
    </g>
  );
}

function InfoPanel({ descId, onClose }) {
  const desc = DESCRIPTIONS[descId];
  if (!desc) return null;
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(460px, 88vw)",
      background: "#faf9f6", borderLeft: "2px solid #7a5aaa", zIndex: 20,
      display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #e0ddd5",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#222",
          fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.3, paddingRight: 12 }}>
          {desc.title}
        </h2>
        <button onClick={onClose} style={{ background: "#3a2a4a", color: "#faf9f6", border: "none",
          borderRadius: 4, width: 30, height: 30, fontSize: 15, cursor: "pointer", flexShrink: 0,
          fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center",
          justifyContent: "center" }}>
          ✕
        </button>
      </div>
      <div style={{ padding: "14px 18px", overflowY: "auto", flex: 1 }}>
        {desc.text.split("\n\n").map((para, i) => (
          <p key={i} style={{ margin: "0 0 12px 0", fontSize: 12.5, lineHeight: 1.65, color: "#444",
            fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap" }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── HLAVNI KOMPONENTA ───────────────────────────────────────

function getTouchDist(t1, t2) {
  return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
}

export default function AINaseptavacDiagram() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState("_intro");
  const [didMove, setDidMove] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);
  const pinchRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => { panRef.current = pan; }, [pan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.92 : 1.08), 0.3), 3));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e) => { if (e.touches.length > 1) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  const handleTouchStart = (e) => {
    setDidMove(false);
    if (e.touches.length === 1) {
      setDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX - panRef.current.x, y: e.touches[0].clientY - panRef.current.y };
    } else if (e.touches.length === 2) {
      setDragging(false);
      pinchRef.current = { dist: getTouchDist(e.touches[0], e.touches[1]), zoom };
    }
  };
  const handleTouchMove = (e) => {
    setDidMove(true);
    if (e.touches.length === 1 && dragging) {
      setPan({ x: e.touches[0].clientX - dragStartRef.current.x, y: e.touches[0].clientY - dragStartRef.current.y });
    } else if (e.touches.length === 2 && pinchRef.current) {
      setZoom(Math.min(Math.max(pinchRef.current.zoom * (getTouchDist(e.touches[0], e.touches[1]) / pinchRef.current.dist), 0.3), 3));
    }
  };
  const handleTouchEnd = () => { setDragging(false); pinchRef.current = null; };
  const handleMouseDown = (e) => {
    if (e.button === 0) { setDragging(true); setDidMove(false); dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }
  };
  const handleMouseMove = (e) => {
    if (dragging) { setDidMove(true); setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); }
  };
  const handleMouseUp = () => setDragging(false);
  const handleSvgClick = () => { if (!didMove) setSelected(null); };
  const handleNodeSelect = (id) => { if (!didMove) setSelected(id === selected ? null : id); };

  const btnStyle = {
    width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#3a2a4a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18,
    fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer",
    WebkitTapHighlightColor: "transparent", userSelect: "none",
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#faf9f6",
      fontFamily: "'IBM Plex Mono', monospace", position: "relative", overflow: "hidden", touchAction: "pan-y" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 14px",
        background: "rgba(250,249,246,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e0ddd5",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#3a2a4a", letterSpacing: "0.05em" }}>
          AI NASEPTAVAC — KONCEPT
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setSelected("_intro")} style={{
            fontSize: 9, padding: "4px 10px", background: selected === "_intro" ? "#5a4a6a" : "#3a2a4a",
            color: "#faf9f6", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            i O PROJEKTU
          </button>
          <span style={{ fontSize: 10, color: "#888" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Zoom buttons */}
      <div style={{ position: "absolute", bottom: 20, right: selected ? "min(476px, calc(88vw + 16px))" : 16,
        display: "flex", flexDirection: "column", gap: 6, zIndex: 10, transition: "right 0.2s" }}>
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} style={btnStyle}>+</button>
        <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.3))} style={btnStyle}>-</button>
        <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} style={{ ...btnStyle, fontSize: 11 }}>&#8634;</button>
      </div>

      {/* SVG Canvas */}
      <svg width="100%" height="100%" style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onClick={handleSvgClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="0.5" fill="#ddd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {EDGES.map((edge, i) => <EdgePath key={i} edge={edge} nodes={NODES} />)}
          {NODES.map(node => <NodeBox key={node.id} node={node} selected={selected} onSelect={handleNodeSelect} />)}
        </g>
      </svg>

      {/* Help text */}
      <div style={{ position: "absolute", bottom: 6, left: 14, fontSize: 9, color: "#bbb" }}>
        KLIKNI NA BLOK PRO DETAIL &middot; TAHNI &middot; PINCH ZOOM &middot; CTRL+SCROLL
      </div>

      {/* Info panel */}
      {selected && <InfoPanel descId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
