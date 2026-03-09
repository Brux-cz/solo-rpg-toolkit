import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { roll } from "../../utils/dice.js";
import {
  BACKGROUND_TABLE, WEAPON_CHOICES, BIRTHSIGN, FUR_COLOR, FUR_PATTERN,
  TRAIT, NAMES, SURNAMES,
} from "../../constants/tables.js";
import Sheet from "../ui/Sheet.jsx";

// --- Helpers ---

function roll3d6keep2() {
  const d = [roll(6), roll(6), roll(6)].sort((a, b) => b - a);
  return d[0] + d[1];
}

function rollD66() {
  return roll(6) * 10 + roll(6);
}

function rollName() {
  let r;
  do { r = roll(100); } while (r === 50);
  const idx = r < 50 ? r - 1 : r - 2; // skip 50
  return NAMES[idx] || NAMES[0];
}

function rollSurname() {
  return SURNAMES[roll(20) - 1];
}

function parseBackgroundItem(str) {
  if (str.startsWith("Kouzlo:")) return { nazev: str.slice(7), typ: "kouzlo", tecky: { akt: 3, max: 3 }, sloty: 1, span: { rows: 1, cols: 1 } };
  if (str === "Štít a kabátec") return { nazev: str, typ: "zbroj", obrana: 1, tecky: { akt: 3, max: 3 }, sloty: 2, span: { rows: 1, cols: 2 } };
  if (str === "Olověný plášť") return { nazev: str, typ: "zbroj", obrana: 1, tecky: { akt: 3, max: 3 }, sloty: 2, span: { rows: 2, cols: 1 } };
  const heavy = str.match(/^(.+)\s+d10$/);
  if (heavy) return { nazev: heavy[1], typ: "zbraň", dmg: "d10", tecky: { akt: 3, max: 3 }, sloty: 2, span: { rows: 2, cols: 1 } };
  const med = str.match(/^(.+)\s+d6\/d8$/);
  if (med) return { nazev: med[1], typ: "zbraň", dmg: "d8", tecky: { akt: 3, max: 3 }, sloty: 1, span: { rows: 1, cols: 1 } };
  const light = str.match(/^(.+)\s+d6$/);
  if (light) return { nazev: light[1], typ: "zbraň", dmg: "d6", tecky: { akt: 3, max: 3 }, sloty: 1, span: { rows: 1, cols: 1 } };
  if (str === "Lucerna") return { nazev: str, typ: "světlo", tecky: { akt: 3, max: 3 }, sloty: 1, span: { rows: 1, cols: 1 } };
  if (str === "Elektrická lampa") return { nazev: str, typ: "světlo", tecky: { akt: 6, max: 6 }, sloty: 1, span: { rows: 1, cols: 1 } };
  if (str.startsWith("Pomocník:")) return { _pomocnik: true, popis: str.slice(9).trim() };
  return { nazev: str, typ: "nástroj", tecky: { akt: 3, max: 3 }, sloty: 1, span: { rows: 1, cols: 1 } };
}

const EMPTY_SLOT = () => ({ nazev: "", typ: "", tecky: { akt: 0, max: 0 }, sloty: 1, span: { rows: 1, cols: 1 } });

// Grid: 5 sloupců × 2 řádky
// idx: 0=PackaL 2=Tělo1 4=Batoh 6=Batoh 8=Batoh
//      1=PackaR 3=Tělo2 5=Batoh 7=Batoh 9=Batoh
function idxToRowCol(idx) {
  const col = Math.floor(idx / 2);
  const row = idx % 2;
  return { row, col };
}

function canPlace(inv, item, startIdx) {
  const span = item.span || { rows: 1, cols: 1 };
  const { row: sr, col: sc } = idxToRowCol(startIdx);
  for (let r = 0; r < span.rows; r++) {
    for (let c = 0; c < span.cols; c++) {
      const tr = sr + r;
      const tc = sc + c;
      if (tr > 1 || tc > 4) return false;
      const ti = tc * 2 + tr;
      if (inv[ti].nazev !== "" || inv[ti]._occupied) return false;
    }
  }
  return true;
}

