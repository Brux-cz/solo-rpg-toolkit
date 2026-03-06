import { useState, useEffect } from "react";

// ─── Barvy a font ─────────────────────────────────────────────────
const C = {
  bg: "#faf9f6",
  text: "#2a2a2a",
  muted: "#888",
  border: "#e0ddd8",
  green: "#4a7a4a",
  red: "#aa4444",
  yellow: "#c89030",
  purple: "#7a5aaa",
  blue: "#8888cc",
};
const FONT = "'IBM Plex Mono', monospace";

// ─── Fate Chart (threshold tabulka: odds[row] x CF[col]) ────────
// Rows: Impossible(0)..Has to be(9), Cols: CF 1..9
// Value = threshold for YES on d100 (roll <= threshold = YES)
const FATE_CHART = [
  /* Impossible   */ [10, 5, 5, 5, 5, 4, 3, 2, 1],
  /* No way       */ [15, 10, 7, 5, 5, 5, 4, 4, 2],
  /* V.unlikely   */ [16, 15, 10, 7, 5, 5, 5, 4, 4],
  /* Unlikely     */ [20, 18, 15, 10, 8, 5, 5, 5, 5],
  /* 50/50        */ [50, 45, 35, 25, 15, 10, 8, 5, 5],
  /* Likely       */ [85, 80, 75, 65, 50, 45, 35, 25, 15],
  /* V.likely     */ [90, 85, 85, 80, 75, 65, 50, 45, 25],
  /* Near sure    */ [95, 95, 90, 85, 85, 80, 75, 55, 50],
  /* Sure thing   */ [95, 95, 95, 90, 90, 85, 80, 75, 55],
  /* Has to be    */ [99, 99, 95, 95, 95, 90, 85, 80, 75],
];

// Exceptional YES if roll <= threshold / 5 (rounded down), Exceptional NO if roll >= 100 - (100-threshold)/5
// Random Event if doubles (11,22,33,...,99,00) AND the digit <= CF

// ─── Meaning Tables ─────────────────────────────────────────────
const ACTIONS = [
  "Attainment","Starting","Neglect","Fight","Recruit","Triumph","Violate","Oppose","Malice","Communicate",
  "Persecute","Increase","Decrease","Abandon","Gratify","Inquire","Antagonize","Move","Waste","Truce",
  "Release","Befriend","Judge","Desert","Dominate","Procrastinate","Praise","Separate","Take","Break",
  "Heal","Delay","Stop","Lie","Return","Imitate","Struggle","Inform","Bestow","Postpone",
  "Expose","Haggle","Imprison","Release","Celebrate","Develop","Travel","Block","Harm","Debase",
  "Overindulge","Adjourn","Adversity","Kill","Disrupt","Usurp","Create","Betray","Agree","Abuse",
  "Oppress","Inspect","Ambush","Spy","Attach","Carry","Open","Carelessness","Ruin","Extravagance",
  "Trick","Arrive","Propose","Divide","Refuse","Mistrust","Deceive","Cruelty","Intolerance","Trust",
  "Excitement","Activity","Assist","Care","Negligence","Passion","Work","Control","Attract","Failure",
  "Pursue","Vengeance","Proceedings","Dispute","Punish","Guide","Transform","Overthrow","Oppress","Change",
];

const DESCRIPTIONS = [
  "Abnormally","Adventurously","Aggressively","Angrily","Anxiously","Awkwardly","Beautifully","Bleakly","Boldly","Bravely",
  "Busily","Calmly","Carefully","Carelessly","Cautiously","Ceaselessly","Cheerfully","Combatively","Coolly","Crazily",
  "Curiously","Daintily","Dangerously","Defiantly","Deliberately","Delightfully","Dimly","Efficiently","Energetically","Enormously",
  "Enthusiastically","Excitedly","Fearfully","Ferociously","Fiercely","Foolishly","Fortunately","Freely","Frighteningly","Fully",
  "Generously","Gently","Gladly","Gracefully","Gratefully","Happily","Hastily","Healthily","Helpfully","Helplessly",
  "Heroically","Honestly","Hopelessly","Hungrily","Immediately","Impatiently","Independently","Innocently","Insistently","Intensely",
  "Interestingly","Irritatingly","Joyfully","Judgmentally","Kindly","Knowingly","Lazily","Lightly","Loosely","Loudly",
  "Lovingly","Loyally","Meanly","Mildly","Mysteriously","Naturally","Neatly","Nervously","Nicely","Oddly",
  "Offensively","Officially","Partially","Passively","Peacefully","Perfectly","Playfully","Politely","Positively","Powerfully",
  "Quaintly","Quarrelsomely","Quietly","Roughly","Rudely","Ruthlessly","Sadly","Savagely","Seriously","Sharply",
];

const SCENE_ADJ = [
  "Odeber postavu","Odeber předmět","Přidej postavu","Přidej předmět",
  "Změň lokaci","Změň motivaci","Změň atmosféru","DVĚ úpravy",
  "Přidej překvapení","Odeber překážku",
];

const EVENT_FOCUS = [
  [7,"Remote Event"],[28,"NPC Action"],[35,"New NPC"],
  [45,"Move toward thread"],[52,"Move away from thread"],
  [55,"Close thread"],[67,"PC Negative"],[75,"PC Positive"],
  [83,"Ambiguous"],[92,"NPC Negative"],[100,"NPC Positive"],
];

// ─── Bestiář ─────────────────────────────────────────────────────
const BESTIARY = [
  { name: "Myš (rival)", str: 9, dex: 9, wil: 9, bo: 3, weapon: "d6", weaponName: "Meč", armor: 0, crit: "Podlomí morálku spojenců" },
  { name: "Krysa", str: 12, dex: 8, wil: 8, bo: 3, weapon: "d6", weaponName: "Sekáček", armor: 0, crit: "Ukradne cenný předmět" },
  { name: "Pavouk", str: 8, dex: 15, wil: 10, bo: 6, weapon: "d6", weaponName: "Jedové kousnutí", armor: 1, crit: "Odnese v kokonu" },
  { name: "Had", str: 12, dex: 10, wil: 10, bo: 12, weapon: "d8", weaponName: "Kousnutí", armor: 2, crit: "Spolkne oběť zaživa" },
  { name: "Kočka", str: 15, dex: 15, wil: 10, bo: 15, weapon: "d8", weaponName: "Kousnutí", armor: 1, crit: "Roztrhne myš vedví" },
  { name: "Sova", str: 14, dex: 12, wil: 15, bo: 15, weapon: "d10", weaponName: "Kousnutí", armor: 1, crit: "Odnese do hnízda" },
  { name: "Duch", str: 5, dex: 10, wil: 10, bo: 9, weapon: "d8", weaponName: "Mrazivý dotyk", armor: 0, crit: "Ovládne zasaženého" },
  { name: "Stonožka", str: 6, dex: 14, wil: 4, bo: 4, weapon: "d6", weaponName: "Kousnutí", armor: 1, crit: "Jed: STR save nebo paralýza" },
  { name: "Vrána", str: 10, dex: 14, wil: 12, bo: 10, weapon: "d8", weaponName: "Zobák", armor: 0, crit: "Unese oběť do vzduchu" },
  { name: "Žába", str: 12, dex: 8, wil: 10, bo: 8, weapon: "d6", weaponName: "Jazyk", armor: 1, crit: "Spolkne a drží v žaludku" },
  { name: "Mravenec-voják", str: 8, dex: 10, wil: 14, bo: 4, weapon: "d6", weaponName: "Kusadla", armor: 2, crit: "Přivolá posily" },
  { name: "Lasička", str: 14, dex: 14, wil: 8, bo: 12, weapon: "d10", weaponName: "Kousnutí", armor: 1, crit: "Drží a nedá se setřást" },
];

