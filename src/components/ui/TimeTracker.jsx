import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { roll, rollWeather } from "../../utils/dice.js";
import { WEATHER_TABLE } from "../../constants/tables.js";
import Sheet from "./Sheet.jsx";

const HLIDKY = ["ráno", "odpoledne", "večer", "noc"];
const OBDOBI = ["jaro", "léto", "podzim", "zima"];

export default function TimeTracker({ cas, onCasChange, onClose, onInsert }) {
  const [weatherResult, setWeatherResult] = useState(null);

  const update = (patch) => {
    onCasChange({ ...cas, ...patch });
  };

  const handleDenChange = (delta) => {
    const newDen = Math.max(1, cas.den + delta);
    if (newDen !== cas.den) {
      update({ den: newDen, pocasi: "", jeNepriznive: false, odpocinutoDnes: false });
      setWeatherResult(null);
    }
  };

  const handleHlidkaChange = (h) => {
    if (h !== cas.hlidka) {
      update({ hlidka: h, smena: 1 });
    }
  };

  const advanceHlidka = (idx) => {
    if (idx >= HLIDKY.length) {
      // noc → ráno = nový den
      const newDen = cas.den + 1;
      update({ hlidka: "ráno", smena: 1, den: newDen, pocasi: "", jeNepriznive: false, odpocinutoDnes: false });
      setWeatherResult(null);
      return;
    }
    update({ hlidka: HLIDKY[idx], smena: 1 });
  };

  const retreatHlidka = (idx) => {
    if (idx < 0) {
      // ráno underflow — zůstaň na ráno, směna 1
      update({ smena: 1 });
      return;
    }
    update({ hlidka: HLIDKY[idx], smena: 36 });
  };

  const handleSmenaChange = (delta) => {
    const newSmena = cas.smena + delta;
    if (newSmena > 36) {
      const hIdx = HLIDKY.indexOf(cas.hlidka);
      advanceHlidka(hIdx + 1);
    } else if (newSmena < 1) {
      const hIdx = HLIDKY.indexOf(cas.hlidka);
      retreatHlidka(hIdx - 1);
    } else {
      update({ smena: newSmena });
    }
  };

  const handleRandomHlidka = () => {
    const idx = roll(4) - 1;
    handleHlidkaChange(HLIDKY[idx]);
  };

  const handleRollWeather = () => {
    const result = rollWeather(cas.rocniObdobi);
    setWeatherResult(result);
    update({ pocasi: result.text, jeNepriznive: result.adverse });
  };

  const handleManualWeather = (entry) => {
    const result = { text: entry.text, adverse: entry.adverse, total: "—" };
    setWeatherResult(result);
    update({ pocasi: entry.text, jeNepriznive: entry.adverse });
  };

  const handleInsertWeather = () => {
    if (!weatherResult) return;
    onInsert({
      type: "text",
      text: `🌤️ Počasí: ${weatherResult.text} (2d6=${weatherResult.total})${weatherResult.adverse ? " ★ NEPŘÍZNIVÉ" : ""}`,
      ts: Date.now(),
    });
  };

  const btnStyle = (active) => ({
    padding: "6px 10px",
    fontSize: 11,
    fontFamily: FONT,
    fontWeight: active ? 700 : 400,
    background: active ? C.blue + "20" : "none",
    color: active ? C.blue : C.text,
    border: `1px solid ${active ? C.blue : C.border}`,
    borderRadius: 6,
    cursor: "pointer",
    flex: 1,
    textAlign: "center",
  });

  const pmBtn = {
    width: 28, height: 28, fontSize: 14, fontFamily: FONT, fontWeight: 700,
    background: "none", border: `1px solid ${C.blue}`, borderRadius: 6,
    color: C.blue, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <Sheet title="ČAS A POČASÍ" onClose={onClose}>
      {/* Roční období */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: 0.5 }}>ROČNÍ OBDOBÍ</div>
        <div style={{ display: "flex", gap: 6 }}>
          {OBDOBI.map(o => (
            <button key={o} onClick={() => update({ rocniObdobi: o })} style={btnStyle(cas.rocniObdobi === o)}>{o}</button>
          ))}
        </div>
      </div>

      {/* Den */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: 0.5 }}>DEN</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => handleDenChange(-1)} style={pmBtn}>−</button>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: FONT, minWidth: 40, textAlign: "center" }}>{cas.den}</span>
          <button onClick={() => handleDenChange(1)} style={pmBtn}>+</button>
        </div>
      </div>

      {/* Hlídka */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: C.muted, letterSpacing: 0.5 }}>HLÍDKA</span>
          <button onClick={handleRandomHlidka} style={{ background: "none", border: "none", cursor: "pointer", color: C.blue, fontSize: 10, padding: 0, fontFamily: FONT }}>🎲</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {HLIDKY.map(h => (
            <button key={h} onClick={() => handleHlidkaChange(h)} style={btnStyle(cas.hlidka === h)}>{h}</button>
          ))}
        </div>
      </div>

      {/* Směna */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: 0.5 }}>SMĚNA</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => handleSmenaChange(-1)} style={pmBtn}>−</button>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONT, minWidth: 50, textAlign: "center" }}>{cas.smena}<span style={{ color: C.muted, fontWeight: 400 }}>/36</span></span>
          <button onClick={() => handleSmenaChange(1)} style={pmBtn}>+</button>
        </div>
      </div>

      {/* Oddělovač */}
      <div style={{ borderTop: `1px solid ${C.border}`, margin: "10px 0 14px" }} />

      {/* Počasí */}
      <div style={{ marginBottom: 14 }}>
        <button onClick={handleRollWeather} style={{ width: "100%", padding: "10px 0", fontSize: 12, fontFamily: FONT, fontWeight: 700, background: C.blue, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          🎲 Hodit počasí (2d6)
        </button>
        {(weatherResult || cas.pocasi) && (
          <div style={{ marginTop: 10, fontSize: 12, fontFamily: FONT, textAlign: "center" }}>
            <span style={{ fontWeight: 700, color: (weatherResult?.adverse ?? cas.jeNepriznive) ? C.red : C.text }}>
              {weatherResult?.text || cas.pocasi}
            </span>
            {weatherResult && (
              <span style={{ color: C.muted }}> (2d6={weatherResult.total})</span>
            )}
            {(weatherResult?.adverse ?? cas.jeNepriznive) && (
              <span style={{ color: C.red, fontWeight: 700 }}> ★ NEPŘÍZNIVÉ</span>
            )}
          </div>
        )}
        {weatherResult && (
          <button onClick={handleInsertWeather} style={{ marginTop: 8, width: "100%", padding: "8px 0", fontSize: 11, fontFamily: FONT, fontWeight: 600, background: "none", color: C.blue, border: `1px solid ${C.blue}`, borderRadius: 6, cursor: "pointer" }}>
            📝 Zapsat do deníku
          </button>
        )}
        {/* Ruční výběr počasí */}
        <div style={{ textAlign: "center", fontSize: 10, color: C.muted, margin: "10px 0 6px" }}>— nebo vyber —</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {WEATHER_TABLE[cas.rocniObdobi].map((entry) => (
            <button
              key={entry.text}
              onClick={() => handleManualWeather(entry)}
              style={{
                padding: "6px 10px",
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: cas.pocasi === entry.text ? 700 : 400,
                background: cas.pocasi === entry.text ? (entry.adverse ? C.red + "15" : C.blue + "15") : "none",
                color: entry.adverse ? C.red : C.text,
                border: `1px solid ${cas.pocasi === entry.text ? (entry.adverse ? C.red : C.blue) : C.border}`,
                borderRadius: 6,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {entry.text}{entry.adverse ? " ★" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Odpočinek toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: FONT, color: C.text, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={cas.odpocinutoDnes}
            onChange={(e) => update({ odpocinutoDnes: e.target.checked })}
            style={{ accentColor: C.green }}
          />
          Odpočinuto dnes
        </label>
        {!cas.odpocinutoDnes && cas.hlidka === "noc" && (
          <span style={{ fontSize: 10, color: C.yellow, fontWeight: 600 }}>⚠ Neodpočinuto!</span>
        )}
      </div>
    </Sheet>
  );
}