function placeItem(inv, item, preferredStart) {
  const tryPlace = (startIdx) => {
    if (!canPlace(inv, item, startIdx)) return false;
    const span = item.span || { rows: 1, cols: 1 };
    const { row: sr, col: sc } = idxToRowCol(startIdx);
    inv[startIdx] = { ...item };
    for (let r = 0; r < span.rows; r++) {
      for (let c = 0; c < span.cols; c++) {
        if (r === 0 && c === 0) continue;
        const ti = (sc + c) * 2 + (sr + r);
        inv[ti] = { ...EMPTY_SLOT(), _occupied: true, _owner: startIdx };
      }
    }
    return true;
  };

  // Try preferred indices first
  if (preferredStart !== undefined) {
    if (Array.isArray(preferredStart)) {
      for (const idx of preferredStart) {
        if (tryPlace(idx)) return true;
      }
    } else {
      if (tryPlace(preferredStart)) return true;
    }
  }

  // Fallback: try all slots
  for (let i = 0; i < 10; i++) {
    if (tryPlace(i)) return true;
  }
  return false;
}

function buildInventory(weapon, bgItems, bonusItems) {
  const inv = Array.from({ length: 10 }, EMPTY_SLOT);
  const pomocnici = [];

  // 1. Zbraň → packa L (idx 0)
  const weaponItem = {
    nazev: weapon.nazev, typ: "zbraň", dmg: weapon.dmg,
    tecky: { akt: weapon.tecky, max: weapon.tecky },
    sloty: weapon.sloty, span: weapon.span,
    ...(weapon.jeImprovizovana ? { jeImprovizovana: true } : {}),
    ...(weapon.jeDalkova ? { jeDalkova: true } : {}),
  };
  placeItem(inv, weaponItem, 0);

  // 2. Pochodeň → batoh
  placeItem(inv, { nazev: "Pochodeň", typ: "světlo", tecky: { akt: 3, max: 3 }, sloty: 1, span: { rows: 1, cols: 1 } }, [4, 5, 6, 7, 8, 9]);

  // 3. Zásoby → batoh
  placeItem(inv, { nazev: "Cestovní zásoby", typ: "zásoby", tecky: { akt: 3, max: 3 }, sloty: 1, span: { rows: 1, cols: 1 } }, [4, 5, 6, 7, 8, 9]);

  // 4. Background items
  const allItems = [...bgItems, ...bonusItems];
  for (const item of allItems) {
    if (item._pomocnik) {
      pomocnici.push(createPomocnik(item.popis));
      continue;
    }
    // Smart placement
    let preferred;
    if (item.typ === "zbroj") preferred = [2, 3]; // tělo
    else if (item.typ === "zbraň") preferred = [0, 1, 4, 5, 6, 7, 8, 9]; // packy first, then batoh
    else preferred = [4, 5, 6, 7, 8, 9]; // batoh
    placeItem(inv, item, preferred);
  }

  return { inventar: inv, pomocnici };
}

function createPomocnik(popis) {
  const r2d6 = () => roll(6) + roll(6);
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    jmeno: rollName(),
    prijmeni: rollSurname(),
    role: popis,
    uroven: 1, zk: 0,
    str: { akt: r2d6(), max: 0 },
    dex: { akt: r2d6(), max: 0 },
    wil: { akt: r2d6(), max: 0 },
    bo: { akt: roll(6), max: 0 },
    denniMzda: 0,
    vernost: popis.includes("věrný") ? "věrný" : "běžný",
    aktivni: true,
    inventar: Array.from({ length: 6 }, EMPTY_SLOT),
  };
}

// Fix max = akt for pomocnik stats after creation
function fixPomocnikMax(p) {
  return {
    ...p,
    str: { ...p.str, max: p.str.akt },
    dex: { ...p.dex, max: p.dex.akt },
    wil: { ...p.wil, max: p.wil.akt },
    bo: { ...p.bo, max: p.bo.akt },
  };
}