// ─── Helpers ────────────────────────────────────────────────────
function roll(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollWeapon(die) {
  const n = parseInt(die.replace("d", ""));
  return roll(n);
}

function resolveDamage(dmg, armor, targetBo, targetStr) {
  const totalDmg = Math.max(0, dmg - armor);
  let bo = targetBo;
  let str = targetStr;
  let strSave = null;
  let strSaveResult = null;
  let dead = false;
  let wounded = false;

  if (totalDmg <= 0) return { totalDmg: 0, boBefore: bo, boAfter: bo, strBefore: str, strAfter: str, strSave, strSaveResult, dead, wounded };

  const boBefore = bo;
  const strBefore = str;

  if (bo > 0) {
    const boDmg = Math.min(bo, totalDmg);
    bo -= boDmg;
    const overflow = totalDmg - boDmg;
    if (overflow > 0) {
      str -= overflow;
      if (str <= 0) {
        str = 0;
        dead = true;
      } else {
        strSave = roll(20);
        strSaveResult = strSave <= str;
        if (!strSaveResult) wounded = true;
      }
    }
  } else {
    str -= totalDmg;
    if (str <= 0) {
      str = 0;
      dead = true;
    } else {
      strSave = roll(20);
      strSaveResult = strSave <= str;
      if (!strSaveResult) wounded = true;
    }
  }

  return { totalDmg, boBefore, boAfter: bo, strBefore, strAfter: str, strSave, strSaveResult, dead, wounded };
}

function rollInitiative(playerDex) {
  const d20 = roll(20);
  return { d20, playerFirst: d20 <= playerDex };
}

function rollMorale(wil) {
  const d20 = roll(20);
  return { d20, stays: d20 <= wil };
}

function checkFate(oddsIndex, cf) {
  const d100 = roll(100);
  const threshold = FATE_CHART[oddsIndex][cf - 1];
  const yes = d100 <= threshold;
  const excThresh = Math.floor(threshold / 5);
  const excNoThresh = 100 - Math.floor((100 - threshold) / 5);
  const exceptional = yes ? d100 <= excThresh : d100 >= excNoThresh;
  // Random event: doubles AND digit <= CF
  const d1 = Math.floor(d100 / 10) || 10;
  const d2 = d100 % 10 || 10;
  const isDoubles = d100 === 100 || (d100 < 100 && Math.floor((d100 - 1) / 10) === ((d100 - 1) % 10));
  // simpler: check tens==units for 11,22,...,99; 100 counts as 00
  const tensDigit = d100 === 100 ? 0 : Math.floor(d100 / 10);
  const unitsDigit = d100 === 100 ? 0 : d100 % 10;
  const doubles = tensDigit === unitsDigit;
  const randomEvent = doubles && tensDigit <= cf;
  return { d100, yes, exceptional, randomEvent, threshold };
}

function getEventFocus() {
  const d = roll(100);
  for (const [max, label] of EVENT_FOCUS) {
    if (d <= max) return label;
  }
  return "NPC Positive";
}

function checkScene(cf) {
  const d10 = roll(10);
  if (d10 > cf) return { d10, type: "expected" };
  if (d10 % 2 === 0) {
    // Interrupt — generate event
    const focus = getEventFocus();
    const m = rollMeaning("actions");
    return { d10, type: "interrupt", focus, meaning: m };
  }
  // Altered
  const adjRoll = roll(10);
  const adj = SCENE_ADJ[adjRoll - 1];
  return { d10, type: "altered", adjRoll, adj };
}

function rollMeaning(table) {
  const d1 = roll(100);
  const d2 = roll(100);
  const list = table === "descriptions" ? DESCRIPTIONS : ACTIONS;
  return { d1, d2, word1: list[d1 - 1], word2: DESCRIPTIONS[d2 - 1] };
}

// ─── Inline bloky ───────────────────────────────────────────────
function FateBlock({ entry }) {
  const color = entry.yes ? C.green : C.red;
  const label = entry.exceptional
    ? (entry.yes ? "EXCEPTIONAL ANO" : "EXCEPTIONAL NE")
    : (entry.yes ? "ANO" : "NE");
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: color + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.muted, display: "flex", gap: 6, flexWrap: "wrap" }}>
      <span>❓</span>
      <span>{entry.question}</span>
      <span>·</span>
      <span>{entry.oddsLabel}</span>
      <span>·</span>
      <span>d100={entry.d100}</span>
      <span style={{ marginLeft: "auto", color, fontWeight: 700 }}>→ {label}</span>
      {entry.randomEvent && <span style={{ color: C.yellow, fontSize: 10 }}>⚡ {entry.eventFocus || "Random Event"}{entry.eventMeaning ? ` · ${entry.eventMeaning.word1} + ${entry.eventMeaning.word2}` : ""}</span>}
    </div>
  );
}

function MeaningBlock({ entry }) {
  return (
    <div style={{ borderLeft: `3px solid ${C.purple}`, background: C.purple + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.purple, display: "flex", gap: 6 }}>
      <span>🔮</span>
      <span style={{ fontWeight: 600 }}>{entry.word1} + {entry.word2}</span>
    </div>
  );
}

function SceneBlock({ entry }) {
  const typeLabel = entry.sceneType === "expected" ? "Očekávaná"
    : entry.sceneType === "altered" ? "Pozměněná"
    : "Přerušená";
  const typeColor = entry.sceneType === "expected" ? C.blue
    : entry.sceneType === "altered" ? C.yellow
    : C.red;
  return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ height: 1, background: C.blue + "55" }} />
      <div style={{ borderLeft: `3px solid ${C.blue}`, background: C.blue + "12", padding: "6px 10px", margin: "2px 0" }}>
        <div style={{ fontSize: 9, color: C.blue, fontWeight: 700, letterSpacing: 1 }}>🎬 SCÉNA {entry.sceneNum}</div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{entry.title || "Nová scéna"}</div>
        <div style={{ fontSize: 9, color: typeColor, fontWeight: 600 }}>{typeLabel} · CF {entry.cf}</div>
      </div>
      <div style={{ height: 1, background: C.blue + "55" }} />
    </div>
  );
}

function TextBlock({ entry }) {
  return <p style={{ margin: "10px 0" }}>{entry.text}</p>;
}

function CombatBlock({ entry }) {
  const resultColor = entry.result === "victory" ? C.green : entry.result === "fled" ? C.yellow : C.red;
  const resultLabel = entry.result === "victory" ? "VÍTĚZSTVÍ" : entry.result === "fled" ? "NEPŘÍTEL UTEKL" : entry.result === "wounded" ? "PORANĚNÍ" : "SMRT";
  return (
    <div style={{ borderLeft: `3px solid ${C.red}`, background: C.red + "12", borderRadius: "0 4px 4px 0", padding: "6px 10px", margin: "6px 0", fontSize: 10, fontFamily: FONT }}>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>⚔️ Boj: {entry.enemyName} (STR {entry.enemyStr}, BO {entry.enemyBo}, {entry.enemyWeapon})</div>
      <div style={{ color: C.muted, marginBottom: 2 }}>Iniciativa: {entry.initiativeText}</div>
      {entry.log.map((line, i) => (
        <div key={i} style={{ color: C.muted }}>{line}</div>
      ))}
      <div style={{ fontWeight: 700, color: resultColor, marginTop: 4 }}>→ {resultLabel}</div>
    </div>
  );
}

