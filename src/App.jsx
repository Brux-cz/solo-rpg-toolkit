import { useState } from "react";

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

// ─── Ukázkový text v editoru ──────────────────────────────────────
function EditorArea() {
  return (
    <div style={{ padding: "14px 16px", fontFamily: FONT, fontSize: 13, lineHeight: 1.7, color: C.text, overflowY: "auto", height: "100%" }}>
      <p style={{ margin: "0 0 10px" }}>
        Ada se plíží temnou chodbou. Vzduch páchne plísní a ze stropu kape voda.
      </p>

      {/* Fate Q inline blok */}
      <div style={{ borderLeft: `3px solid ${C.green}`, background: C.green + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.muted, display: "flex", gap: 6 }}>
        <span>❓</span>
        <span>Je tu stráž?</span>
        <span>·</span>
        <span>Likely</span>
        <span>·</span>
        <span>d100=34</span>
        <span style={{ marginLeft: "auto", color: C.green, fontWeight: 700 }}>→ ANO</span>
      </div>

      <p style={{ margin: "10px 0" }}>
        Stráž tu je — tlustej krysák se sekerou. Nedívá se naším směrem. Ada čeká.
      </p>

      {/* Meaning inline blok */}
      <div style={{ borderLeft: `3px solid ${C.purple}`, background: C.purple + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.purple, display: "flex", gap: 6 }}>
        <span>🔮</span>
        <span style={{ fontWeight: 600 }}>Abandon + Danger</span>
      </div>

      <p style={{ margin: "10px 0" }}>
        Cosi ji táhne zpátky. Pocit nebezpečí. Rozhlédne se — druhá chodba. Nikdo ji nehlídá.
      </p>

      {/* Scene blok */}
      <div style={{ margin: "12px 0" }}>
        <div style={{ height: 1, background: C.blue + "55" }} />
        <div style={{ borderLeft: `3px solid ${C.blue}`, background: C.blue + "12", padding: "6px 10px", margin: "2px 0" }}>
          <div style={{ fontSize: 9, color: C.blue, fontWeight: 700, letterSpacing: 1 }}>🎬 SCÉNA 5</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Ada prochází jeskyní</div>
          <div style={{ fontSize: 9, color: C.muted }}>Očekávaná · CF 5</div>
        </div>
        <div style={{ height: 1, background: C.blue + "55" }} />
      </div>

      <p style={{ margin: "10px 0" }}>
        Nová scéna. Ada se rozhodne projít nechráněnou chodbou za krysákem.
      </p>

      {/* Kurzor */}
      <span style={{ display: "inline-block", width: 2, height: 14, background: C.green, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────
function Header({ onToggle, expanded }) {
  return (
    <div onClick={onToggle} style={{ padding: "9px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", flexShrink: 0, fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>
          <span style={{ color: C.blue, fontWeight: 700 }}>Scéna 4</span>
          <span style={{ color: C.border }}> · </span>
          <span style={{ color: C.text }}>CF <span style={{ color: C.yellow, fontWeight: 700 }}>5</span></span>
        </span>
        <span style={{ color: C.muted }}>
          Den 2 · ráno{expanded && <span> · <span style={{ color: C.blue }}>Zataženo</span></span>}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 6, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><span style={{ color: C.green }}>STR</span> 8/8  <span style={{ color: C.green }}>DEX</span> 10/10  <span style={{ color: C.green }}>WIL</span> 7/7</span>
            <span><span style={{ color: C.red }}>BO</span> 0/4  <span style={{ color: C.yellow }}>Peril</span> 2/2</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Kuráž: 0  Ďobky: <span style={{ color: C.yellow }}>12</span></span>
            <span>Úr. 1  ZK 3/6</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Plný toolbar (Stav A) ────────────────────────────────────────
function ActionToolbar({ onFateOpen, onSceneOpen, onMeaningOpen, onEndSceneOpen, onCombatOpen }) {
  return (
    <div style={{ padding: "6px 12px 5px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, fontFamily: FONT }}>
      <div style={{ fontSize: 8, color: C.border, letterSpacing: 0.8, marginBottom: 4, textTransform: "uppercase" }}>Vložit:</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { icon: "🎬", label: "Scéna", fn: onSceneOpen },
          { icon: "❓", label: "Fate", fn: onFateOpen, accent: true },
          { icon: "🔮", fn: onMeaningOpen },
          { icon: "⚔️", fn: onCombatOpen },
          { icon: "📝" },
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

// ─── Simulovaná klávesnice ────────────────────────────────────────
function FakeKeyboard() {
  const rows = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    ["⇧",...("zxcvbnm".split("")),"⌫"],
  ];
  return (
    <div style={{ background: "#d1d5db", padding: "8px 4px 16px", flexShrink: 0 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 4 }}>
          {row.map((k, ki) => (
            <div key={ki} style={{ background: ["⇧","⌫"].includes(k) ? "#adb5bd" : "white", borderRadius: 5, width: ["⇧","⌫"].includes(k) ? 36 : 30, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: FONT, boxShadow: "0 1px 0 #8a8a8a", cursor: "pointer" }}>{k}</div>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
        {["🌐","                    ","↩"].map((k, i) => (
          <div key={i} style={{ background: i === 1 ? "white" : "#adb5bd", borderRadius: 5, width: i === 1 ? 180 : 44, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: FONT, boxShadow: "0 1px 0 #8a8a8a" }}>{k}</div>
        ))}
      </div>
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
function FateSheet({ onClose }) {
  const [step, setStep] = useState("input");
  const [odds, setOdds] = useState(5);
  const oddsLabels = ["Impossible","No way","V.unlikely","Unlikely","50/50","Likely","V.likely","Near sure","Sure thing","Has to be"];

  return (
    <Sheet title="❓ FATE QUESTION" onClose={onClose}>
      {step === "input" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>OTÁZKA:</div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 12, background: "white", fontFamily: FONT }}>
            Je tu stráž?<span style={{ borderLeft: `1.5px solid ${C.green}`, marginLeft: 1 }}>&nbsp;</span>
          </div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>ODDS:</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
            {oddsLabels.map((o, i) => (
              <button key={i} onClick={() => setOdds(i)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 20, border: `1px solid ${i === odds ? C.green : C.border}`, background: i === odds ? C.green : "transparent", color: i === odds ? "white" : C.muted, fontSize: 10, fontFamily: FONT, cursor: "pointer", whiteSpace: "nowrap" }}>{o}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>CF: <span style={{ color: C.yellow, fontWeight: 700 }}>5</span></div>
          <button onClick={() => setStep("result")} style={{ width: "100%", height: 46, background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: "pointer", letterSpacing: 1 }}>🎲  HODIT</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>Je tu stráž? · Likely · CF 5<br /><span style={{ fontWeight: 700, color: C.text }}>d100 = 34</span></div>
          <div style={{ background: C.green + "20", border: `2px solid ${C.green}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.green, letterSpacing: 3, fontFamily: FONT }}>A N O</div>
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>Exceptional: ne  ·  Random Event: ne</div>
          <button onClick={onClose} style={{ width: "100%", height: 46, background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      )}
    </Sheet>
  );
}

// ─── Scéna Sheet ──────────────────────────────────────────────────
function SceneSheet({ onClose }) {
  const [step, setStep] = useState("input");
  return (
    <Sheet title="🎬 NOVÁ SCÉNA" onClose={onClose}>
      {step === "input" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, fontFamily: FONT }}>CO OČEKÁVÁŠ?</div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, marginBottom: 12, background: "white", fontFamily: FONT, color: C.muted }}>Ada projde jeskyní bez boje…</div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>CF: <span style={{ color: C.yellow, fontWeight: 700 }}>5</span>  ·  Test: d10 vs CF</div>
          <button onClick={() => setStep("result")} style={{ width: "100%", height: 46, background: C.blue, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>TESTOVAT CHAOS</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>d10 = 3  (3 ≤ 5 = pod CF, lichý)</div>
          <div style={{ background: C.yellow + "20", border: `2px solid ${C.yellow}`, borderRadius: 8, padding: "10px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.yellow, letterSpacing: 2, fontFamily: FONT }}>POZMĚNĚNÁ!</div>
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, fontFamily: FONT, lineHeight: 1.6 }}>Scene Adjustment d10=7: <span style={{ color: C.text, fontWeight: 600 }}>DVĚ úpravy</span><br />1. Přidej postavu  2. Zvyš aktivitu</div>
          <button onClick={onClose} style={{ width: "100%", height: 46, background: C.blue, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT SCÉNU</button>
        </>
      )}
    </Sheet>
  );
}

// ─── Meaning Sheet ────────────────────────────────────────────────
function MeaningSheet({ onClose }) {
  const [typ, setTyp] = useState(null);
  return (
    <Sheet title="🔮 MEANING TABLES" onClose={onClose}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["Actions","Descriptions","Elements ▾"].map((t, i) => (
          <button key={i} onClick={() => setTyp(t)} style={{ flex: 1, padding: "6px 0", border: `1px solid ${typ === t ? C.purple : C.border}`, background: typ === t ? C.purple : "transparent", color: typ === t ? "white" : C.muted, borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      {typ ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>d100 = 67, d100 = 23</div>
          <div style={{ background: C.purple + "20", border: `2px solid ${C.purple}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.purple, fontFamily: FONT }}>Abandon + Danger</div>
          </div>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>Interpretuj v kontextu scény</div>
          <button onClick={onClose} style={{ width: "100%", height: 46, background: C.purple, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>Vyber typ tabulky ↑</div>
      )}
    </Sheet>
  );
}

// ─── Konec Scény Sheet ────────────────────────────────────────────
function EndSceneSheet({ onClose }) {
  const [cf, setCF] = useState(null);
  return (
    <Sheet title="📕 KONEC SCÉNY 4" onClose={onClose}>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 8, fontFamily: FONT }}>MĚLA POSTAVA KONTROLU?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setCF("minus")} style={{ flex: 1, padding: "10px 0", border: `1px solid ${cf==="minus" ? C.green : C.border}`, background: cf==="minus" ? C.green + "22" : "transparent", borderRadius: 8, fontSize: 11, fontFamily: FONT, cursor: "pointer", color: C.green, fontWeight: cf==="minus" ? 700 : 400 }}>ANO → CF−1<br /><span style={{ fontSize: 10 }}>5 → 4</span></button>
        <button onClick={() => setCF("plus")} style={{ flex: 1, padding: "10px 0", border: `1px solid ${cf==="plus" ? C.red : C.border}`, background: cf==="plus" ? C.red + "22" : "transparent", borderRadius: 8, fontSize: 11, fontFamily: FONT, cursor: "pointer", color: C.red, fontWeight: cf==="plus" ? 700 : 400 }}>NE → CF+1<br /><span style={{ fontSize: 10 }}>5 → 6</span></button>
      </div>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, fontFamily: FONT }}>── THREADY ──</div>
      {[["Kočičí daň","3/10"],["Adino zajetí","1/10"]].map(([name, prog]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6 }}>
          <span style={{ flex: 1, fontSize: 11, fontFamily: FONT }}>{name}</span>
          <span style={{ fontSize: 10, color: C.muted, fontFamily: FONT }}>{prog}</span>
          <button style={{ width: 24, height: 24, border: `1px solid ${C.border}`, borderRadius: 4, background: "transparent", cursor: "pointer", fontSize: 12 }}>+</button>
        </div>
      ))}
      <button onClick={onClose} style={{ width: "100%", height: 46, background: C.text, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer", marginTop: 8 }}>UKONČIT SCÉNU</button>
    </Sheet>
  );
}

// ─── Boj Sheet ────────────────────────────────────────────────────
function CombatSheet({ onClose }) {
  const [step, setStep] = useState("setup");
  return (
    <Sheet title="⚔️ BOJ" onClose={onClose}>
      {step === "setup" ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT }}>NEPŘÍTEL:</div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontFamily: FONT }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Pavouk</span>
              <span style={{ fontSize: 10, color: C.muted, border: `1px solid ${C.border}`, padding: "2px 8px", borderRadius: 12, cursor: "pointer" }}>Z DB ▾</span>
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>STR 3  BO 1  Zbraň d6</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["Rychlý (1 hod)","Detailní (kola)"].map((m, i) => (
              <button key={i} style={{ flex: 1, padding: "7px 0", border: `1px solid ${i===0 ? C.red : C.border}`, background: i===0 ? C.red+"22" : "transparent", borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer", fontWeight: i===0?700:400, color: i===0?C.red:C.muted }}>{m}</button>
            ))}
          </div>
          <button onClick={() => setStep("result")} style={{ width: "100%", height: 46, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>⚔️  BOJOVAT</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>Iniciativa: Ada DEX 10 vs Pavouk DEX 6 → Ada začíná</div>
          <div style={{ background: C.green + "20", border: `2px solid ${C.green}`, borderRadius: 8, padding: "10px", marginBottom: 10, fontFamily: FONT, fontSize: 11 }}>
            <div style={{ fontWeight: 700, color: C.green, marginBottom: 4 }}>🏆 VÍTĚZSTVÍ!</div>
            <div style={{ color: C.text }}>Ada: d6=4 dmg → Pavouk STR 3→0 → mrtvý</div>
            <div style={{ color: C.green, marginTop: 4 }}>Ada: bez zranění</div>
          </div>
          <button onClick={onClose} style={{ width: "100%", height: 46, background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
        </>
      )}
    </Sheet>
  );
}

// ─── Postava Tab ──────────────────────────────────────────────────
function PostavaTab() {
  return (
    <div style={{ padding: "14px 16px", overflowY: "auto", height: "100%", fontFamily: FONT }}>
      {/* Identita */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Ada Katzenreiserová</span>
          <span style={{ fontSize: 10, color: C.muted }}>Úr. 1</span>
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Kuchařka · ZK 3/6 · Ďobky <span style={{ color: C.yellow, fontWeight: 700 }}>12</span></div>
      </div>

      {/* Staty */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        {[["STR","8","8",C.green],["DEX","10","10",C.green],["WIL","7","7",C.green],["BO","0","4",C.red]].map(([stat,cur,max,col]) => (
          <div key={stat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 28, fontSize: 10, fontWeight: 700, color: col }}>{stat}</span>
            <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(parseInt(cur)/parseInt(max))*100}%`, height: "100%", background: col, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 10, color: C.muted, width: 36, textAlign: "right" }}>{cur}/{max}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: C.muted }}>
          <span>Kuráž: <span style={{ color: C.text }}>0</span></span>
          <span>Peril: <span style={{ color: C.yellow }}>2/2</span></span>
        </div>
      </div>

      {/* Inventář */}
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

      {/* Pomocník */}
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
function SvetTab() {
  const [sub, setSub] = useState("mythic");
  const subs = [["mythic","Mythic"],["npc","NPC"],["thready","Thready"],["mapa","Mapa"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT }}>
      {/* Sub-tabs */}
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
              <span style={{ fontSize: 22, fontWeight: 700, color: C.yellow }}>5</span>
              <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "50%", height: "100%", background: C.yellow, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 9, color: C.muted }}>1–9</span>
            </div>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>NPC SEZNAM (5/25)</div>
            {[["Hrách","1×"],["Šedivec","3×","!"],["Líska","2×"],["Kříž","1×"],["Krysy","2×"]].map(([n,w,flag]) => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, fontSize: 11 }}>
                <span>{n}</span>
                <span style={{ color: flag?C.red:C.muted }}>{w}{flag&&" ⚠️"}</span>
              </div>
            ))}
            <div style={{ fontSize: 9, color: C.muted, margin: "12px 0 6px" }}>THREAD SEZNAM (2/25)</div>
            {[["Kočičí daň","2×","3/10"],["Adino zajetí","1×","1/10"]].map(([n,w,p]) => (
              <div key={n} style={{ padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span>{n}</span><span style={{ color: C.muted }}>{w} · {p}</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: p.split("/")[0]==="3"?"30%":"10%", height: "100%", background: C.purple }} />
                </div>
              </div>
            ))}
          </>
        )}
        {sub === "npc" && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 40 }}>NPC karty — připravujeme</div>
        )}
        {sub === "thready" && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 40 }}>Thread detail — připravujeme</div>
        )}
        {sub === "mapa" && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 40 }}>Hexcrawl mapa — placeholder</div>
        )}
      </div>
    </div>
  );
}

// ─── Hlavní App ───────────────────────────────────────────────────
export default function Prototype() {
  const [tab, setTab] = useState("diary");
  const [sheet, setSheet] = useState(null); // "fate"|"scene"|"meaning"|"endscene"|"combat"
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);

  const sheetOpen = !!sheet;

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
        <Header expanded={headerExpanded} onToggle={() => setHeaderExpanded(x => !x)} />
      )}

      {/* Editor / Postava / Svět */}
      <div style={{ flex: 1, overflow: "hidden", maxHeight: sheetOpen ? "calc(50% - 10px)" : undefined }}>
        {tab === "diary" && <EditorArea />}
        {tab === "char" && <PostavaTab />}
        {tab === "world" && <SvetTab />}
      </div>

      {/* Toolbar — mini nad klávesnicí, plný jinak */}
      {tab === "diary" && (
        showKeyboard
          ? <MiniToolbar />
          : <ActionToolbar
              onFateOpen={() => { setSheet("fate"); setShowKeyboard(false); }}
              onSceneOpen={() => { setSheet("scene"); setShowKeyboard(false); }}
              onMeaningOpen={() => { setSheet("meaning"); setShowKeyboard(false); }}
              onEndSceneOpen={() => { setSheet("endscene"); setShowKeyboard(false); }}
              onCombatOpen={() => { setSheet("combat"); setShowKeyboard(false); }}
            />
      )}

      {/* Bottom nav — schová se při klávesnici */}
      {!showKeyboard && <BottomNav active={tab} onChange={setTab} />}

      {/* Simulovaná klávesnice */}
      {showKeyboard && <FakeKeyboard />}

      {/* Sheets */}
      {sheet === "fate" && <FateSheet onClose={() => setSheet(null)} />}
      {sheet === "scene" && <SceneSheet onClose={() => setSheet(null)} />}
      {sheet === "meaning" && <MeaningSheet onClose={() => setSheet(null)} />}
      {sheet === "endscene" && <EndSceneSheet onClose={() => setSheet(null)} />}
      {sheet === "combat" && <CombatSheet onClose={() => setSheet(null)} />}

      {/* Dev helper — přepínání klávesnice */}
      {tab === "diary" && !sheet && (
        <div onClick={() => setShowKeyboard(x => !x)} style={{ position: "fixed", bottom: showKeyboard ? 240 : 70, right: 12, background: showKeyboard ? C.text : C.border, color: showKeyboard ? "white" : C.muted, padding: "4px 10px", borderRadius: 20, fontSize: 10, cursor: "pointer", zIndex: 99, fontFamily: FONT }}>
          {showKeyboard ? "⌨️ skrýt" : "⌨️ ukázat"}
        </div>
      )}
    </div>
  );
}