// --- Styles ---
const S = {
  stepInfo: { fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT },
  btn: { background: C.green, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: FONT, cursor: "pointer", fontSize: 13 },
  btnDisabled: { background: C.border, color: C.muted, border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: FONT, cursor: "default", fontSize: 13 },
  btnSmall: { background: C.green, color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontFamily: FONT, cursor: "pointer", fontSize: 11 },
  btnOutline: { background: "transparent", color: C.green, border: `1px solid ${C.green}`, borderRadius: 6, padding: "6px 12px", fontFamily: FONT, cursor: "pointer", fontSize: 12 },
  box: { background: "#f0f0ee", borderRadius: 6, padding: 8, textAlign: "center", fontFamily: FONT },
  nav: { display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" },
  label: { fontSize: 11, color: C.muted, fontFamily: FONT, marginBottom: 2 },
};

// --- Component ---
export default function CharCreateSheet({ onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [attrs, setAttrs] = useState(null);
  const [swapSel, setSwapSel] = useState([]);
  const [bo, setBo] = useState(null);
  const [dobky, setDobky] = useState(null);
  const [bonusBg, setBonusBg] = useState(null);
  const [bonusChoice, setBonusChoice] = useState(null);
  const [weaponIdx, setWeaponIdx] = useState(null);
  const [appearance, setAppearance] = useState({ znameni: null, barva: null, vzor: null, rys: null, jmeno: "", prijmeni: "" });

  const maxAttr = attrs ? Math.max(attrs.str, attrs.dex, attrs.wil) : 12;
  const safetyNet = maxAttr <= 9 ? (maxAttr <= 7 ? "oba" : "jeden") : null;

  const canNext = () => {
    if (step === 1) return attrs !== null;
    if (step === 2) return bo !== null;
    if (step === 3) return safetyNet && bonusBg ? bonusChoice !== null : true;
    if (step === 4) return weaponIdx !== null;
    if (step === 5) return appearance.jmeno.trim() !== "";
    return false;
  };

  const handleBack = () => step > 1 ? setStep(step - 1) : onClose();

  const handleNext = () => {
    if (step === 5) {
      assembleAndComplete();
    } else {
      setStep(step + 1);
    }
  };

  const assembleAndComplete = () => {
    const bg = BACKGROUND_TABLE[bo - 1][dobky - 1];
    const bgItems = [parseBackgroundItem(bg.itemA), parseBackgroundItem(bg.itemB)];

    let bonusItems = [];
    if (bonusBg && bonusChoice) {
      const bA = parseBackgroundItem(bonusBg.itemA);
      const bB = parseBackgroundItem(bonusBg.itemB);
      if (bonusChoice === "oba") bonusItems = [bA, bB];
      else if (bonusChoice === "A") bonusItems = [bA];
      else if (bonusChoice === "B") bonusItems = [bB];
    }

    const weapon = WEAPON_CHOICES[weaponIdx];
    const { inventar, pomocnici } = buildInventory(weapon, bgItems, bonusItems);

    // Fix pomocnik max values
    const fixedPomocnici = pomocnici.map(fixPomocnikMax);

    const char = {
      jmeno: appearance.jmeno.trim(),
      prijmeni: appearance.prijmeni.trim(),
      puvod: bg.nazev,
      uroven: 1, zk: 0, kuraz: 0,
      str: { akt: attrs.str, max: attrs.str },
      dex: { akt: attrs.dex, max: attrs.dex },
      wil: { akt: attrs.wil, max: attrs.wil },
      bo: { akt: bo, max: bo },
      znameni: appearance.znameni !== null ? BIRTHSIGN[appearance.znameni] : "",
      barvaSrsti: appearance.barva !== null ? FUR_COLOR[appearance.barva] : "",
      vzorSrsti: appearance.vzor !== null ? FUR_PATTERN[appearance.vzor] : "",
      vyraznyRys: appearance.rys !== null ? (TRAIT[appearance.rys] || "") : "",
      dobky,
      inventar,
      pomocnici: fixedPomocnici,
    };
    onComplete(char);
  };

  // --- Roll handlers ---
  const rollAttrs = () => {
    setAttrs({ str: roll3d6keep2(), dex: roll3d6keep2(), wil: roll3d6keep2() });
    setSwapSel([]);
  };

  const handleAttrClick = (key) => {
    if (!attrs) return;
    const next = [...swapSel, key];
    if (next.length === 2) {
      if (next[0] !== next[1]) {
        setAttrs({ ...attrs, [next[0]]: attrs[next[1]], [next[1]]: attrs[next[0]] });
      }
      setSwapSel([]);
    } else {
      setSwapSel(next);
    }
  };

  const rollBoDobky = () => {
    setBo(roll(6));
    setDobky(roll(6));
    setBonusBg(null);
    setBonusChoice(null);
  };

  const rollBonusBg = () => {
    const r1 = roll(6), r2 = roll(6);
    setBonusBg(BACKGROUND_TABLE[r1 - 1][r2 - 1]);
    setBonusChoice(null);
  };

  const rollAllAppearance = () => {
    setAppearance({
      znameni: roll(6) - 1,
      barva: roll(6) - 1,
      vzor: roll(6) - 1,
      rys: rollD66(),
      jmeno: rollName(),
      prijmeni: rollSurname(),
    });
  };

  const rerollField = (field) => {
    if (field === "znameni") setAppearance(a => ({ ...a, znameni: roll(6) - 1 }));
    else if (field === "barva") setAppearance(a => ({ ...a, barva: roll(6) - 1 }));
    else if (field === "vzor") setAppearance(a => ({ ...a, vzor: roll(6) - 1 }));
    else if (field === "rys") setAppearance(a => ({ ...a, rys: rollD66() }));
    else if (field === "jmeno") setAppearance(a => ({ ...a, jmeno: rollName() }));
    else if (field === "prijmeni") setAppearance(a => ({ ...a, prijmeni: rollSurname() }));
  };

  // --- Render steps ---
  const renderStep1 = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <button style={S.btn} onClick={rollAttrs}>{attrs ? "Hodit znovu" : "Hodit"}</button>
      </div>
      {attrs && (
        <>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            {["str", "dex", "wil"].map(k => (
              <div key={k} onClick={() => handleAttrClick(k)} style={{
                ...S.box, flex: 1, cursor: "pointer",
                border: swapSel.includes(k) ? `2px solid ${C.green}` : "2px solid transparent",
              }}>
                <div style={S.label}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: FONT }}>{attrs[k]}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT }}>
            Klikni na dvě vlastnosti k prohození
          </div>
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <button style={S.btn} onClick={rollBoDobky}>{bo !== null ? "Hodit znovu" : "Hodit"}</button>
      </div>
      {bo !== null && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <div style={{ ...S.box, flex: 1 }}>
            <div style={S.label}>BO</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: FONT }}>{bo}</div>
          </div>
          <div style={{ ...S.box, flex: 1 }}>
            <div style={S.label}>Ďobky</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: FONT }}>{dobky}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => {
    if (bo === null) return <div style={{ color: C.muted, textAlign: "center", fontFamily: FONT }}>Nejdřív hoď BO a Ďobky</div>;
    const bg = BACKGROUND_TABLE[bo - 1][dobky - 1];
    return (
      <div>
        <div style={{ ...S.box, marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, fontFamily: FONT, marginBottom: 4 }}>{bg.nazev}</div>
          <div style={{ fontSize: 12, fontFamily: FONT, color: C.text }}>A: {bg.itemA}</div>
          <div style={{ fontSize: 12, fontFamily: FONT, color: C.text }}>B: {bg.itemB}</div>
        </div>
        {safetyNet && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontSize: 11, color: C.yellow, fontFamily: FONT, marginBottom: 6, textAlign: "center" }}>
              Záchranná síť (max vlastnost {maxAttr} ≤ {safetyNet === "oba" ? 7 : 9})
            </div>
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <button style={S.btnOutline} onClick={rollBonusBg}>
                {bonusBg ? "Hodit znovu" : "Bonus hod"}
              </button>
            </div>
            {bonusBg && (
              <div style={{ ...S.box, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13, fontFamily: FONT, marginBottom: 4 }}>{bonusBg.nazev}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 6 }}>
                  {safetyNet === "oba" ? (
                    <button
                      style={bonusChoice === "oba" ? { ...S.btnSmall } : { ...S.btnSmall, background: C.border, color: C.text }}
                      onClick={() => setBonusChoice("oba")}
                    >
                      Oba: A + B
                    </button>
                  ) : (
                    <>
                      <button
                        style={bonusChoice === "A" ? { ...S.btnSmall } : { ...S.btnSmall, background: C.border, color: C.text }}
                        onClick={() => setBonusChoice("A")}
                      >
                        A: {bonusBg.itemA}
                      </button>
                      <button
                        style={bonusChoice === "B" ? { ...S.btnSmall } : { ...S.btnSmall, background: C.border, color: C.text }}
                        onClick={() => setBonusChoice("B")}
                      >
                        B: {bonusBg.itemB}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {WEAPON_CHOICES.map((w, i) => (
        <div key={i} onClick={() => setWeaponIdx(i)} style={{
          ...S.box, cursor: "pointer", textAlign: "left", padding: "8px 10px",
          border: weaponIdx === i ? `2px solid ${C.green}` : `2px solid ${C.border}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, fontFamily: FONT }}>{w.nazev}</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>
            {w.dmg} · {w.sloty === 2 ? "2 sloty" : "1 slot"}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep5 = () => {
    const a = appearance;
    const row = (label, value, field) => (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <button style={S.btnSmall} onClick={() => rerollField(field)}>🎲</button>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT, minWidth: 60 }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: FONT, color: C.text }}>{value || "—"}</span>
      </div>
    );
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <button style={S.btn} onClick={rollAllAppearance}>Hodit vše</button>
        </div>
        {row("Znamení", a.znameni !== null ? BIRTHSIGN[a.znameni] : null, "znameni")}
        {row("Barva", a.barva !== null ? FUR_COLOR[a.barva] : null, "barva")}
        {row("Vzor", a.vzor !== null ? FUR_PATTERN[a.vzor] : null, "vzor")}
        {row("Rys", a.rys !== null ? (TRAIT[a.rys] || `? (${a.rys})`) : null, "rys")}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={S.label}>Jméno</div>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={S.btnSmall} onClick={() => rerollField("jmeno")}>🎲</button>
              <input
                value={a.jmeno}
                onChange={e => setAppearance(prev => ({ ...prev, jmeno: e.target.value }))}
                style={{ flex: 1, fontFamily: FONT, fontSize: 13, padding: "4px 6px", border: `1px solid ${C.border}`, borderRadius: 4, background: C.bg, color: C.text }}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={S.label}>Příjmení</div>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={S.btnSmall} onClick={() => rerollField("prijmeni")}>🎲</button>
              <input
                value={a.prijmeni}
                onChange={e => setAppearance(prev => ({ ...prev, prijmeni: e.target.value }))}
                style={{ flex: 1, fontFamily: FONT, fontSize: 13, padding: "4px 6px", border: `1px solid ${C.border}`, borderRadius: 4, background: C.bg, color: C.text }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const STEP_TITLES = ["", "Vlastnosti", "BO a Ďobky", "Původ", "Zbraň", "Vzhled"];

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Tvorba postavy — tvá myš se rodí</div>
      <div style={{ marginBottom: 12 }}>
        Pět kroků k nové myší postavě. Hoď si na staty, zjisti odkud pocházíš, vyber si zbraň a vymysli jak vypadáš.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.green + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: každá myš má jiný příběh. Kostky rozhodnou kde jsi vyrůstal a co umíš — zbytek je na tobě.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>1. Vlastnosti (STR/DEX/WIL)</div>
      <div style={{ marginBottom: 4 }}>
        Hoď 3d6 a ponech dvě nejlepší pro každou vlastnost. Můžeš kliknout na dvě vlastnosti a prohodit je.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        STR 8, DEX 11, WIL 6 → prohodíš DEX a WIL → STR 8, DEX 6, WIL 11.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>2. Body odolnosti a ďobky</div>
      <div style={{ marginBottom: 10 }}>
        BO (d6) určuje kolik zásahů vydržíš než začneš ztrácet vlastnosti. Ďobky (d6) jsou peníze.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>3. Původ</div>
      <div style={{ marginBottom: 4 }}>
        Podle BO a ďobků se určí tvůj původ — každý má dva startovní předměty. Slabé myši (nízké staty) mají bonus navíc.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        BO 3, Ďobky 4 → „Mlynář" → Pytel mouky + Sekáček d6.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>4. Zbraň</div>
      <div style={{ marginBottom: 10 }}>
        Vyber si startovní zbraň. Silnější zbraně zabírají víc místa v inventáři.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>5. Vzhled</div>
      <div style={{ marginBottom: 10 }}>
        Znamení, barva srsti, vzor, výrazný rys a jméno. Všechno můžeš hodit náhodně nebo napsat ručně.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Po dokončení se postava uloží a můžeš začít hrát. Otevři novou scénu a pusť se do dobrodružství!
      </div>
    </>
  );

  return (
    <Sheet title="TVORBA POSTAVY" onClose={onClose} help={helpContent}>
      <div style={S.stepInfo}>{step} / 5 — {STEP_TITLES[step]}</div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      <div style={S.nav}>
        <button style={S.btnOutline} onClick={handleBack}>
          {step > 1 ? "← Zpět" : "Zavřít"}
        </button>
        <button
          style={canNext() ? S.btn : S.btnDisabled}
          onClick={canNext() ? handleNext : undefined}
        >
          {step === 5 ? "Dokončit" : "Další →"}
        </button>
      </div>
    </Sheet>
  );
}