// ─── Editor ─────────────────────────────────────────────────────
function EditorArea({ entries }) {
  return (
    <div style={{ padding: "14px 16px", fontFamily: FONT, fontSize: 13, lineHeight: 1.7, color: C.text, overflowY: "auto", height: "100%" }}>
      {entries.map((e, i) => {
        if (e.type === "text") return <TextBlock key={i} entry={e} />;
        if (e.type === "fate") return <FateBlock key={i} entry={e} />;
        if (e.type === "meaning") return <MeaningBlock key={i} entry={e} />;
        if (e.type === "scene") return <SceneBlock key={i} entry={e} />;
        if (e.type === "combat") return <CombatBlock key={i} entry={e} />;
        return null;
      })}
      {/* Kurzor */}
      <span style={{ display: "inline-block", width: 2, height: 14, background: C.green, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────
function Header({ onToggle, expanded, cf, sceneNum, character }) {
  const ch = character;
  return (
    <div onClick={onToggle} style={{ padding: "9px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", flexShrink: 0, fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>
          <span style={{ color: C.blue, fontWeight: 700 }}>Scéna {sceneNum}</span>
          <span style={{ color: C.border }}> · </span>
          <span style={{ color: C.text }}>CF <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span></span>
        </span>
        <span style={{ color: C.muted }}>
          Den 2 · ráno{expanded && <span> · <span style={{ color: C.blue }}>Zataženo</span></span>}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 6, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><span style={{ color: C.green }}>STR</span> {ch.str.akt}/{ch.str.max}  <span style={{ color: C.green }}>DEX</span> {ch.dex.akt}/{ch.dex.max}  <span style={{ color: C.green }}>WIL</span> {ch.wil.akt}/{ch.wil.max}</span>
            <span><span style={{ color: C.red }}>BO</span> {ch.bo.akt}/{ch.bo.max}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Ďobky: <span style={{ color: C.yellow }}>{ch.dobky}</span></span>
            <span>Úr. {ch.uroven}  ZK {ch.zk}/{ch.uroven * 6}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Plný toolbar (Stav A) ────────────────────────────────────────
function ActionToolbar({ onFateOpen, onSceneOpen, onMeaningOpen, onEndSceneOpen, onCombatOpen, onNoteOpen }) {
  return (
    <div style={{ padding: "6px 12px 5px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, fontFamily: FONT }}>
      <div style={{ fontSize: 8, color: C.border, letterSpacing: 0.8, marginBottom: 4, textTransform: "uppercase" }}>Vložit:</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { icon: "🎬", label: "Scéna", fn: onSceneOpen },
          { icon: "❓", label: "Fate", fn: onFateOpen, accent: true },
          { icon: "🔮", fn: onMeaningOpen },
          { icon: "⚔️", fn: onCombatOpen },
          { icon: "📝", fn: onNoteOpen },
          { icon: "⋯", fn: onEndSceneOpen },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} style={{
            flex: b.label ? "1 1 auto" : "0 0 34px",
            height: 34,
            background: b.accent ? C.green : "transparent",
            color: b.accent ? "white" : C.text,
            border: `1px solid ${b.accent ? C.green : C.border}`,
            borderRadius: 6,
            fontSize: b.label ? 11 : 15,
            fontFamily: FONT,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            fontWeight: b.accent ? 700 : 400,
          }}>
            {b.icon}{b.label && <span>{b.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Mini toolbar (Stav B — nad klávesnicí) ───────────────────────
function MiniToolbar() {
  return (
    <div style={{ display: "flex", gap: 3, padding: "3px 8px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, fontFamily: FONT }}>
      {["🎬","❓","🔮","⚔️","📝","📕","🎲","⋯"].map((ic, i) => (
        <button key={i} style={{
          flex: 1, height: 26, fontSize: 13,
          background: i === 1 ? C.green : "transparent",
          border: i === 1 ? "none" : `1px solid ${C.border}`,
          borderRadius: 4, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{ic}</button>
      ))}
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────
function BottomNav({ active, onChange }) {
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, height: 54, fontFamily: FONT }}>
      {[["📖","Deník","diary"],["🐭","Postava","char"],["🗺️","Svět","world"]].map(([ic, label, id]) => (
        <div key={id} onClick={() => onChange(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", position: "relative" }}>
          {active === id && <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: C.green, borderRadius: "0 0 2px 2px" }} />}
          <span style={{ fontSize: 18 }}>{ic}</span>
          <span style={{ fontSize: 9, color: active === id ? C.text : C.muted, fontWeight: active === id ? 700 : 400 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Bottom Sheet — základ ────────────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.bg, borderRadius: "12px 12px 0 0", maxHeight: "45%", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp .25s ease both" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2 }} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 1, color: C.muted, textAlign: "center", marginBottom: 10, flexShrink: 0 }}>{title}</div>
        <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Fate Q Sheet ─────────────────────────────────────────────────
function FateSheet({ onClose, cf, onInsert }) {
  const [step, setStep] = useState("input");
  const [odds, setOdds] = useState(5);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const oddsLabels = ["Impossible","No way","V.unlikely","Unlikely","50/50","Likely","V.likely","Near sure","Sure thing","Has to be"];

  const doRoll = () => {
    const r = checkFate(odds, cf);
    let eventData = null;
    if (r.randomEvent) {
      const focus = getEventFocus();
      const meaning = rollMeaning("actions");
      eventData = { focus, meaning };
    }
    setResult({ ...r, question: question || "?", oddsLabel: oddsLabels[odds], eventData });
    setStep("result");
  };

  const doInsert = () => {
    const entry = {
      type: "fate",
      question: result.question,
      oddsLabel: result.oddsLabel,
      d100: result.d100,
      yes: result.yes,
      exceptional: result.exceptional,
      randomEvent: result.randomEvent,
    };
    if (result.eventData) {
      entry.eventFocus = result.eventData.focus;
      entry.eventMeaning = result.eventData.meaning;
    }
    onInsert(entry);
    onClose();
  };

  return (
    <Sheet title="❓ FATE QUESTION" onClose={onClose}>
      {step === "input" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>OTÁZKA:</div>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Je tu stráž?"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 12, background: "white", fontFamily: FONT, outline: "none", color: C.text }}
          />
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>ODDS:</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
            {oddsLabels.map((o, i) => (
              <button key={i} onClick={() => setOdds(i)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 20, border: `1px solid ${i === odds ? C.green : C.border}`, background: i === odds ? C.green : "transparent", color: i === odds ? "white" : C.muted, fontSize: 10, fontFamily: FONT, cursor: "pointer", whiteSpace: "nowrap" }}>{o}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>CF: <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span></div>
          <button onClick={doRoll} style={{ width: "100%", height: 46, background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: "pointer", letterSpacing: 1 }}>🎲  HODIT</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>
            {result.question} · {result.oddsLabel} · CF {cf}<br />
            <span style={{ fontWeight: 700, color: C.text }}>d100 = {result.d100}</span>
            <span style={{ color: C.muted }}> (threshold {result.threshold})</span>
          </div>
          <div style={{ background: (result.yes ? C.green : C.red) + "20", border: `2px solid ${result.yes ? C.green : C.red}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: result.yes ? C.green : C.red, letterSpacing: 3, fontFamily: FONT }}>
              {result.exceptional ? (result.yes ? "E X C.  A N O" : "E X C.  N E") : (result.yes ? "A N O" : "N E")}
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: result.randomEvent ? 8 : 12, fontFamily: FONT }}>
            Exceptional: {result.exceptional ? "ano" : "ne"}  ·  Random Event: {result.randomEvent ? "ano ⚡" : "ne"}
          </div>
          {result.eventData && (
            <div style={{ background: C.yellow + "18", border: `1px solid ${C.yellow}`, borderRadius: 8, padding: "8px 10px", marginBottom: 12, fontFamily: FONT }}>
              <div style={{ fontSize: 9, color: C.yellow, fontWeight: 700, marginBottom: 4 }}>⚡ RANDOM EVENT</div>
              <div style={{ fontSize: 11, color: C.text, marginBottom: 2 }}>Focus: <span style={{ fontWeight: 600 }}>{result.eventData.focus}</span></div>
              <div style={{ fontSize: 11, color: C.purple }}>Meaning: <span style={{ fontWeight: 600 }}>{result.eventData.meaning.word1} + {result.eventData.meaning.word2}</span></div>
            </div>
          )}
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      )}
    </Sheet>
  );
}

// ─── Scéna Sheet ──────────────────────────────────────────────────
function SceneSheet({ onClose, cf, sceneNum, onInsert }) {
  const [step, setStep] = useState("input");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);

  const doTest = () => {
    const r = checkScene(cf);
    setResult(r);
    setStep("result");
  };

  const doInsert = () => {
    onInsert({
      type: "scene",
      sceneNum: sceneNum + 1,
      title: title || "Nová scéna",
      sceneType: result.type,
      cf,
      d10: result.d10,
      adj: result.adj,
      focus: result.focus,
      meaning: result.meaning,
    });
    onClose();
  };

  const typeLabel = result?.type === "expected" ? "OČEKÁVANÁ"
    : result?.type === "altered" ? "POZMĚNĚNÁ!"
    : "PŘERUŠENÁ!";
  const typeColor = result?.type === "expected" ? C.blue
    : result?.type === "altered" ? C.yellow
    : C.red;

  return (
    <Sheet title="🎬 NOVÁ SCÉNA" onClose={onClose}>
      {step === "input" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, fontFamily: FONT }}>CO OČEKÁVÁŠ?</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ada projde jeskyní bez boje…"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 12, background: "white", fontFamily: FONT, outline: "none", color: C.text }}
          />
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>CF: <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span>  ·  Test: d10 vs CF</div>
          <button onClick={doTest} style={{ width: "100%", height: 46, background: C.blue, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>TESTOVAT CHAOS</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>
            d10 = {result.d10}  ({result.d10} {result.d10 <= cf ? "≤" : ">"} {cf} = {result.d10 <= cf ? "pod CF" : "nad CF"}{result.d10 <= cf ? (result.d10 % 2 === 0 ? ", sudý" : ", lichý") : ""})
          </div>
          <div style={{ background: typeColor + "20", border: `2px solid ${typeColor}`, borderRadius: 8, padding: "10px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: typeColor, letterSpacing: 2, fontFamily: FONT }}>{typeLabel}</div>
          </div>
          {result.type === "altered" && (
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, fontFamily: FONT, lineHeight: 1.6 }}>
              Scene Adjustment d10={result.adjRoll}: <span style={{ color: C.text, fontWeight: 600 }}>{result.adj}</span>
            </div>
          )}
          {result.type === "interrupt" && (
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, fontFamily: FONT, lineHeight: 1.6 }}>
              Event Focus: <span style={{ color: C.text, fontWeight: 600 }}>{result.focus}</span><br />
              Meaning: <span style={{ color: C.purple, fontWeight: 600 }}>{result.meaning.word1} + {result.meaning.word2}</span>
            </div>
          )}
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.blue, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT SCÉNU</button>
        </>
      )}
    </Sheet>
  );
}

// ─── Meaning Sheet ────────────────────────────────────────────────
function MeaningSheet({ onClose, onInsert }) {
  const [result, setResult] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const doSelect = (t) => {
    setSelectedType(t);
    const table = t === "Descriptions" ? "descriptions" : "actions";
    setResult(rollMeaning(table));
  };

  const doInsert = () => {
    onInsert({
      type: "meaning",
      word1: result.word1,
      word2: result.word2,
      d1: result.d1,
      d2: result.d2,
      table: selectedType,
    });
    onClose();
  };

  return (
    <Sheet title="🔮 MEANING TABLES" onClose={onClose}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["Actions","Descriptions"].map((t, i) => (
          <button key={i} onClick={() => doSelect(t)} style={{ flex: 1, padding: "6px 0", border: `1px solid ${selectedType === t ? C.purple : C.border}`, background: selectedType === t ? C.purple : "transparent", color: selectedType === t ? "white" : C.muted, borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      {result ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>d100 = {result.d1}, d100 = {result.d2}</div>
          <div style={{ background: C.purple + "20", border: `2px solid ${C.purple}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.purple, fontFamily: FONT }}>{result.word1} + {result.word2}</div>
          </div>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>Interpretuj v kontextu scény</div>
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.purple, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>Vyber typ tabulky ↑</div>
      )}
    </Sheet>
  );
}

// ─── Konec Scény Sheet ────────────────────────────────────────────
function EndSceneSheet({ onClose, cf, sceneNum, onCFChange, npcs, threads, onNpcsChange, onThreadsChange }) {
  const [choice, setChoice] = useState(null);
  const [newNpc, setNewNpc] = useState("");
  const [newThread, setNewThread] = useState("");

  const addNpc = () => {
    const name = newNpc.trim();
    if (!name) return;
    const existing = npcs.findIndex(n => n.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0) {
      if (npcs[existing].weight >= 3) { setNewNpc(""); return; }
      onNpcsChange(npcs.map((n, i) => i === existing ? { ...n, weight: Math.min(3, n.weight + 1) } : n));
    } else {
      if (npcs.length >= 25) return;
      onNpcsChange([...npcs, { name, weight: 1, flag: false }]);
    }
    setNewNpc("");
  };

  const addThread = () => {
    const name = newThread.trim();
    if (!name) return;
    const existing = threads.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0) {
      if (threads[existing].weight >= 3) { setNewThread(""); return; }
      onThreadsChange(threads.map((t, i) => i === existing ? { ...t, weight: Math.min(3, t.weight + 1) } : t));
    } else {
      if (threads.length >= 25) return;
      onThreadsChange([...threads, { name, weight: 1, progress: 0, total: 10 }]);
    }
    setNewThread("");
  };

  const changeNpcWeight = (idx, delta) => {
    onNpcsChange(npcs.map((n, i) => i === idx ? { ...n, weight: Math.max(1, Math.min(3, n.weight + delta)) } : n));
  };

  const changeThreadWeight = (idx, delta) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, weight: Math.max(1, Math.min(3, t.weight + delta)) } : t));
  };

  const addProgress = (idx) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, progress: Math.min(t.total, t.progress + 2) } : t));
  };

  const doEnd = () => {
    if (choice === "minus") onCFChange(Math.max(1, cf - 1));
    if (choice === "plus") onCFChange(Math.min(9, cf + 1));
    onClose();
  };

  const listItemStyle = { display: "flex", alignItems: "center", gap: 4, marginBottom: 4, padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontFamily: FONT };
  const addRowStyle = { display: "flex", gap: 4, marginBottom: 10 };
  const addInputStyle = { flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" };
  const addBtnStyle = { padding: "5px 10px", border: `1px solid ${C.green}`, background: C.green, color: "white", borderRadius: 4, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: 700 };
  const delBtnStyle = { background: "none", border: "none", color: C.red, fontSize: 13, cursor: "pointer", padding: "0 2px", lineHeight: 1 };
  const weightBtnStyle = { background: "none", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 10, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.text };
  const progressBtnStyle = { background: C.purple + "22", border: `1px solid ${C.purple}`, borderRadius: 4, fontSize: 9, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.purple, fontWeight: 700 };

  return (
    <Sheet title={`📕 KONEC SCÉNY ${sceneNum}`} onClose={onClose}>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 8, fontFamily: FONT }}>MĚLA POSTAVA KONTROLU?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setChoice("minus")} style={{ flex: 1, padding: "10px 0", border: `1px solid ${choice==="minus" ? C.green : C.border}`, background: choice==="minus" ? C.green + "22" : "transparent", borderRadius: 8, fontSize: 11, fontFamily: FONT, cursor: "pointer", color: C.green, fontWeight: choice==="minus" ? 700 : 400 }}>ANO → CF−1<br /><span style={{ fontSize: 10 }}>{cf} → {Math.max(1, cf - 1)}</span></button>
        <button onClick={() => setChoice("plus")} style={{ flex: 1, padding: "10px 0", border: `1px solid ${choice==="plus" ? C.red : C.border}`, background: choice==="plus" ? C.red + "22" : "transparent", borderRadius: 8, fontSize: 11, fontFamily: FONT, cursor: "pointer", color: C.red, fontWeight: choice==="plus" ? 700 : 400 }}>NE → CF+1<br /><span style={{ fontSize: 10 }}>{cf} → {Math.min(9, cf + 1)}</span></button>
      </div>

      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT }}>── NPC ({npcs.length}/25) ──</div>
      {npcs.map((n, i) => (
        <div key={i} style={listItemStyle}>
          <span style={{ flex: 1 }}>{n.name}</span>
          <button onClick={() => changeNpcWeight(i, -1)} style={weightBtnStyle}>−</button>
          <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{n.weight}×</span>
          <button onClick={() => changeNpcWeight(i, 1)} style={weightBtnStyle}>+</button>
          <button onClick={() => onNpcsChange(npcs.filter((_, j) => j !== i))} style={delBtnStyle}>✕</button>
        </div>
      ))}
      <div style={addRowStyle}>
        <input value={newNpc} onChange={e => setNewNpc(e.target.value)} onKeyDown={e => e.key === "Enter" && addNpc()} placeholder="Nový NPC..." style={addInputStyle} />
        <button onClick={addNpc} style={addBtnStyle}>+ NPC</button>
      </div>

      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT }}>── THREADY ({threads.length}/25) ──</div>
      {threads.map((t, i) => (
        <div key={i} style={listItemStyle}>
          <span style={{ flex: 1 }}>{t.name}</span>
          <span style={{ fontSize: 9, color: C.purple }}>{t.progress}/{t.total}</span>
          <button onClick={() => addProgress(i)} style={progressBtnStyle}>+2</button>
          <button onClick={() => changeThreadWeight(i, -1)} style={weightBtnStyle}>−</button>
          <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{t.weight}×</span>
          <button onClick={() => changeThreadWeight(i, 1)} style={weightBtnStyle}>+</button>
          <button onClick={() => onThreadsChange(threads.filter((_, j) => j !== i))} style={delBtnStyle}>✕</button>
        </div>
      ))}
      <div style={addRowStyle}>
        <input value={newThread} onChange={e => setNewThread(e.target.value)} onKeyDown={e => e.key === "Enter" && addThread()} placeholder="Nový Thread..." style={addInputStyle} />
        <button onClick={addThread} style={addBtnStyle}>+ Thread</button>
      </div>

      <button onClick={doEnd} style={{ width: "100%", height: 46, background: C.text, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>UKONČIT SCÉNU</button>
    </Sheet>
  );
}

// ─── Boj Sheet ────────────────────────────────────────────────────
function CombatSheet({ onClose, onInsert, character, onCharUpdate }) {
  const [step, setStep] = useState("setup");
  const [source, setSource] = useState("bestiary"); // "bestiary" | "custom"
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [custom, setCustom] = useState({ name: "", str: 8, dex: 8, wil: 8, bo: 3, weapon: "d6", armor: 0, weaponName: "Útok" });
  const [playerWeapon, setPlayerWeapon] = useState("d6");
  const [playerArmor, setPlayerArmor] = useState(0);
  const [playerDex, setPlayerDex] = useState(character.dex.akt);
  const [combatResult, setCombatResult] = useState(null);

  const enemy = source === "bestiary" ? BESTIARY[selectedIdx] : { ...custom, str: Number(custom.str), dex: Number(custom.dex), wil: Number(custom.wil), bo: Number(custom.bo), armor: Number(custom.armor) };

  const doFight = () => {
    const init = rollInitiative(playerDex);
    const log = [];
    let pBo = character.bo.akt, pStr = character.str.akt;
    let eBo = enemy.bo, eStr = enemy.str, eWil = enemy.wil;
    let result = null;
    let moraleChecked = false;
    let firstStrDmg = false;

    const initText = init.playerFirst
      ? `Myši první (DEX ${playerDex}, d20=${init.d20})`
      : `Nepřítel první (DEX ${playerDex}, d20=${init.d20})`;

    for (let round = 1; round <= 20; round++) {
      const attackOrder = init.playerFirst ? ["player", "enemy"] : ["enemy", "player"];

      for (const attacker of attackOrder) {
        if (result) break;

        if (attacker === "player") {
          const dmgRoll = rollWeapon(playerWeapon);
          const res = resolveDamage(dmgRoll, enemy.armor, eBo, eStr);
          eBo = res.boAfter;
          eStr = res.strAfter;
          let line = `K${round}: Hráč ${playerWeapon}=${dmgRoll}`;
          if (enemy.armor > 0) line += `-${enemy.armor}zbroj`;
          line += ` → ${res.totalDmg} dmg`;
          if (res.totalDmg > 0) {
            if (res.boBefore > 0 && res.boAfter === 0 && res.strAfter < res.strBefore) {
              line += ` → BO ${res.boBefore}→0, STR ${res.strBefore}→${res.strAfter}`;
            } else if (res.boBefore > 0) {
              line += ` → BO ${res.boBefore}→${res.boAfter}`;
            } else {
              line += ` → STR ${res.strBefore}→${res.strAfter}`;
            }
          }
          if (res.dead) {
            line += " → mrtvý";
            log.push(line);
            result = "victory";
            break;
          }
          if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) {
              line += " → Poranění!";
              log.push(line);
              result = "victory";
              break;
            }
          }
          log.push(line);
          // Morale check on first STR damage
          if (!moraleChecked && res.strAfter < res.strBefore) {
            firstStrDmg = true;
            const mor = rollMorale(eWil);
            const morLine = `  Morálka: WIL ${eWil}, d20=${mor.d20} → ${mor.stays ? "zůstává" : "UTÍKÁ!"}`;
            log.push(morLine);
            moraleChecked = true;
            if (!mor.stays) {
              result = "fled";
              break;
            }
          }
        } else {
          const dmgRoll = rollWeapon(enemy.weapon);
          const res = resolveDamage(dmgRoll, playerArmor, pBo, pStr);
          pBo = res.boAfter;
          pStr = res.strAfter;
          let line = `K${round}: ${enemy.name} ${enemy.weapon}=${dmgRoll}`;
          if (playerArmor > 0) line += `-${playerArmor}zbroj`;
          line += ` → ${res.totalDmg} dmg`;
          if (res.totalDmg > 0) {
            if (res.boBefore > 0 && res.boAfter === 0 && res.strAfter < res.strBefore) {
              line += ` → BO ${res.boBefore}→0, STR ${res.strBefore}→${res.strAfter}`;
            } else if (res.boBefore > 0) {
              line += ` → BO ${res.boBefore}→${res.boAfter}`;
            } else {
              line += ` → STR ${res.strBefore}→${res.strAfter}`;
            }
          }
          if (res.dead) {
            line += " → SMRT!";
            log.push(line);
            result = "death";
            break;
          }
          if (res.strSave !== null) {
            line += ` → STR save d20=${res.strSave} ${res.strSaveResult ? "OK" : "FAIL"}`;
            if (res.wounded) {
              line += " → Poranění!";
              log.push(line);
              result = "wounded";
              break;
            }
          }
          log.push(line);
        }
      }
      if (result) break;
    }
    if (!result) result = "victory"; // 20 rounds exhausted

    setCombatResult({ log, result, initText, enemy: { ...enemy }, playerWeapon, playerBoAfter: pBo, playerStrAfter: pStr });
    setStep("result");
  };

  const doInsert = () => {
    // Update character stats after combat
    if (onCharUpdate) {
      onCharUpdate({
        ...character,
        bo: { ...character.bo, akt: combatResult.playerBoAfter },
        str: { ...character.str, akt: combatResult.playerStrAfter },
      });
    }
    onInsert({
      type: "combat",
      enemyName: combatResult.enemy.name,
      enemyStr: combatResult.enemy.str,
      enemyBo: combatResult.enemy.bo,
      enemyWeapon: combatResult.enemy.weapon,
      initiativeText: combatResult.initText,
      log: combatResult.log,
      result: combatResult.result,
    });
    onClose();
  };

  const resultColor = combatResult?.result === "victory" ? C.green : combatResult?.result === "fled" ? C.yellow : C.red;
  const resultLabel = combatResult?.result === "victory" ? "VÍTĚZSTVÍ" : combatResult?.result === "fled" ? "NEPŘÍTEL UTEKL" : combatResult?.result === "wounded" ? "PORANĚNÍ" : "SMRT";
  const dieCostky = ["d4", "d6", "d8", "d10", "d12"];

  const inputStyle = { width: 50, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 11, fontFamily: FONT, textAlign: "center", background: "white", color: C.text, outline: "none" };

  return (
    <Sheet title="⚔️ BOJ" onClose={onClose}>
      {step === "setup" ? (
        <>
          {/* Source toggle */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {[["bestiary", "Bestiář"], ["custom", "Vlastní"]].map(([val, label]) => (
              <button key={val} onClick={() => setSource(val)} style={{ flex: 1, padding: "5px 0", border: `1px solid ${source === val ? C.red : C.border}`, background: source === val ? C.red + "22" : "transparent", borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: source === val ? 700 : 400, color: source === val ? C.red : C.muted }}>{label}</button>
            ))}
          </div>

          {source === "bestiary" ? (
            <div style={{ marginBottom: 12 }}>
              <select value={selectedIdx} onChange={e => setSelectedIdx(Number(e.target.value))} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: FONT, background: "white", color: C.text, outline: "none", marginBottom: 6 }}>
                {BESTIARY.map((b, i) => (
                  <option key={i} value={i}>{b.name}</option>
                ))}
              </select>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, padding: "0 2px" }}>
                STR {enemy.str} · DEX {enemy.dex} · WIL {enemy.wil} · BO {enemy.bo} · {enemy.weaponName} {enemy.weapon} · Zbroj {enemy.armor}
                {enemy.crit && <span style={{ color: C.red }}> · Krit: {enemy.crit}</span>}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <input value={custom.name} onChange={e => setCustom(c => ({ ...c, name: e.target.value }))} placeholder="Název nepřítele" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" }} />
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {[["str", "STR"], ["dex", "DEX"], ["wil", "WIL"], ["bo", "BO"]].map(([key, label]) => (
                  <label key={key} style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
                    {label}
                    <input type="number" value={custom[key]} onChange={e => setCustom(c => ({ ...c, [key]: e.target.value }))} style={inputStyle} />
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
                  Zbraň
                  <select value={custom.weapon} onChange={e => setCustom(c => ({ ...c, weapon: e.target.value }))} style={{ ...inputStyle, width: 60 }}>
                    {dieCostky.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
                  Zbroj
                  <select value={custom.armor} onChange={e => setCustom(c => ({ ...c, armor: e.target.value }))} style={{ ...inputStyle, width: 50 }}>
                    {[0, 1, 2, 3].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Player stats */}
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT, letterSpacing: 0.8 }}>HRÁČ:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              DEX
              <input type="number" value={playerDex} onChange={e => setPlayerDex(Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              Zbraň
              <select value={playerWeapon} onChange={e => setPlayerWeapon(e.target.value)} style={{ ...inputStyle, width: 60 }}>
                {dieCostky.map(d => <option key={d} value={d}>{d === "d4" ? "d4 (zeslab.)" : d === "d12" ? "d12 (zesíl.)" : d}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 10, color: C.muted, fontFamily: FONT, display: "flex", alignItems: "center", gap: 3 }}>
              Zbroj
              <select value={playerArmor} onChange={e => setPlayerArmor(Number(e.target.value))} style={{ ...inputStyle, width: 50 }}>
                {[0, 1, 2, 3].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>

          <button onClick={doFight} style={{ width: "100%", height: 46, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>⚔️  BOJOVAT</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>
            {combatResult.enemy.name} · STR {combatResult.enemy.str} · BO {combatResult.enemy.bo} · {combatResult.enemy.weapon}<br />
            Iniciativa: {combatResult.initText}
          </div>
          {/* Combat log */}
          <div style={{ background: resultColor + "15", border: `2px solid ${resultColor}`, borderRadius: 8, padding: "10px", marginBottom: 10, fontFamily: FONT, fontSize: 10, maxHeight: 160, overflowY: "auto" }}>
            {combatResult.log.map((line, i) => (
              <div key={i} style={{ color: C.text, marginBottom: 2 }}>{line}</div>
            ))}
            <div style={{ fontWeight: 700, color: resultColor, marginTop: 6, fontSize: 12 }}>
              {combatResult.result === "victory" ? "🏆" : combatResult.result === "fled" ? "💨" : "💀"} {resultLabel}
            </div>
          </div>
          <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      )}
    </Sheet>
  );
}

// ─── Poznámka Sheet ──────────────────────────────────────────────
function NoteSheet({ onClose, onInsert }) {
  const [text, setText] = useState("");
  const doInsert = () => {
    if (!text.trim()) return;
    onInsert({ type: "text", text: text.trim() });
    onClose();
  };
  return (
    <Sheet title="📝 POZNÁMKA" onClose={onClose}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Co se děje ve scéně..."
        rows={4}
        style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: FONT, background: "white", color: C.text, outline: "none", resize: "vertical", marginBottom: 12 }}
      />
      <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.text, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
    </Sheet>
  );
}

// ─── Postava Tab ──────────────────────────────────────────────────
function PostavaTab({ character, onUpdate }) {
  const ch = character;
  const zkMax = ch.uroven * 6;
  const statInput = { border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 4px", fontSize: 11, fontFamily: FONT, textAlign: "center", width: 36, background: "white", color: C.text, outline: "none" };

  const setStat = (key, field, val) => {
    const v = Math.max(0, Number(val) || 0);
    onUpdate({ ...ch, [key]: { ...ch[key], [field]: v } });
  };

  const setField = (key, val) => onUpdate({ ...ch, [key]: val });

  return (
    <div style={{ padding: "14px 16px", overflowY: "auto", height: "100%", fontFamily: FONT }}>
      {/* Identita */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={ch.jmeno} onChange={e => setField("jmeno", e.target.value)} placeholder="Jméno postavy" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", fontSize: 13, fontWeight: 700, fontFamily: FONT, background: "white", color: C.text, outline: "none" }} />
          <span style={{ fontSize: 10, color: C.muted, alignSelf: "center", whiteSpace: "nowrap" }}>Úr. {ch.uroven}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={ch.puvod} onChange={e => setField("puvod", e.target.value)} placeholder="Původ (Kuchařka...)" style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.muted, outline: "none" }} />
          <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>ZK {ch.zk}/{zkMax}</span>
          <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>Ďobky</span>
          <input type="number" value={ch.dobky} onChange={e => setField("dobky", Math.max(0, Number(e.target.value) || 0))} style={{ ...statInput, width: 44, color: C.yellow, fontWeight: 700 }} />
        </div>
      </div>

      {/* Staty */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
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
      </div>

      {/* Inventář — placeholder */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, letterSpacing: 0.8 }}>INVENTÁŘ (10 slotů)</div>
        {[
          ["Packy","Nůž d6","Provaz"],
          ["Tělo","Kožená zbroj","—"],
          ["Batoh","Pochodně 3×","Jídlo"],
          ["","Léčivé bylinky","—"],
          ["","—","—"],
        ].map(([label, a, b], i) => (
          <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center" }}>
            <span style={{ width: 36, fontSize: 9, color: C.muted, flexShrink: 0 }}>{label}</span>
            {[a,b].map((item, j) => (
              <div key={j} style={{ flex: 1, padding: "4px 8px", border: `1px solid ${item==="—"?C.border:C.blue+"55"}`, borderRadius: 5, fontSize: 10, color: item==="—"?C.border:C.text, background: item==="—"?"transparent":C.blue+"08", textAlign: "center" }}>{item}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Pomocník — placeholder */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: 0.8 }}>POMOCNÍK</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>Hrách</span>
          <span style={{ fontSize: 10, color: C.muted }}>Mzda: 2ď/den</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>STR 4  BO 0  Dýka d6</div>
      </div>
    </div>
  );
}

// ─── Svět Tab ─────────────────────────────────────────────────────
function SvetTab({ cf, npcs, threads, onGoToLobby, onNpcsChange, onThreadsChange }) {
  const [sub, setSub] = useState("mythic");
  const [newNpc, setNewNpc] = useState("");
  const [newThread, setNewThread] = useState("");
  const subs = [["mythic","Mythic"],["npc","NPC"],["thready","Thready"],["mapa","Mapa"]];

  const addNpc = () => {
    const name = newNpc.trim();
    if (!name) return;
    const existing = npcs.findIndex(n => n.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0) {
      if (npcs[existing].weight >= 3) { setNewNpc(""); return; }
      onNpcsChange(npcs.map((n, i) => i === existing ? { ...n, weight: Math.min(3, n.weight + 1) } : n));
    } else {
      if (npcs.length >= 25) return;
      onNpcsChange([...npcs, { name, weight: 1, flag: false }]);
    }
    setNewNpc("");
  };

  const addThread = () => {
    const name = newThread.trim();
    if (!name) return;
    const existing = threads.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0) {
      if (threads[existing].weight >= 3) { setNewThread(""); return; }
      onThreadsChange(threads.map((t, i) => i === existing ? { ...t, weight: Math.min(3, t.weight + 1) } : t));
    } else {
      if (threads.length >= 25) return;
      onThreadsChange([...threads, { name, weight: 1, progress: 0, total: 10 }]);
    }
    setNewThread("");
  };

  const changeNpcWeight = (idx, delta) => {
    onNpcsChange(npcs.map((n, i) => i === idx ? { ...n, weight: Math.max(1, Math.min(3, n.weight + delta)) } : n));
  };

  const changeThreadWeight = (idx, delta) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, weight: Math.max(1, Math.min(3, t.weight + delta)) } : t));
  };

  const addProgress = (idx) => {
    onThreadsChange(threads.map((t, i) => i === idx ? { ...t, progress: Math.min(t.total, t.progress + 2) } : t));
  };

  const addInputStyle = { flex: 1, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 11, fontFamily: FONT, background: "white", color: C.text, outline: "none" };
  const addBtnStyle = { padding: "5px 10px", border: `1px solid ${C.green}`, background: C.green, color: "white", borderRadius: 4, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: 700 };
  const delBtnStyle = { background: "none", border: "none", color: C.red, fontSize: 13, cursor: "pointer", padding: "0 4px", lineHeight: 1 };
  const weightBtnStyle = { background: "none", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 10, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.text };
  const progressBtnStyle = { background: C.purple + "22", border: `1px solid ${C.purple}`, borderRadius: 4, fontSize: 9, cursor: "pointer", padding: "1px 5px", lineHeight: 1, fontFamily: FONT, color: C.purple, fontWeight: 700 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0, overflowX: "auto" }}>
        {subs.map(([id, label]) => (
          <div key={id} onClick={() => setSub(id)} style={{ padding: "8px 14px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", borderBottom: `2px solid ${sub===id?C.green:"transparent"}`, color: sub===id?C.text:C.muted, fontWeight: sub===id?700:400 }}>{label}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {sub === "mythic" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: C.muted }}>CF:</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.yellow }}>{cf}</span>
              <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${(cf / 9) * 100}%`, height: "100%", background: C.yellow, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 9, color: C.muted }}>1–9</span>
            </div>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>NPC SEZNAM ({npcs.length}/25)</div>
            {npcs.map((n, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, fontSize: 11 }}>
                <span>{n.name}</span>
                <span style={{ color: n.flag?C.red:C.muted }}>{n.weight}{n.flag&&" ⚠️"}</span>
              </div>
            ))}
            <div style={{ fontSize: 9, color: C.muted, margin: "12px 0 6px" }}>THREAD SEZNAM ({threads.length}/25)</div>
            {threads.map((t, i) => (
              <div key={i} style={{ padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span>{t.name}</span><span style={{ color: C.muted }}>{t.weight} · {t.progress}/{t.total}</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(t.progress / t.total) * 100}%`, height: "100%", background: C.purple }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <button onClick={onGoToLobby} style={{ width: "100%", padding: "8px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Správa her</button>
            </div>
          </>
        )}
        {sub === "npc" && (
          <>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>NPC SEZNAM ({npcs.length}/25)</div>
            {npcs.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 }}>
                <span style={{ flex: 1 }}>{n.name}</span>
                <button onClick={() => changeNpcWeight(i, -1)} style={weightBtnStyle}>−</button>
                <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{n.weight}×</span>
                <button onClick={() => changeNpcWeight(i, 1)} style={weightBtnStyle}>+</button>
                <button onClick={() => onNpcsChange(npcs.filter((_, j) => j !== i))} style={delBtnStyle}>✕</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <input value={newNpc} onChange={e => setNewNpc(e.target.value)} onKeyDown={e => e.key === "Enter" && addNpc()} placeholder="Nový NPC..." style={addInputStyle} />
              <button onClick={addNpc} style={addBtnStyle}>+ NPC</button>
            </div>
          </>
        )}
        {sub === "thready" && (
          <>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>THREAD SEZNAM ({threads.length}/25)</div>
            {threads.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 }}>
                <span style={{ flex: 1 }}>{t.name}</span>
                <span style={{ fontSize: 9, color: C.purple }}>{t.progress}/{t.total}</span>
                <button onClick={() => addProgress(i)} style={progressBtnStyle}>+2</button>
                <button onClick={() => changeThreadWeight(i, -1)} style={weightBtnStyle}>−</button>
                <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{t.weight}×</span>
                <button onClick={() => changeThreadWeight(i, 1)} style={weightBtnStyle}>+</button>
                <button onClick={() => onThreadsChange(threads.filter((_, j) => j !== i))} style={delBtnStyle}>✕</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <input value={newThread} onChange={e => setNewThread(e.target.value)} onKeyDown={e => e.key === "Enter" && addThread()} placeholder="Nový Thread..." style={addInputStyle} />
              <button onClick={addThread} style={addBtnStyle}>+ Thread</button>
            </div>
          </>
        )}
        {sub === "mapa" && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 40 }}>Hexcrawl mapa — placeholder</div>
        )}
      </div>
    </div>
  );
}

// ─── Game state + Multi-save localStorage ──────────────────────
const INDEX_KEY = "solorpg_index";
const SAVE_PREFIX = "solorpg_";
const CURRENT_VERSION = 3;

const INITIAL_GAME = {
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
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  // Migrate old single-key save
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

function saveIndex(index) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(index)); } catch { /* full */ }
}

function loadGameById(id) {
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

function saveGameById(id, game) {
  try { localStorage.setItem(SAVE_PREFIX + id, JSON.stringify(game)); } catch { /* full */ }
}

function deleteGameById(id) {
  try { localStorage.removeItem(SAVE_PREFIX + id); } catch { /* ignore */ }
}

function exportGame(id, name, game) {
  const data = JSON.stringify({ exportVersion: 1, name, game }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (name || "save").replace(/[^a-zA-Z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ ]/g, "-").replace(/\s+/g, "-").toLowerCase() + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "dnes";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "včera";
  return d.toLocaleDateString("cs");
}

// ─── Lobby ──────────────────────────────────────────────────────
function Lobby({ onPlay }) {
  const [index, setIndex] = useState(loadIndex);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleCreate = () => {
    const name = newName.trim() || ("Hra " + (index.saves.length + 1));
    const id = genId();
    const game = { ...INITIAL_GAME };
    saveGameById(id, game);
    const newIndex = {
      activeId: id,
      saves: [...index.saves, { id, name, lastPlayed: Date.now(), sceneNum: game.sceneNum, cf: game.cf }],
    };
    saveIndex(newIndex);
    setIndex(newIndex);
    setCreating(false);
    setNewName("");
    onPlay(id, game);
  };

  const handlePlay = (id) => {
    const game = loadGameById(id);
    const newIndex = { ...index, activeId: id };
    saveIndex(newIndex);
    setIndex(newIndex);
    onPlay(id, game);
  };

  const handleDelete = (id) => {
    deleteGameById(id);
    const newSaves = index.saves.filter(s => s.id !== id);
    const newIndex = { activeId: index.activeId === id ? null : index.activeId, saves: newSaves };
    saveIndex(newIndex);
    setIndex(newIndex);
    setConfirmDelete(null);
  };

  const handleExport = (id) => {
    const save = index.saves.find(s => s.id === id);
    const game = loadGameById(id);
    exportGame(id, save?.name, game);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!parsed.exportVersion || !parsed.game) throw new Error("bad format");
          const id = genId();
          const game = { ...INITIAL_GAME, ...parsed.game, version: CURRENT_VERSION };
          const name = parsed.name || ("Import " + (index.saves.length + 1));
          saveGameById(id, game);
          const newIndex = {
            ...index,
            saves: [...index.saves, { id, name, lastPlayed: Date.now(), sceneNum: game.sceneNum, cf: game.cf }],
          };
          saveIndex(newIndex);
          setIndex(newIndex);
          setImportError(null);
        } catch {
          setImportError("Neplatný soubor");
          setTimeout(() => setImportError(null), 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div style={{ width: "100%", height: "100dvh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: FONT, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 2px }
        ::-webkit-scrollbar-thumb { background: #ddd }
      `}</style>

      <div style={{ padding: "20px 16px 10px", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Solo RPG Companion</div>
        <div style={{ fontSize: 10, color: C.muted }}>Mythic GME 2e + Mausritter</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
        {index.saves.length === 0 && !creating && (
          <div style={{ textAlign: "center", marginTop: 60, color: C.muted, fontSize: 11 }}>Zatím žádné hry. Vytvoř novou!</div>
        )}

        {index.saves.map((s) => (
          <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{s.name}</span>
              <span style={{ fontSize: 9, color: C.muted }}>{formatDate(s.lastPlayed)}</span>
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>
              Scéna {s.sceneNum} · CF {s.cf}
            </div>
            {confirmDelete === s.id ? (
              <div>
                <div style={{ fontSize: 10, color: C.red, marginBottom: 6 }}>Opravdu smazat?</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Zrušit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.red}`, background: C.red + "22", borderRadius: 6, fontSize: 10, color: C.red, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>Smazat</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handlePlay(s.id)} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.green}`, background: C.green, borderRadius: 6, fontSize: 10, color: "white", fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>Hrát</button>
                <button onClick={() => handleExport(s.id)} style={{ padding: "7px 10px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Export</button>
                <button onClick={() => setConfirmDelete(s.id)} style={{ padding: "7px 10px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.red, fontFamily: FONT, cursor: "pointer" }}>Smazat</button>
              </div>
            )}
          </div>
        ))}

        {creating ? (
          <div style={{ border: `1px solid ${C.green}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>NÁZEV HRY:</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={"Hra " + (index.saves.length + 1)}
              autoFocus
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 10, background: "white", fontFamily: FONT, outline: "none", color: C.text }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { setCreating(false); setNewName(""); }} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Zrušit</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: "7px 0", border: `1px solid ${C.green}`, background: C.green, borderRadius: 6, fontSize: 10, color: "white", fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>Vytvořit</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} style={{ width: "100%", padding: "10px 0", border: `1px dashed ${C.green}`, background: "transparent", borderRadius: 8, fontSize: 11, color: C.green, fontWeight: 600, fontFamily: FONT, cursor: "pointer", marginBottom: 8 }}>+ Nová hra</button>
        )}

        <button onClick={handleImport} style={{ width: "100%", padding: "8px 0", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 6, fontSize: 10, color: C.muted, fontFamily: FONT, cursor: "pointer" }}>Importovat</button>
        {importError && <div style={{ fontSize: 10, color: C.red, textAlign: "center", marginTop: 6 }}>{importError}</div>}
      </div>
    </div>
  );
}

// ─── Hlavní App ───────────────────────────────────────────────────
export default function Prototype() {
  // Determine initial screen: if activeId exists, go straight to game
  const [initIndex] = useState(loadIndex);
  const [screen, setScreen] = useState(initIndex.activeId ? "game" : "lobby");
  const [activeId, setActiveId] = useState(initIndex.activeId);

  const [tab, setTab] = useState("diary");
  const [sheet, setSheet] = useState(null);
  const showKeyboard = false; // TODO: Visual Viewport API detekce
  const [headerExpanded, setHeaderExpanded] = useState(false);

  const [game, setGame] = useState(() => activeId ? loadGameById(activeId) : INITIAL_GAME);

  const updateGame = (patch) => setGame(g => ({ ...g, ...patch }));

  // Persist to localStorage on every change
  useEffect(() => {
    if (activeId && screen === "game") {
      saveGameById(activeId, game);
      // Update index metadata
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

      {/* Header — schová se při klávesnici */}
      {!showKeyboard && (
        <Header expanded={headerExpanded} onToggle={() => setHeaderExpanded(x => !x)} cf={game.cf} sceneNum={game.sceneNum} character={game.character} />
      )}

      {/* Editor / Postava / Svět */}
      <div style={{ flex: 1, overflow: "hidden", maxHeight: sheetOpen ? "calc(50% - 10px)" : undefined }}>
        {tab === "diary" && <EditorArea entries={game.entries} />}
        {tab === "char" && <PostavaTab character={game.character} onUpdate={(ch) => updateGame({ character: ch })} />}
        {tab === "world" && <SvetTab cf={game.cf} npcs={game.npcs} threads={game.threads} onGoToLobby={handleGoToLobby} onNpcsChange={(npcs) => updateGame({ npcs })} onThreadsChange={(threads) => updateGame({ threads })} />}
      </div>

      {/* Toolbar */}
      {tab === "diary" && (
        <ActionToolbar
          onFateOpen={() => setSheet("fate")}
          onSceneOpen={() => setSheet("scene")}
          onMeaningOpen={() => setSheet("meaning")}
          onEndSceneOpen={() => setSheet("endscene")}
          onCombatOpen={() => setSheet("combat")}
          onNoteOpen={() => setSheet("note")}
        />
      )}

      {/* Bottom nav */}
      <BottomNav active={tab} onChange={setTab} />

      {/* Sheets */}
      {sheet === "fate" && <FateSheet onClose={() => setSheet(null)} cf={game.cf} onInsert={handleInsert} />}
      {sheet === "scene" && <SceneSheet onClose={() => setSheet(null)} cf={game.cf} sceneNum={game.sceneNum} onInsert={handleInsert} />}
      {sheet === "meaning" && <MeaningSheet onClose={() => setSheet(null)} onInsert={handleInsert} />}
      {sheet === "endscene" && <EndSceneSheet onClose={() => setSheet(null)} cf={game.cf} sceneNum={game.sceneNum} onCFChange={(v) => updateGame({ cf: v })} npcs={game.npcs} threads={game.threads} onNpcsChange={(npcs) => updateGame({ npcs })} onThreadsChange={(threads) => updateGame({ threads })} />}
      {sheet === "combat" && <CombatSheet onClose={() => setSheet(null)} onInsert={handleInsert} character={game.character} onCharUpdate={(ch) => updateGame({ character: ch })} />}
      {sheet === "note" && <NoteSheet onClose={() => setSheet(null)} onInsert={handleInsert} />}

    </div>
  );
}
